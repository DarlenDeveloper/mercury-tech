import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

const MODEL = "gemini-3-flash-preview";

// ─── Default store knowledge (overridable via Firestore config/ai) ───────────
const DEFAULT_STORE_INFO = `
Mercury Computers Limited — Uganda's trusted ICT & electronics retailer.
- Location: Plot 91, Kamwokya, Kira Road, Kampala, Uganda (near Rubis Petrol Station).
- Phone: 0707749501 / 0704823800
- Email: customercare@mercurycomputerslimited.com, sales@mercurycomputerslimited.com
- Delivery: Free delivery within Uganda on eligible items.
- Products: Official & brand new — laptops, desktops, printers, monitors, components,
  networking gear, phones, TVs, audio and accessories from HP, Lenovo, Dell, Apple,
  Epson, Canon, Microsoft and more.
- Payments: Secure checkout options available.
- Warranty: Products come with manufacturer warranty (typically 1 year unless stated).
`;

/**
 * Loads AI configuration (system prompt + knowledge base) from Firestore.
 * Admins can edit config/ai to change behaviour without redeploying.
 */
async function loadAiConfig(db) {
  try {
    const snap = await db.collection("config").doc("ai").get();
    if (snap.exists) {
      const data = snap.data();
      return {
        systemPrompt: data.systemPrompt || "",
        knowledgeBase: data.knowledgeBase || "",
        storeInfo: data.storeInfo || DEFAULT_STORE_INFO,
      };
    }
  } catch (e) {
    console.error("Failed to load AI config:", e);
  }
  return { systemPrompt: "", knowledgeBase: "", storeInfo: DEFAULT_STORE_INFO };
}

/**
 * Fetches a compact catalog snapshot for grounding (name, category, brand, price, stock).
 * Limited to keep the prompt within token budget.
 */
async function loadCatalog(db) {
  const snap = await db
    .collection("products")
    .where("status", "==", "published")
    .get();

  const rate = await loadRate(db);

  return snap.docs.map((d) => {
    const p = d.data();
    return {
      id: d.id,
      name: p.name,
      category: p.category,
      brand: p.brand || "",
      priceUgx: Math.round((p.priceUsd || 0) * rate),
      inStock: (p.stock || 0) > 0,
    };
  });
}

async function loadRate(db) {
  try {
    const snap = await db.collection("config").doc("rate").get();
    if (snap.exists) return snap.data()?.usdToUgx || 3780;
  } catch {
    /* ignore */
  }
  return 3780;
}

function buildSystemPrompt(config, catalog) {
  const catalogText = catalog
    .map(
      (p) =>
        `- ${p.name} | ${p.category}${p.brand ? " | " + p.brand : ""} | USh ${p.priceUgx.toLocaleString()} | ${p.inStock ? "In Stock" : "Out of Stock"} | id:${p.id}`
    )
    .join("\n");

  return `You are Mercury Assistant, the shopping and customer-service assistant for Mercury Computers Limited.

${config.systemPrompt || ""}

## STORE INFORMATION
${config.storeInfo}

${config.knowledgeBase ? `## KNOWLEDGE BASE (FAQ)\n${config.knowledgeBase}\n` : ""}

## PRODUCT CATALOG (the ONLY products you may recommend)
${catalogText}

## RULES
1. Only recommend products that appear in the catalog above. Never invent products, prices or specs.
2. IMPORTANT: Whenever you mention or recommend a specific product, you MUST append its tag in the exact form [[id:PRODUCT_ID]] immediately after mentioning it, using the id shown in the catalog. The app converts these tags into rich product cards (with image, price and link), so always include them. Do not show the raw id text to the user in any other way.
3. Keep prose short — briefly explain your pick, then let the product cards do the work. Recommend up to 4 products per reply.
4. For budget queries, respect the stated limit and prefer in-stock items.
5. For customer-service questions (delivery, returns, warranty, location, payment, hours), answer from the store information and knowledge base.
6. Stay strictly on topic: Mercury Computers products and services. Politely decline unrelated requests.
7. Be concise, friendly and helpful. Use Ugandan Shillings (USh) for prices.
8. If you don't have enough information, say so and suggest contacting customer care.`;
}

export const aiAgent = onCall(
  { secrets: [GEMINI_API_KEY], cors: true },
  async (request) => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in to use the assistant.");
    }

    const { message, history = [] } = request.data || {};
    if (!message || typeof message !== "string" || !message.trim()) {
      throw new HttpsError("invalid-argument", "A message is required.");
    }

    const db = getFirestore();
    const [config, catalog] = await Promise.all([loadAiConfig(db), loadCatalog(db)]);

    const systemPrompt = buildSystemPrompt(config, catalog);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: systemPrompt,
    });

    // Convert history to Gemini format
    const contents = [
      ...history
        .filter((m) => m && m.content)
        .map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: String(m.content) }],
        })),
      { role: "user", parts: [{ text: message.trim() }] },
    ];

    let reply;
    try {
      const result = await model.generateContent({ contents });
      reply = result.response.text();
    } catch (e) {
      console.error("Gemini error:", e);
      throw new HttpsError("internal", "The assistant is temporarily unavailable.");
    }

    // Log the conversation turn for admin review (best-effort)
    try {
      await db.collection("ai_conversations").add({
        userId: request.auth.uid,
        userEmail: request.auth.token?.email || "",
        message: message.trim(),
        reply,
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (e) {
      console.error("Failed to log AI conversation:", e);
    }

    return { reply };
  }
);
