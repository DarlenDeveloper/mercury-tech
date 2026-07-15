"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import AdminHeader from "@/components/admin/AdminHeader";
import AreaChart from "@/components/admin/charts/AreaChart";
import { db } from "@/lib/firestore";
import { logAudit } from "@/lib/auditLog";
import { useAuth } from "@/components/AuthProvider";

type Usage = {
  total: number;
  users: number;
  last7: number;
  days: { label: string; count: number }[];
};

export default function AiPage() {
  const { user } = useAuth();

  const [systemPrompt, setSystemPrompt] = useState("");
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [storeInfo, setStoreInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [configSnap, convSnap] = await Promise.all([
        getDoc(doc(db, "config", "ai")),
        getDocs(collection(db, "ai_conversations")),
      ]);

      if (configSnap.exists()) {
        const data = configSnap.data();
        setSystemPrompt(data.systemPrompt || "");
        setKnowledgeBase(data.knowledgeBase || "");
        setStoreInfo(data.storeInfo || "");
      }

      // Compute usage from conversation log
      const now = new Date();
      const dayBuckets = new Map<string, number>();
      const dayKeys: string[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dayBuckets.set(key, 0);
        dayKeys.push(key);
      }

      const userSet = new Set<string>();
      let last7 = 0;
      const sevenAgo = new Date(now);
      sevenAgo.setDate(now.getDate() - 7);

      convSnap.docs.forEach((d) => {
        const data = d.data();
        if (data.userId) userSet.add(data.userId);
        const ts =
          data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
        if (ts) {
          const key = ts.toISOString().slice(0, 10);
          if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) || 0) + 1);
          if (ts >= sevenAgo) last7++;
        }
      });

      setUsage({
        total: convSnap.size,
        users: userSet.size,
        last7,
        days: dayKeys.map((k) => ({
          label: new Date(k).toLocaleDateString("en-UG", { day: "numeric", month: "short" }),
          count: dayBuckets.get(k) || 0,
        })),
      });
    } catch (e) {
      console.error("Load AI page error:", e);
    } finally {
      setLoading(false);
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

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      {/* Premium heading */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mercury">
            Mercury Assistant
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
            AI Overview
          </h1>
          <p className="mt-1 text-sm text-muted">
            Usage insights and assistant configuration
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "Saving..." : saved ? "Saved" : "Save changes"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
        </div>
      ) : (
        <>
          {/* Usage stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total messages" value={usage?.total ?? 0} />
            <StatCard label="Last 7 days" value={usage?.last7 ?? 0} />
            <StatCard label="Unique users" value={usage?.users ?? 0} />
            <StatCard
              label="Avg / day"
              value={usage ? Math.round((usage.last7 / 7) * 10) / 10 : 0}
            />
          </div>

          {/* Usage graph */}
          <section className="mt-6 rounded-2xl border border-line bg-white p-6">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-ink">Messages over time</h2>
              <p className="text-xs text-muted">Assistant activity, last 14 days</p>
            </div>
            {usage && (
              <AreaChart
                months={usage.days.map((d) => d.label)}
                values={usage.days.map((d) => d.count)}
                color="#1f3e97"
              />
            )}
          </section>

          {/* Configuration */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-ink">Configuration</h2>
            <p className="text-sm text-muted">
              Shape the assistant&apos;s behaviour and knowledge. Changes apply instantly.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <ConfigCard
              title="System Prompt"
              hint="Extra instructions that shape the assistant's personality and behaviour."
            >
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={4}
                placeholder="e.g. Always be warm and concise. Suggest accessories when relevant."
                className="w-full rounded-xl border border-line bg-[#FAFBFC] px-4 py-3 text-sm text-ink outline-none transition focus:border-mercury focus:bg-white resize-none"
              />
            </ConfigCard>

            <ConfigCard
              title="Store Information"
              hint="Delivery, location, contact, payment and warranty details for customer-service answers."
            >
              <textarea
                value={storeInfo}
                onChange={(e) => setStoreInfo(e.target.value)}
                rows={7}
                placeholder="Location, phone, delivery policy, warranty terms..."
                className="w-full rounded-xl border border-line bg-[#FAFBFC] px-4 py-3 text-sm text-ink outline-none transition focus:border-mercury focus:bg-white resize-none"
              />
            </ConfigCard>

            <ConfigCard
              title="Knowledge Base (FAQ)"
              hint="Frequently asked questions and answers the assistant draws from."
            >
              <textarea
                value={knowledgeBase}
                onChange={(e) => setKnowledgeBase(e.target.value)}
                rows={8}
                placeholder={"Q: What is your return policy?\nA: Items can be returned within 7 days...\n\nQ: Do you offer installation?\nA: Yes, for desktops and networking setups..."}
                className="w-full rounded-xl border border-line bg-[#FAFBFC] px-4 py-3 text-sm text-ink outline-none transition focus:border-mercury focus:bg-white resize-none"
              />
            </ConfigCard>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function ConfigCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6">
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <p className="mb-3 mt-0.5 text-xs text-muted">{hint}</p>
      {children}
    </section>
  );
}
