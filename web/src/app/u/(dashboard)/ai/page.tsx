"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import AreaChart from "@/components/admin/charts/AreaChart";
import { db } from "@/lib/firestore";

type Usage = {
  total: number;
  users: number;
  last7: number;
  days: { label: string; count: number }[];
};

export default function AiPage() {
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const convSnap = await getDocs(collection(db, "ai_conversations"));

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
        const ts = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
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
      console.error("Load AI usage error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      {/* Premium heading */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mercury">
        Mercury Assistant
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">AI Overview</h1>
      <p className="mt-1 text-sm text-muted">Usage insights for the shopping &amp; support assistant</p>

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
