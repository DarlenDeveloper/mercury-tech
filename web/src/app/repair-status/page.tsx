"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Check,
  ClipboardList,
  Package,
  Search,
  ShieldCheck,
  Wallet,
  Wrench,
  type WorkspaceIcon,
} from "@/components/admin/WorkspaceIcons";
import {
  lookupRepairStatus,
  REPAIR_STATUS_LABELS,
  type PublicRepairStatus,
  type RepairStatus,
} from "@/lib/repairs";

const inputClass = "mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-mercury focus:ring-2 focus:ring-mercury/10";

type JourneyStep = {
  statuses: RepairStatus[];
  label: string;
  description: string;
  icon: WorkspaceIcon;
};

const JOURNEY_STEPS: JourneyStep[] = [
  {
    statuses: ["received"],
    label: "Repair received",
    description: "Your device has been checked in and the repair order is open.",
    icon: ClipboardList,
  },
  {
    statuses: ["awaiting_payment"],
    label: "Quotation & payment",
    description: "The quotation or LPO is prepared and payment is confirmed.",
    icon: Wallet,
  },
  {
    statuses: ["ready_for_assignment"],
    label: "Ready for workshop",
    description: "Your device is cleared and ready for a technician.",
    icon: ShieldCheck,
  },
  {
    statuses: ["in_progress", "awaiting_parts"],
    label: "Repair in progress",
    description: "A technician is working on your device.",
    icon: Wrench,
  },
  {
    statuses: ["completed"],
    label: "Ready for collection",
    description: "The repair is complete and your device is ready for you.",
    icon: Check,
  },
  {
    statuses: ["collected"],
    label: "Collected",
    description: "Your device has been handed over successfully.",
    icon: Package,
  },
];

const STATUS_DESCRIPTION: Partial<Record<RepairStatus, string>> = {
  awaiting_parts: "Work is paused while the required parts are being arranged.",
};

