"use client";

import { useState, useEffect } from "react";
import { Save, MessageSquare, Settings, BookOpen, Store, RefreshCw } from "lucide-react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import AdminHeader from "@/components/admin/AdminHeader";
import { db } from "@/lib/firestore";
import { logAudit } from "@/lib/auditLog";
import { useAuth } from "@/components/AuthProvider";

type Tab = "config" | "conversations";

type Conversation = {
  id: string;
  userEmail: string;
  message: string;
  reply: string;
  createdAt: Date;
};

export default function AiPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("config");

  // Config state
  const [systemPrompt, setSystemPrompt] = useState("");
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [storeInfo, setStoreInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "config", "ai"));
      if (snap.exists()) {
        const data = snap.data();
        setSystemPrompt(data.systemPrompt || "");
        setKnowledgeBase(data.knowledgeBase || "");
        setStoreInfo(data.storeInfo || "");
      }
    } catch (e) {
      console.error("Load AI config error:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    setConvLoading(true);
    try {
      const q = query(
        collection(db, "ai_conversations"),
        orderBy("createdAt", "desc"),
        limit(100)
      );
      const snap = await getDocs(q);
      setConversations(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            userEmail: data.userEmail || "Anonymous",
            message: data.message || "",
            reply: data.reply || "",
            createdAt:
              data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          };
        })
      );
    } catch (e) {
      console.error("Load conversations error:", e);
    } finally {
      setConvLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, "config", "ai"),
        {
          systemPrompt: systemPrompt.trim(),
          knowledgeBase: knowledgeBase.trim(),
          storeInfo: storeInfo.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      logAudit({
        actor: user?.displayName || user?.email || "Unknown",
        actorId: user?.uid || "",
        action: "settings_updated",
        target: "AI Assistant Configuration",
      });
    } catch (e) {
      console.error("Save AI config error:", e);
    } finally {
      setSaving(false);
    }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    if (t === "conversations" && conversations.length === 0) loadConversations();
  };

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="AI Assistant"
        subtitle="Configure the shopping & customer-service assistant"
        action={
          tab === "config" ? (
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          ) : (
            <button
              onClick={loadConversations}
              className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          )
        }
      />

      {/* Tabs */}
      <div className="mt-6 flex gap-2 border-b border-line">
        <TabButton
          active={tab === "config"}
          onClick={() => switchTab("config")}
          icon={<Settings size={16} />}
          label="Configuration"
        />
        <TabButton
          active={tab === "conversations"}
          onClick={() => switchTab("conversations")}
          icon={<MessageSquare size={16} />}
          label="Conversations"
        />
      </div>

      {tab === "config" ? (
        loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            <ConfigCard
              icon={<Settings size={18} />}
              title="System Prompt"
              hint="Extra instructions that shape the assistant's personality and behaviour. Leave blank to use defaults."
            >
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={5}
                placeholder="e.g. Always be warm and concise. Suggest accessories when relevant."
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none resize-none focus:border-mercury"
              />
            </ConfigCard>

            <ConfigCard
              icon={<Store size={18} />}
              title="Store Information"
              hint="Delivery, location, contact, payment and warranty details the assistant uses to answer customer-service questions."
            >
              <textarea
                value={storeInfo}
                onChange={(e) => setStoreInfo(e.target.value)}
                rows={8}
                placeholder="Location, phone, delivery policy, warranty terms..."
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none resize-none focus:border-mercury"
              />
            </ConfigCard>

            <ConfigCard
              icon={<BookOpen size={18} />}
              title="Knowledge Base (FAQ)"
              hint="Frequently asked questions and answers. The assistant draws from these for customer-service replies."
            >
              <textarea
                value={knowledgeBase}
                onChange={(e) => setKnowledgeBase(e.target.value)}
                rows={10}
                placeholder={"Q: What is your return policy?\nA: Items can be returned within 7 days...\n\nQ: Do you offer installation?\nA: Yes, for desktops and networking setups..."}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none resize-none focus:border-mercury"
              />
            </ConfigCard>
          </div>
        )
      ) : (
        <div className="mt-6">
          {convLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">
              No conversations yet. Customer chats with the AI will appear here.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {conversations.map((c) => (
                <div key={c.id} className="admin-card p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-ink">
                      {c.userEmail}
                    </span>
                    <span className="text-[11px] text-muted">
                      {c.createdAt.toLocaleString("en-UG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="rounded-lg bg-mercury/5 px-3 py-2 text-[13px] text-ink">
                    <span className="font-medium text-mercury">Customer: </span>
                    {c.message}
                  </div>
                  <div className="mt-2 rounded-lg bg-surface-soft px-3 py-2 text-[13px] text-ink">
                    <span className="font-medium text-muted">Assistant: </span>
                    {c.reply}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative -mb-px flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition ${
        active ? "text-ink" : "text-muted hover:text-ink"
      }`}
    >
      {icon}
      {label}
      {active && (
        <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-mercury" />
      )}
    </button>
  );
}

function ConfigCard({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-card p-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-mercury">{icon}</span>
        <h3 className="text-sm font-bold text-ink">{title}</h3>
      </div>
      <p className="mb-3 text-xs text-muted">{hint}</p>
      {children}
    </section>
  );
}
