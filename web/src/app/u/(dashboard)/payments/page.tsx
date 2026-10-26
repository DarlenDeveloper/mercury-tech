"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { Wallet, Search, X, ReceiptText, ShieldCheck } from "@/components/admin/WorkspaceIcons";
import { fetchRepairTickets, fetchRepairPayments, manageRepair, paymentLabel, repairPaid, type RepairTicket, type RepairPayment } from "@/lib/repairs";

const money = (amount: number) => `UGX ${amount.toLocaleString("en-UG")}`;
const inputClass = "mt-2 h-11 w-full rounded-xl border border-line bg-[#fafbfc] px-3 text-sm focus:border-mercury";

export default function PaymentsPage() {
  const base = usePathname().startsWith("/workshop") ? "/workshop" : "/u";
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<RepairTicket | null>(null);
  const [billingType, setBillingType] = useState("quotation");
  const [billingReference, setBillingReference] = useState("");
  const [due, setDue] = useState("");
  const [diagnosisSummary, setDiagnosisSummary] = useState("");
  const [recommendedWork, setRecommendedWork] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [payments, setPayments] = useState<RepairPayment[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try { setTickets(await fetchRepairTickets()); } catch { setError("Could not load repair balances. Refresh to retry."); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!selected) return;
    let active = true;
    setPayments([]); setHistoryError("");
    fetchRepairPayments(selected.id).then(data => { if (active) setPayments(data); }).catch(() => { if (active) setHistoryError("Could not load receipts. Reopen this repair to retry."); });
    return () => { active = false; };
  }, [selected]);
  function open(ticket: RepairTicket) {
    setSelected(ticket); setBillingType(ticket.billingType || "quotation"); setBillingReference(ticket.billingReference || ""); setDue(ticket.amountDue ? String(ticket.amountDue) : ""); setDiagnosisSummary(ticket.diagnosisSummary || ""); setRecommendedWork(ticket.recommendedWork || "");
    setAmount(""); setMethod("cash"); setReference(""); setPaymentId(crypto.randomUUID()); setError(""); setSuccess("");
  }
  async function save(action: "billing" | "payment" | "approve") {
    if (!selected || busy) return;
    setBusy(true); setError("");
    try {
      await manageRepair(selected.id, action, action === "billing" ? { billingType, billingReference, amountDue: Number(due), diagnosisSummary, recommendedWork } : action === "approve" ? {} : { amount: Number(amount), method, reference, paymentId });
      setSelected(null); setSuccess(action === "billing" ? "Diagnosis saved and quotation sent for approval." : action === "approve" ? "Customer approval recorded. The repair can now be assigned." : "Payment recorded. Fully paid repairs are ready for collection.");
      await load();
    } catch (error) { setError(error instanceof Error ? error.message : "Could not save. Please try again."); } finally { setBusy(false); }
  }
  const visible = tickets.filter(ticket => {
    const label = paymentLabel(ticket);
    return (filter === "all" || label === filter) && [ticket.userName, ticket.userEmail, ticket.device, ticket.id, ticket.billingReference || ""].some(value => value.toLowerCase().includes(search.toLowerCase()));
  });
  const totals = tickets.reduce((sum, ticket) => ({ due: sum.due + (ticket.amountDue || 0), paid: sum.paid + (ticket.totalPaid || 0) }), { due: 0, paid: 0 });
  return <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8 lg:py-7">
    <AdminHeader title="Payments" subtitle="From quotation to payment. Keep every repair moving." />
    <div className="mt-8 grid gap-4 sm:grid-cols-3">{[{ label: "Total quoted / LPO", value: totals.due, icon: ReceiptText }, { label: "Payments received", value: totals.paid, icon: ShieldCheck }, { label: "Outstanding balance", value: totals.due - totals.paid, icon: Wallet }].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-line bg-white p-6"><Icon size={27} className="text-mercury" /><p className="mt-5 text-xs text-muted">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{money(value)}</p></div>)}</div>
    <div className="mt-6 flex flex-wrap gap-3"><label className="flex min-w-60 flex-1 items-center gap-3 rounded-xl border border-line bg-white px-4"><Search size={19} className="text-muted" /><input aria-label="Search repairs" value={search} onChange={e => setSearch(e.target.value)} placeholder="Customer, repair or document reference" className="h-11 w-full bg-transparent text-sm outline-none" /></label><select aria-label="Filter payment status" value={filter} onChange={e => setFilter(e.target.value)} className="rounded-xl border border-line bg-white px-4 text-sm"><option value="all">All payments</option>{["Needs quotation / LPO", "Unpaid", "Part paid", "Paid"].map(label => <option key={label}>{label}</option>)}</select></div>
    {error && !selected && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}{success && <p role="status" className="mt-4 text-sm text-teal-700">{success}</p>}
    <section className="mt-5 overflow-x-auto rounded-2xl border border-line bg-white p-5">{loading ? <p className="py-10 text-center text-sm text-muted">Loading payments…</p> : !visible.length ? <p className="py-10 text-center text-sm text-muted">No matching repairs.</p> : <table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-line text-xs text-muted"><tr>{["Customer / repair", "Document", "Amount due", "Paid", "Balance", "Status", ""].map((label, i) => <th key={i} className="pb-4 font-medium">{label}</th>)}</tr></thead><tbody>{visible.map(ticket => <tr key={ticket.id} className="border-b border-line/60 last:border-0"><td className="py-5"><p className="font-medium">{ticket.userName || ticket.userEmail}</p><p className="mt-1 text-xs text-muted">{ticket.device}</p><p className="mt-1 text-[10px] text-muted">{ticket.trackingReference || ticket.id}</p></td><td>{ticket.billingReference ? <><p className="text-xs uppercase text-muted">{ticket.billingType}</p>{ticket.billingReference}</> : "Not set"}</td><td>{money(ticket.amountDue || 0)}</td><td>{money(ticket.totalPaid || 0)}</td><td>{money(Math.max(0, (ticket.amountDue || 0) - (ticket.totalPaid || 0)))}</td><td><span className={`rounded-full px-3 py-1 text-xs ${repairPaid(ticket) ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"}`}>{paymentLabel(ticket)}</span></td><td><button onClick={() => open(ticket)} className="font-medium text-mercury hover:underline">Manage</button></td></tr>)}</tbody></table>}</section>
    <p className="mt-4 text-xs leading-5 text-muted">Record diagnosis and quotations first. Payment is collected after approved repair work is completed.</p>
    {selected && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="payment-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-7"><div className="flex items-center justify-between"><h2 id="payment-title" className="text-xl font-semibold">Repair payment</h2><button aria-label="Close payment" disabled={busy} onClick={() => setSelected(null)}><X size={23} /></button></div><p className="mt-2 text-sm text-muted">{selected.userName || selected.userEmail} · {selected.device}</p><p className="mt-1 text-xs text-muted">{selected.id}</p>
      <fieldset disabled={busy || !!selected.totalPaid || (!!selected.workflowVersion && selected.workflowVersion >= 2 && !["under_diagnosis", "quotation_sent"].includes(selected.status))} className="mt-6 grid gap-4 sm:grid-cols-2"><legend className="mb-3 text-sm font-semibold">Diagnosis &amp; quotation</legend>{selected.workflowVersion && selected.workflowVersion >= 2 && <><label className="text-xs text-muted sm:col-span-2">Diagnosis summary<textarea value={diagnosisSummary} onChange={e => setDiagnosisSummary(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-line bg-[#fafbfc] px-3 py-3 text-sm outline-none focus:border-mercury" placeholder="What was found during diagnosis" /></label><label className="text-xs text-muted sm:col-span-2">Recommended work<textarea value={recommendedWork} onChange={e => setRecommendedWork(e.target.value)} rows={2} className="mt-2 w-full rounded-xl border border-line bg-[#fafbfc] px-3 py-3 text-sm outline-none focus:border-mercury" placeholder="Repair and parts required" /></label></>}<label className="text-xs text-muted">Document type<select value={billingType} onChange={e => setBillingType(e.target.value)} className={inputClass}><option value="quotation">Quotation</option><option value="lpo">LPO</option></select></label><label className="text-xs text-muted">Document reference<input value={billingReference} onChange={e => setBillingReference(e.target.value)} className={inputClass} placeholder="e.g. QUO-2026-001" /></label><label className="text-xs text-muted sm:col-span-2">Total amount due (UGX)<input type="number" min="1" step="1" value={due} onChange={e => setDue(e.target.value)} className={inputClass} /></label>{!selected.totalPaid && <button disabled={busy || !billingReference.trim() || !Number.isSafeInteger(Number(due)) || Number(due) <= 0 || (!!selected.workflowVersion && selected.workflowVersion >= 2 && !diagnosisSummary.trim())} onClick={() => save("billing")} className="rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white disabled:opacity-40 sm:col-span-2">{busy ? "Saving…" : selected.workflowVersion && selected.workflowVersion >= 2 ? "Complete diagnosis & send quotation" : "Save document"}</button>}</fieldset>
      {selected.workflowVersion && selected.workflowVersion >= 2 && selected.status === "quotation_sent" && <button disabled={busy} onClick={() => save("approve")} className="mt-4 w-full rounded-xl bg-[#24796d] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Record customer approval</button>}
      {!!selected.totalPaid && <p className="mt-3 text-xs text-muted">Document amount and reference are locked after the first payment.</p>}
      {!!selected.amountDue && !repairPaid(selected) && (selected.workflowVersion && selected.workflowVersion >= 2 ? selected.status === "completed_awaiting_payment" : selected.status === "completed") && <fieldset disabled={busy} className="mt-7 grid gap-4 border-t border-line pt-5 sm:grid-cols-2"><legend className="text-sm font-semibold">Record received payment</legend><p className="text-sm font-medium sm:col-span-2">Balance: {money((selected.amountDue || 0) - (selected.totalPaid || 0))}</p><label className="text-xs text-muted">Amount received (UGX)<input type="number" min="1" step="1" max={(selected.amountDue || 0) - (selected.totalPaid || 0)} value={amount} onChange={e => { setAmount(e.target.value); setPaymentId(crypto.randomUUID()); }} className={inputClass} /></label><label className="text-xs text-muted">Method<select value={method} onChange={e => { setMethod(e.target.value); setPaymentId(crypto.randomUUID()); }} className={inputClass}><option value="cash">Cash</option><option value="mobile_money">Mobile money</option><option value="bank_transfer">Bank transfer</option><option value="card">Card</option></select></label><label className="text-xs text-muted sm:col-span-2">Receipt / transaction reference<input value={reference} onChange={e => { setReference(e.target.value); setPaymentId(crypto.randomUUID()); }} placeholder="Receipt number or provider transaction ID" className={inputClass} /></label><button disabled={busy || !reference.trim() || !Number.isSafeInteger(Number(amount)) || Number(amount) <= 0 || Number(amount) > (selected.amountDue || 0) - (selected.totalPaid || 0)} onClick={() => save("payment")} className="rounded-xl bg-mercury px-4 py-3 text-sm font-medium text-white disabled:opacity-40 sm:col-span-2">{busy ? "Recording…" : "Record payment"}</button></fieldset>}
      {repairPaid(selected) && <Link href={`${base}/repairs`} className="mt-6 block rounded-xl bg-teal-50 p-4 text-sm font-medium text-teal-800">Paid in full · Ready for collection →</Link>}
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-7 border-t border-line pt-5"><h3 className="text-sm font-semibold">Payment history</h3>{historyError ? <p role="alert" className="mt-3 text-xs text-red-600">{historyError}</p> : !payments.length ? <p className="mt-3 text-xs text-muted">No receipts recorded.</p> : payments.map(payment => <div key={payment.id} className="flex justify-between gap-4 border-b border-line py-4 text-xs"><div><p className="font-medium">{payment.reference} · {payment.method.replaceAll("_", " ")}</p><p className="mt-1 text-muted">{payment.recordedAt.toLocaleString("en-UG")} · {payment.recordedBy}</p></div><span className="shrink-0 font-semibold">{money(payment.amount)}</span></div>)}</div>
    </section></div>}
  </div>;
}
