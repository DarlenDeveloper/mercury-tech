"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowUp, Search, Plus, Trash2, PanelLeft, Headphones } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { askAiAgent } from "@/lib/aiAgent";
import { fetchProducts } from "@/lib/firestore";
import ProductCard from "@/components/ProductCard";
import { type Product } from "@/lib/products";
import {
  listMyConversations,
  watchConversation,
  upsertConversation,
  appendMessage,
  newConversationId,
  type SupportConversation,
  type SupportMessage,
} from "@/lib/support";

const SUGGESTIONS = ["Gaming laptop under USh 3M", "Cheap printer under USh 200K"];

let productMapCache: Map<string, Product> | null = null;

export default function AiAgentPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [aiMode, setAiMode] = useState(true);
  const [sending, setSending] = useState(false);
  const [productMap, setProductMap] = useState<Map<string, Product>>(productMapCache ?? new Map());
  const [chats, setChats] = useState<SupportConversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = conversation?.messages ?? [];
  const hasConversation = messages.length > 0;
  const intervened = conversation?.intervened ?? false;

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/ai");
  }, [user, loading, router]);

  const refreshChats = useCallback(async () => {
    if (!user) return;
    try {
      setChats(await listMyConversations(user.uid));
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  // Real-time listener for the active conversation (admin messages + intervene).
  useEffect(() => {
    if (!activeId) return;
    const unsub = watchConversation(activeId, (conv) => {
      if (conv) setConversation(conv);
    });
    return unsub;
  }, [activeId]);

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
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const startNewChat = () => {
    setActiveId(null);
    setConversation(null);
    setInput("");
    setSidebarOpen(false);
  };

  const openChat = (conv: SupportConversation) => {
    setActiveId(conv.id);
    setConversation(conv);
    setSidebarOpen(false);
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending || !user) return;

    if (!aiMode) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      return;
    }

    setInput("");
    setSending(true);

    const userMsg: SupportMessage = { role: "user", text: trimmed, at: new Date().toISOString() };
    const priorMessages = messages;

    let convId = activeId;
    try {
      if (!convId) {
        convId = newConversationId();
        await upsertConversation(convId, {
          userId: user.uid,
          userName: user.displayName || "",
          userEmail: user.email || "",
          messages: [userMsg],
          status: "open",
          intervened: false,
          title: trimmed.slice(0, 60),
        });
        setActiveId(convId);
      } else {
        await appendMessage(convId, userMsg);
      }
      refreshChats();

      // If an admin has intervened, don't call the AI — the agent will reply.
      if (intervened) {
        setSending(false);
        return;
      }

      const history = priorMessages.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));
      const reply = await askAiAgent(trimmed, history);
      await appendMessage(convId, {
        role: "assistant",
        text: reply || "Sorry, I couldn't process that. Please try again.",
        at: new Date().toISOString(),
      });
      refreshChats();
    } catch {
      if (convId) {
        await appendMessage(convId, {
          role: "assistant",
          text: "Something went wrong. Please try again.",
          at: new Date().toISOString(),
        }).catch(() => {});
      }
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
    <div className="flex h-screen bg-[#F5F7FB]">
      <ChatSidebar
        chats={chats}
        activeId={activeId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={startNewChat}
        onOpenChat={openChat}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 px-3 pt-4">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Conversations"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-black/5 lg:hidden"
          >
            <PanelLeft size={20} />
          </button>
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-black/5"
          >
            <ArrowLeft size={22} />
          </button>
        </div>

        {/* Intervene banner */}
        {intervened && hasConversation && (
          <div className="mx-auto mt-2 flex w-full max-w-3xl items-center gap-2 rounded-full bg-mercury/10 px-4 py-2 text-[13px] font-medium text-mercury">
            <Headphones size={15} />
            A Mercury agent has joined the chat and will assist you directly.
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {hasConversation ? (
            <div className="mx-auto max-w-3xl px-5 py-4">
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} productMap={productMap} />
              ))}
              {sending && !intervened && (
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

        {!hasConversation && (
          <div className="mx-auto w-full max-w-3xl px-5 pb-2.5">
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

        <div className="mx-auto w-full max-w-3xl px-5 pb-8">
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
              placeholder={intervened ? "Message the agent…" : "Start searching"}
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
    </div>
  );
}

function ChatSidebar({
  chats,
  activeId,
  open,
  onClose,
  onNewChat,
  onOpenChat,
}: {
  chats: SupportConversation[];
  activeId: string | null;
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onOpenChat: (conv: SupportConversation) => void;
}) {
  const content = (
    <div className="flex h-full w-72 flex-col border-r border-line bg-white">
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-2.5 text-sm font-semibold text-white transition hover:bg-black"
        >
          <Plus size={16} />
          New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
          Recent
        </p>
        {chats.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-muted">No conversations yet</p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {chats.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => onOpenChat(c)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                    c.id === activeId ? "bg-surface-soft" : "hover:bg-surface-soft"
                  }`}
                >
                  <Image src="/ai-icon.png" alt="" width={16} height={16} className="h-4 w-4 shrink-0 object-contain" />
                  <span className="truncate text-[13px] text-ink">{c.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block">{content}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />
          <div className="fixed left-0 top-0 z-50 h-full lg:hidden">{content}</div>
        </>
      )}
    </>
  );
}

function ModeChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  const isAi = label === "AI mode";
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-[20px] px-3 py-2 transition ${
        selected ? "border border-[#E5E7EB] bg-white" : "border border-transparent"
      }`}
    >
      {isAi ? (
        <span className="h-4 w-4 rounded-lg" style={{ background: "linear-gradient(135deg, #FFB053, #FF7A00)" }} />
      ) : (
        <Search size={16} className="text-[#6B7280]" />
      )}
      <span className={`text-[13px] font-semibold ${selected ? "text-ink" : "text-[#6B7280]"}`}>{label}</span>
    </button>
  );
}

function MessageBubble({ message, productMap }: { message: SupportMessage; productMap: Map<string, Product> }) {
  const { text, role } = message;

  if (role === "user") {
    return (
      <div className="flex justify-end py-1.5">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-[4px] bg-mercury px-4 py-3 text-[14px] leading-[1.35] text-white">
          {text}
        </div>
      </div>
    );
  }

  const isAdmin = role === "admin";
  const { cleanText, productIds } = parseProductTags(text);
  const products = productIds.map((id) => productMap.get(id)).filter((p): p is Product => !!p);

  return (
    <div className="flex flex-col items-start py-1.5">
      {isAdmin && (
        <span className="mb-1 ml-1 text-[11px] font-semibold text-mercury">Mercury Agent</span>
      )}
      <div
        className={`max-w-[80%] rounded-2xl rounded-bl-[4px] px-4 py-3 text-[14px] leading-[1.35] ${
          isAdmin ? "bg-mercury/10 text-ink" : "bg-white text-ink"
        }`}
      >
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

function MarkdownText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

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
  return <span className="h-2 w-2 animate-bounce rounded-full bg-muted/50" style={{ animationDelay: `${delay}ms` }} />;
}