function formatStatusDate(value: string | null | undefined) {
  if (!value) return null;
  return new Date(value).toLocaleString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RepairJourney({ result }: { result: PublicRepairStatus }) {
  const currentStep = JOURNEY_STEPS.findIndex(step => step.statuses.includes(result.status));
  const latestUpdate = formatStatusDate(result.updatedAt);

  return (
    <section
      aria-live="polite"
      aria-labelledby="repair-journey-title"
      className="mt-7 overflow-hidden rounded-[2rem] border border-[#dfe5ee] bg-white shadow-[0_24px_70px_rgba(22,34,51,0.10)]"
    >
      <div className="relative overflow-hidden border-b border-[#e4e9f0] bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_55%,#f8fcfb_100%)] px-6 py-7 sm:px-9 sm:py-8">
        <div aria-hidden="true" className="absolute -right-14 -top-20 h-48 w-48 rounded-full bg-[#cce8ff]/45 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 left-1/3 h-44 w-44 rounded-full bg-[#d8f3e6]/50 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-mercury">Repair journey</p>
            <h2 id="repair-journey-title" className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">{result.device}</h2>
            <p className="mt-2 text-xs text-muted">{result.service} · {result.reference}</p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-[0_8px_24px_rgba(30,64,175,0.08)] backdrop-blur">
            <p className="flex items-center gap-2 text-sm font-semibold text-mercury">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mercury text-white">
                <Check size={14} variant="Bold" />
              </span>
              {REPAIR_STATUS_LABELS[result.status]}
            </p>
            {latestUpdate && <p className="mt-1.5 pl-8 text-[10px] text-muted">Updated {latestUpdate}</p>}
          </div>
        </div>

        <div className="relative mt-7 grid grid-cols-6 gap-1.5" aria-hidden="true">
          {JOURNEY_STEPS.map((step, index) => (
            <span
              key={step.label}
              className={`h-1.5 rounded-full transition-colors ${index <= currentStep ? "bg-mercury" : "bg-[#dfe6ee]"}`}
            />
          ))}
        </div>
      </div>

      <ol className="px-6 py-7 sm:px-9 sm:py-9">
        {JOURNEY_STEPS.map((step, index) => {
          const event = [...result.history].reverse().find(item => step.statuses.includes(item.status));
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const isReached = isComplete || isCurrent;
          const Icon = step.icon;
          const eventDate = formatStatusDate(event?.at || (isCurrent ? result.updatedAt : null));
          const label = isCurrent && result.status === "awaiting_parts" ? REPAIR_STATUS_LABELS.awaiting_parts : step.label;
          const description = isCurrent ? STATUS_DESCRIPTION[result.status] || step.description : step.description;

          return (
            <li
              key={step.label}
              aria-current={isCurrent ? "step" : undefined}
              className="relative grid grid-cols-[48px_1fr] gap-4 pb-7 last:pb-0 sm:grid-cols-[52px_1fr_auto] sm:gap-5"
            >
              {index < JOURNEY_STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[23px] top-11 h-[calc(100%-28px)] w-px sm:left-[25px] ${index < currentStep ? "bg-mercury/55" : "bg-[#dfe5ec]"}`}
                />
              )}
              <span
                className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border transition sm:h-[52px] sm:w-[52px] ${
                  isCurrent
                    ? "border-mercury/20 bg-[#eaf2ff] text-mercury shadow-[0_8px_24px_rgba(31,62,151,0.16)] ring-4 ring-[#f2f6ff]"
                    : isComplete
                      ? "border-mercury bg-mercury text-white shadow-[0_8px_20px_rgba(31,62,151,0.14)]"
                      : "border-[#e2e7ed] bg-[#f8f9fb] text-[#a6afbc]"
                }`}
              >
                <Icon size={22} variant={isReached ? "Bold" : "Linear"} />
              </span>

              <div className={`min-w-0 pt-0.5 ${!isReached ? "opacity-55" : ""}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-ink">{label}</h3>
                  {isCurrent && <span className="rounded-full bg-[#dff2ff] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1676a3]">Current</span>}
                </div>
                <p className="mt-1.5 max-w-md text-xs leading-5 text-muted">{description}</p>
                <p className="mt-2 text-[10px] font-medium text-muted sm:hidden">{eventDate || (isComplete ? "Completed" : isCurrent ? "Current update" : "Pending")}</p>
              </div>

              <p className={`hidden pt-1 text-right text-[11px] font-medium sm:block ${isReached ? "text-muted" : "text-[#a6afbc]"}`}>
                {eventDate || (isComplete ? "Completed" : isCurrent ? "Current update" : "Pending")}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="mx-6 mb-6 flex items-start gap-3 rounded-2xl border border-[#dfe8f4] bg-[#f7faff] px-4 py-3.5 sm:mx-9 sm:mb-9">
        <ShieldCheck size={20} variant="Bulk" className="mt-0.5 text-mercury" />
        <p className="text-xs leading-5 text-muted">We update this timeline whenever your repair moves to the next stage. Keep your reference private and check back anytime.</p>
      </div>
    </section>
  );
}

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
        <nav aria-label="Breadcrumb" className="mb-8 text-xs text-muted">
          <ol className="flex items-center justify-center gap-2">
            <li><Link href="/" className="transition hover:text-mercury">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-ink">Track a repair</li>
          </ol>
        </nav>
        <div className="text-center">
          <Wrench size={44} color="#1f3e97" variant="Bulk" className="mx-auto" />
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-mercury">Repair tracker</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Track your computer repair status</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">Check the latest progress of your Mercury Computers repair or service order using the reference and phone number on your job card.</p>
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

        {result && <RepairJourney result={result} />}

        <section aria-labelledby="tracking-help" className="mt-12 border-t border-line pt-10">
          <div className="text-center">
            <h2 id="tracking-help" className="text-2xl font-semibold tracking-tight text-ink">How repair tracking works</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted">We update your order as it moves from assessment and quotation through payment, technician work, and collection.</p>
          </div>
          <ol className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              ["1", "Enter your details", "Use the repair reference and the phone number recorded on your order."],
              ["2", "View the latest update", "See the current repair stage and the updates already completed."],
              ["3", "Check again anytime", "Return with the same details whenever you want to see new progress."],
            ].map(([number, heading, copy]) => (
              <li key={number} className="rounded-2xl border border-line bg-white p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mercury/10 text-xs font-semibold text-mercury">{number}</span>
                <h3 className="mt-4 text-sm font-semibold text-ink">{heading}</h3>
                <p className="mt-2 text-xs leading-5 text-muted">{copy}</p>
              </li>
            ))}
          </ol>
          <p className="mt-7 text-center text-sm text-muted">
            Need to book a service? <Link href="/repairs" className="font-semibold text-mercury transition hover:text-mercury-dark">Create a repair request</Link>.
          </p>
        </section>
      </div>
    </main>
    <Footer />
  </>;
}
