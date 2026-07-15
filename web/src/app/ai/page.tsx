"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUp, Search } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { askAiAgent } from "@/lib/aiAgent";
import { fetchProducts } from "@/lib/firestore";
import ProductCard from "@/components/ProductCard";
import { type Product } from "@/lib/products";

type Message = {
  text: string;
  fromUser: boolean;
};

const SUGGESTIONS = [
  "Gaming laptop under USh 3M",
  "Cheap printer under USh 200K",
];

// Client-side product cache (loaded once per session).
let productMapCache: Map<string, Product> | null = null;

export default function AiAgentPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [aiMode, setAiMode] = useState(true);
  const [sending, setSending] = useState(false);
  const [productMap, setProductMap] = useState<Map<string, Product>>(
    productMapCache ?? new Map()
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasConversation = messages.length > 0;

  // Require login
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/ai");
    }
  }, [user, loading, router]);

  // Load products for card rendering
  useEffect(() => {
    if (productMapCache) {
      setProductMap(productMapCache);
      return;
    }
    fetchProducts()
      .then((fsProducts) => {
        const map = new Map<string, Product>();
        for (const p of fsProducts) {
          map.set(p.id, {
            id: p.id,
            name: p.name,
            description: p.shortDescription || p.description || "",
            category: p.category,
            categoryId: p.categoryId,
            price: Math.round((p.priceUsd || 0) * 3780),
            rating: 4.5,
            reviews: "0 Reviews",
            image: p.image || "/placeholder-product.svg",
            brand: p.brand,
            stock: p.stock,
          });
        }
        productMapCache = map;
        setProductMap(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    if (!aiMode) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      return;
    }

    setInput("");
    const history = messages.map((m) => ({
      role: m.fromUser ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));
    setMessages((prev) => [...prev, { text: trimmed, fromUser: true }]);
    setSending(true);

    try {
      const reply = await askAiAgent(trimmed, history);
      setMessages((prev) => [
        ...prev,
        { text: reply || "Sorry, I couldn't process that. Please try again.", fromUser: false },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "Something went wrong. Please try again.", fromUser: false },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FB]">
      {/* Back button */}
      <div className="px-3 pt-4">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-black/5"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      {/* Conversation or greeting */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {hasConversation ? (
          <div className="mx-auto max-w-2xl px-5 py-4">
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} productMap={productMap} />
            ))}
            {sending && (
              <div className="flex py-2">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl bg-white px-4 py-3">
                  <Dot delay={0} />
                  <Dot delay={150} />
                  <Dot delay={300} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-9">
            <h1 className="text-center text-[26px] font-bold leading-[1.25] text-ink">
              Hey there, what are you
              <br />
              looking for today?
            </h1>
          </div>
        )}
      </div>

      {/* Suggestions (only when no conversation) */}
      {!hasConversation && (
        <div className="mx-auto w-full max-w-2xl px-5 pb-2.5">
          <div className="flex gap-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="flex-1 rounded-[14px] bg-[#F1F2F4] px-3.5 py-3 text-left text-[12.5px] leading-[1.25] text-[#4B5563] transition hover:bg-[#e8e9ec]"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="mx-auto w-full max-w-2xl px-5 pb-8">
        <div className="rounded-[26px] border border-[#E5E7EB] bg-white px-[18px] pb-3 pt-3.5 shadow-[0_6px_16px_rgba(0,0,0,0.05)]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Start searching"
            className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-[#9CA3AF]"
          />
          <div className="mt-3.5 flex items-center gap-1.5">
            <ModeChip label="AI mode" selected={aiMode} onClick={() => setAiMode(true)} />
            <ModeChip label="Standard" selected={!aiMode} onClick={() => setAiMode(false)} />
            <div className="flex-1" />
            <button
              onClick={() => send(input)}
              disabled={sending}
              aria-label="Send"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white transition hover:bg-black disabled:opacity-50"
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  const isAi = label === "AI mode";
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-[20px] px-3 py-2 transition ${
        selected ? "border border-[#E5E7EB] bg-white" : "border border-transparent"
      }`}
    >
      {isAi ? (
        <span
          className="h-4 w-4 rounded-lg"
          style={{
            background: "linear-gradient(135deg, #FFB053, #FF7A00)",
          }}
        />
      ) : (
        <Search size={16} className="text-[#6B7280]" />
      )}
      <span
        className={`text-[13px] font-semibold ${
          selected ? "text-ink" : "text-[#6B7280]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function MessageBubble({
  message,
  productMap,
}: {
  message: Message;
  productMap: Map<string, Product>;
}) {
  const { text, fromUser } = message;

  if (fromUser) {
    return (
      <div className="flex justify-end py-1.5">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-[4px] bg-mercury px-4 py-3 text-[14px] leading-[1.35] text-white">
          {text}
        </div>
      </div>
    );
  }

  // Extract [[id:xxx]] product tags from the reply
  const { cleanText, productIds } = parseProductTags(text);
  const products = productIds
    .map((id) => productMap.get(id))
    .filter((p): p is Product => !!p);

  return (
    <div className="flex flex-col items-start py-1.5">
      <div className="max-w-[80%] rounded-2xl rounded-bl-[4px] bg-white px-4 py-3 text-[14px] leading-[1.35] text-ink">
        <MarkdownText text={cleanText} />
      </div>
      {products.length > 0 && (
        <div className="no-scrollbar mt-3 flex w-full gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((p) => (
            <div key={p.id} className="w-[172px] shrink-0">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Renders text with basic markdown: **bold** and line breaks. */
function MarkdownText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

/** Extracts [[id:PRODUCT_ID]] tags, returns clean text and the ids. */
function parseProductTags(text: string): { cleanText: string; productIds: string[] } {
  const ids: string[] = [];
  const cleanText = text
    .replace(/\[\[id:([^\]]+)\]\]/g, (_, id) => {
      const trimmed = String(id).trim();
      if (trimmed && !ids.includes(trimmed)) ids.push(trimmed);
      return "";
    })
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { cleanText, productIds: ids };
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-2 w-2 animate-bounce rounded-full bg-muted/50"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
