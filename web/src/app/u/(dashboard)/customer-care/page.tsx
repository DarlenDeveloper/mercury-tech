"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ChevronRight, Send, Headphones } from "lucide-react";
import {
  watchAllConversations,
  watchConversation,
  interveneConversation,
  resolveConversation,
  sendAdminMessage,
  type SupportConversation,
} from "@/lib/support";
import { logAudit } from "@/lib/auditLog";
import { useAuth } from "@/components/AuthProvider";

type CustomerGroup = {
  key: string;
  name: string;
  contact: string;
  initials: string;
  conversations: SupportConversation[];
  openCount: number;
  latest: Date;
};

export default function CustomerCarePage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [active, setActive] = useState<SupportConversation | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live list of all conversations
  useEffect(() => {
    const unsub = watchAllConversations(setConversations);
    return unsub;
  }, []);

  // Live active conversation
  useEffect(() => {
    if (!activeId) {
      setActive(null);
      return;
    }
    const unsub = watchConversation(activeId, (c) => c && setActive(c));
    return unsub;
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [active?.messages.length]);

  // Group conversations by customer
  const groups = useMemo<CustomerGroup[]>(() => {
    const map = new Map<string, CustomerGroup>();
    for (const c of conversations) {
      const key = c.userId || c.userEmail || c.id;
      const name = c.userName || c.userEmail || "Guest";
      const contact = c.userEmail || "—";
      if (!map.has(key)) {
        map.set(key, {
          key,
          name,
          contact,
          initials: initials(name),
          conversations: [],
          openCount: 0,
          latest: c.updatedAt,
        });
      }
      const g = map.get(key)!;
      g.conversations.push(c);
      if (c.status === "open") g.openCount++;
      if (c.updatedAt > g.latest) g.latest = c.updatedAt;
    }
    return [...map.values()].sort((a, b) => b.latest.getTime() - a.latest.getTime());
  }, [conversations]);

  const totalOpen = conversations.filter((c) => c.status === "open").length;

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const doIntervene = async () => {
    if (!active || !user) return;
    await interveneConversation(active.id, user.email || user.displayName || "admin");
    logAudit({
      actor: user?.displayName || user?.email || "Unknown",
      actorId: user?.uid || "",
      action: "settings_updated",
      target: `Intervened: ${active.userName || active.userEmail}`,
    });
  };

  const doResolve = async () => {
    if (!active) return;
    await resolveConversation(active.id);
  };

  const doSend = async () => {
    const text = reply.trim();
    if (!text || !active || busy || !user) return;
    setBusy(true);
    setReply("");
    try {
      if (!active.intervened) await interveneConversation(active.id, user.email || "admin");
      await sendAdminMessage(active.id, text);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      {/* Premium heading */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mercury">
        Mercury Assistant
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">Conversations</h1>
      <p className="mt-1 text-sm text-muted">
        {groups.length} {groups.length === 1 ? "customer" : "customers"} ·{" "}
        {conversations.length} {conversations.length === 1 ? "thread" : "threads"} · {totalOpen} open
      </p>

      {/* Master-detail */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
        {/* List */}
        <div className="flex max-h-[70vh] flex-col overflow-y-auto rounded-2xl border border-line bg-white">
          {groups.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">No conversations yet.</p>
          ) : (
            groups.map((g) => (
              <div key={g.key} className="border-b border-line/70 last:border-0">
                <button
                  onClick={() => toggle(g.key)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface-soft"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-soft text-[11px] font-bold text-ink">
                    {g.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold text-ink">{g.name}</span>
                      <span className="shrink-0 text-[11px] text-muted">
                        {g.latest.toLocaleDateString("en-UG", { month: "short", day: "numeric" })}
                      </span>
                    </span>
                    <span className="block truncate text-[12px] text-muted">{g.contact}</span>
                    <span className="block text-[11px] text-muted">
                      {g.conversations.length}{" "}
                      {g.conversations.length === 1 ? "conversation" : "conversations"} · {g.openCount} open
                    </span>
                  </span>
                  <ChevronRight
                    size={16}
                    className={`shrink-0 text-muted transition-transform ${expanded.has(g.key) ? "rotate-90" : ""}`}
                  />
                </button>

                {/* Threads */}
                {expanded.has(g.key) && (
                  <div className="bg-[#FAFBFC] pb-1">
                    {g.conversations.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActiveId(c.id)}
                        className={`flex w-full items-start gap-2 border-l-2 px-4 py-2.5 pl-6 text-left transition ${
                          activeId === c.id
                            ? "border-mercury bg-white"
                            : "border-transparent hover:bg-white"
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] text-ink">{c.title}</span>
                          <span className="text-[11px] capitalize text-muted">{c.status}</span>
                        </span>
                        <span className="shrink-0 text-[10px] text-muted">
                          {c.updatedAt.toLocaleDateString("en-UG", { month: "short", day: "numeric" })}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Detail */}
        <div className="flex max-h-[70vh] flex-col rounded-2xl border border-line bg-white">
          {!active ? (
            <div className="flex flex-1 items-center justify-center py-20 text-sm text-muted">
              Select a conversation
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-ink">
                    {active.userName || "Guest"}
                  </p>
                  <p className="truncate text-[12px] text-muted">{active.userEmail || "—"}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      active.status === "open"
                        ? "bg-[#e7f6ee] text-[#16a34a]"
                        : "bg-surface-soft text-muted"
                    }`}
                  >
                    {active.status}
                  </span>
                  {active.intervened ? (
                    <span className="flex items-center gap-1 rounded-full border border-mercury/30 bg-mercury/10 px-3 py-1.5 text-[12px] font-semibold text-mercury">
                      <Headphones size={13} /> {active.intervenedBy || "Agent"}
                    </span>
                  ) : (
                    <button
                      onClick={doIntervene}
                      className="rounded-full border border-line px-4 py-1.5 text-[12px] font-semibold text-ink transition hover:border-mercury hover:text-mercury"
                    >
                      Intervene
                    </button>
                  )}
                  <button
                    onClick={doResolve}
                    disabled={active.status === "resolved"}
                    className="rounded-full border border-line px-4 py-1.5 text-[12px] font-semibold text-ink transition hover:border-mercury hover:text-mercury disabled:opacity-40"
                  >
                    Resolve
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
                {active.messages.map((m, i) => (
                  <AdminMessage key={i} message={m} />
                ))}
              </div>

              {/* Reply composer (only when intervened by current admin) */}
              <div className="border-t border-line px-4 py-3">
                {active.intervened && active.intervenedBy === (user?.email || "") ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); doSend(); }
                      }}
                      placeholder="Type your reply…"
                      className="h-11 flex-1 rounded-full border border-line bg-[#FAFBFC] px-4 text-sm text-ink outline-none focus:border-mercury focus:bg-white"
                    />
                    <button
                      onClick={doSend}
                      disabled={busy || !reply.trim()}
                      aria-label="Send"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white transition hover:bg-black disabled:opacity-40"
                    >
                      <Send size={17} />
                    </button>
                  </div>
                ) : active.intervened ? (
                  <p className="py-1 text-center text-[12px] text-muted">
                    This conversation is being handled by{" "}
                    <span className="font-semibold text-ink">{active.intervenedBy}</span>.
                  </p>
                ) : (
                  <p className="py-1 text-center text-[12px] text-muted">
                    The AI is handling this chat. Click{" "}
                    <span className="font-semibold text-ink">Intervene</span> to take over.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminMessage({ message }: { message: { role: string; text: string; at: string } }) {
  const { role, text } = message;
  const cleanText = text.replace(/\[\[id:[^\]]+\]\]/g, "").trim();

  if (role === "user") {
    return (
      <div className="flex justify-end py-1.5">
        <div className="max-w-[75%] whitespace-pre-wrap rounded-2xl rounded-br-[4px] bg-ink px-4 py-2.5 text-[13px] leading-[1.4] text-white">
          {cleanText}
        </div>
      </div>
    );
  }

  const isAdmin = role === "admin";
  return (
    <div className="flex flex-col items-start py-1.5">
      <span className="mb-1 ml-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
        {isAdmin ? "You (Agent)" : "AI Assistant"}
      </span>
      <div
        className={`max-w-[75%] whitespace-pre-wrap rounded-2xl rounded-bl-[4px] px-4 py-2.5 text-[13px] leading-[1.4] ${
          isAdmin ? "bg-mercury/10 text-ink" : "bg-surface-soft text-ink"
        }`}
      >
        {cleanText}
      </div>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
