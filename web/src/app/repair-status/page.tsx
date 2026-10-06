"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Clock, Search, ShieldCheck, Wrench } from "@/components/admin/WorkspaceIcons";
import { lookupRepairStatus, REPAIR_STATUS_LABELS, type PublicRepairStatus } from "@/lib/repairs";

const inputClass = "mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-mercury focus:ring-2 focus:ring-mercury/10";

export default function RepairStatusPage() {
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<PublicRepairStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      setResult(await lookupRepairStatus(reference, phone));
    } catch {
      setError("We could not match that reference and phone number. Check both entries and try again.");
    } finally {
      setBusy(false);
    }
  }

  return <>
    <Header />
    <main className="flex-1 bg-[#f6f7f9] px-4 py-12 lg:px-6 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <Wrench size={44} color="#1f3e97" variant="Bulk" className="mx-auto" />
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-mercury">Repair tracker</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">See how your repair is moving</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">Use the reference we gave you and the phone number on the repair order.</p>
        </div>

        <form onSubmit={submit} className="mt-9 grid gap-5 rounded-3xl border border-line bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
          <label className="text-sm font-semibold text-ink">Repair reference
            <input required autoComplete="off" value={reference} onChange={event => setReference(event.target.value)} placeholder="e.g. repair reference" className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-ink">Phone number
            <input required type="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="Number used on the order" className={inputClass} />
          </label>
          <button disabled={busy || !reference.trim() || phone.replace(/\D/g, "").length < 9} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40 sm:col-span-2">
            <Search size={19} variant="Linear" />{busy ? "Checking…" : "Check status"}
          </button>
          <p className="flex items-center justify-center gap-2 text-center text-xs text-muted sm:col-span-2"><ShieldCheck size={17} variant="Linear" />Your phone number helps keep repair information private.</p>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-700 sm:col-span-2">{error}</p>}
        </form>

        {result && <section aria-live="polite" className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
            <div><p className="text-xs text-muted">{result.service} · {result.reference}</p><h2 className="mt-2 text-xl font-semibold text-ink">{result.device}</h2></div>
            <span className="rounded-full bg-[#eaf1fc] px-4 py-2 text-xs font-semibold text-mercury">{REPAIR_STATUS_LABELS[result.status]}</span>
          </div>
          <div className="mt-6 space-y-0">
            {result.history.map((event, index) => <div key={`${event.status}-${index}`} className="relative flex gap-4 pb-7 last:pb-0">
              {index < result.history.length - 1 && <span aria-hidden="true" className="absolute left-[11px] top-6 h-[calc(100%-16px)] w-px bg-line" />}
              <span className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mercury text-white"><Clock size={13} variant="Bold" /></span>
              <div><p className="text-sm font-semibold text-ink">{REPAIR_STATUS_LABELS[event.status]}</p><p className="mt-1 text-xs text-muted">{event.at ? new Date(event.at).toLocaleString("en-UG", { dateStyle: "medium", timeStyle: "short" }) : "Update time unavailable"}</p></div>
            </div>)}
          </div>
        </section>}
      </div>
    </main>
    <Footer />
  </>;
}
