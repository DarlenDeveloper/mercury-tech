import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { getFirestore } from "firebase-admin/firestore";

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

const MODEL = "gemini-2.0-flash";
const MAX_CATALOG_ITEMS = 40;

/**
 * AI shopping + customer-service assistant.
 *
 * Callable from web (httpsCallable) and mobile (cloud_functions).
 * Requires the caller to be authenticated.
 *
 * Request data: { message: string, history?: {role, content}[] }
 * Response: { reply: string, products?: [...] }
 */
export const aiAgent = onCall(
  { secrets: [GEMINI_API_KEY], cors: true },
  async (request) => {
    // 1. Require authentication
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be signed in to use the assistant."
      );
    }

    const message = (request.data?.message || "").toString().trim();
    if (!message) {
      throw new HttpsError("invalid-argument", "Message is required.");
    }

    const history = Array.isArray(request.data?.history)
      ? request.data.history.slice(-8) // keep last 8 turns for context
      : [];

    const db = getFirestore();

    // 2. Load catalog + settings in parallel
    const [productsSnap, settingsSnap, rateSnap] = await Promise.all([
      db.collection("products").get(),
      db.collection("config").doc("ai").get(),
      db.collection("config").doc("rate").get(),
    ]);

    const rate = rateSnap.exists ? rateSnap.data()?.usdToUgx ?? 3780 : 3780;
    const settings = settingsSnap.exists ? settingsSnap.data() : {};

    const allProducts = productsSnap.docs.map((d) => {
      const p = d.data();
      return {
        id: d.id,
        name: p.name || "",
        category: p.category || "",
        brand: p.brand || "",
        priceUgx: Math.round((p.priceUsd || 0) * rate),
        stock: p.stock || 0,
        shortDescription: p.shortDescription || "",
      };
    });

    // 3. Pre-filter to the most relevant products (keyword scoring)
    const relevant = rankProducts(allProducts, message).slice(0, MAX_CATALOG_ITEMS);

    // 4. Build the system prompt
    const systemPrompt = buildSystemPrompt(settings, relevant);

    // 5. Build the conversation contents for Gemini
    const contents = [];
    for (const turn of history) {
      contents.push({
        role: turn.role === "assistant" ? "model" : "user",
        parts: [{ text: String(turn.content || "") }],
      });
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    // 6. Call Gemini
    const reply = await callGemini(GEMINI_API_KEY.value(), systemPrompt, contents);

    // 7. Extract referenced products (any product whose name appears in reply)
    const referenced = relevant
      .filter((p) => reply.toLowerCase().includes(p.name.toLowerCase().slice(0, 20)))
      .slice(0, 6)
      .map((p) => ({ id: p.id, name: p.name, priceUgx: p.priceUgx }));

    // 8. Log the conversation (fire-and-forget)
    db.collection("ai_conversations")
      .add({
        uid: request.auth.uid,
        message,
        reply,
        createdAt: new Date(),
      })
      .catch(() => {});

    return { reply, products: referenced };
  }
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rankProducts(products, query) {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);

  // Detect a price ceiling like "under 3m", "below 200k", "under ush 500,000"
  let priceCeiling = null;
  const priceMatch = q.match(/(?:under|below|less than|max|up to)\s*(?:ush|ugx|shs?)?\s*([\d.,]+)\s*(m|k)?/i);
  if (priceMatch) {
    let n = parseFloat(priceMatch[1].replace(/,/g, ""));
    const unit = priceMatch[2]?.toLowerCase();
    if (unit === "m") n *= 1_000_000;
    else if (unit === "k") n *= 1_000;
    if (n > 0) priceCeiling = n;
  }

  const scored = products.map((p) => {
    let score = 0;
    const name = p.name.toLowerCase();
    const cat = p.category.toLowerCase();
    const brand = p.brand.toLowerCase();

    for (const t of terms) {
      if (name.includes(t)) score += 5;
      if (cat.includes(t)) score += 3;
      if (brand.includes(t)) score += 3;
      if (p.shortDescription.toLowerCase().includes(t)) score += 1;
    }

    // Price filter: within budget gets a boost, over budget penalized
    if (priceCeiling != null) {
      if (p.priceUgx > 0 && p.priceUgx <= priceCeiling) score += 4;
      else if (p.priceUgx > priceCeiling) score -= 6;
    }

    // Prefer in-stock
    if (p.stock > 0) score += 1;

    return { p, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.p);
}

function buildSystemPrompt(settings, products) {
  const storeName = "Mercury Computers Limited";
  const customPrompt = settings?.systemPrompt || "";
  const faq = Array.isArray(settings?.faq) ? settings.faq : DEFAULT_FAQ;

  const catalogText = products.length
    ? products
        .map(
          (p) =>
            `- ${p.name} | ${p.category}${p.brand ? " | " + p.brand : ""} | USh ${p.priceUgx.toLocaleString()} | ${p.stock > 0 ? "In stock" : "Out of stock"}`
        )
        .join("\n")
    : "(No matching products found in the catalog for this query.)";

  const faqText = faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");

  return `You are the shopping and customer-service assistant for ${storeName}, an ICT and electronics retailer in Kampala, Uganda. Prices are in Ugandan Shillings (USh).

YOUR ROLE:
- Help shoppers find products, compare options, and make decisions.
- Answer customer-service questions (delivery, returns, warranty, payment, store location).
- Be warm, concise, and helpful. Keep replies short and scannable.
- Only recommend products from the catalog below. Never invent products, prices, or specs.
- If nothing matches, say so honestly and suggest alternatives or ask a clarifying question.
- When recommending, mention the product name and price. Suggest 2-4 options max.

${customPrompt ? "STORE INSTRUCTIONS:\n" + customPrompt + "\n" : ""}
RELEVANT PRODUCTS (matched to the customer's query):
${catalogText}

CUSTOMER SERVICE INFO:
${faqText}`;
}

const DEFAULT_FAQ = [
  { q: "Do you offer delivery?", a: "Yes, we offer free delivery within Kampala and Uganda-wide delivery on most items." },
  { q: "Where are you located?", a: "Plot 91, Kira Road, Kamwokya, Kampala, Uganda (near Rubis Petrol Station)." },
  { q: "What is your return policy?", a: "Items can be returned within the period stated in our Sales, Refunds & Returns Policy, provided they are in original condition." },
  { q: "Are your products genuine?", a: "Yes, all our products are official and brand new with manufacturer warranty." },
  { q: "How can I contact you?", a: "Call 0414 256 136 / 0707 749 506 or email customercare@mercurycomputerslimited.com." },
  { q: "What payment methods do you accept?", a: "We accept mobile money, bank transfers, and cash on delivery within Kampala." },
];

async function callGemini(apiKey, systemPrompt, contents) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 800,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Gemini API error:", res.status, errText);
    throw new HttpsError("internal", "The assistant is temporarily unavailable.");
  }

  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return reply || "Sorry, I couldn't generate a response. Please try rephrasing.";
}
