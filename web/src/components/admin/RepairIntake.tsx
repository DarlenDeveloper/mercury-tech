"use client";
import { useState } from "react";
import { Plus, X } from "./WorkspaceIcons";
import { manageRepair } from "@/lib/repairs";

export default function RepairIntake({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  return <>
    <button onClick={() => { setOpen(true); setId(crypto.randomUUID()); setError(""); setReference(""); }} className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white"><Plus size={19} />New repair</button>
    {open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="intake-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-7"><div className="flex items-center justify-between"><h2 id="intake-title" className="text-xl font-semibold">New repair order</h2><button aria-label="Close intake" disabled={busy} onClick={() => setOpen(false)}><X size={23} /></button></div>{reference ? <div className="mt-6"><p className="text-sm text-teal-700">Repair received. Give this reference to the customer.</p><p className="mt-3 break-all rounded-xl bg-slate-50 p-4 font-mono text-sm">{reference}</p><button onClick={() => setOpen(false)} className="mt-5 text-sm font-medium text-mercury">Done</button></div> : <form className="mt-6 space-y-4" onSubmit={async event => {
      event.preventDefault(); if (busy) return;
      const data = Object.fromEntries(new FormData(event.currentTarget));
      setBusy(true); setError("");
      try { await manageRepair(id, "create", data); setReference(id); onCreated(); } catch (error) { setError(error instanceof Error ? error.message : "Could not create repair."); } finally { setBusy(false); }
    }}><fieldset disabled={busy} className="space-y-4">{[{ name: "userName", label: "Customer name", required: true }, { name: "userPhone", label: "Phone number", type: "tel", required: true }, { name: "userEmail", label: "Email (optional)", type: "email", required: false }, { name: "device", label: "Device / model", required: true }].map(field => <label key={field.name} className="block text-xs font-medium text-muted">{field.label}<input name={field.name} type={field.type || "text"} required={field.required} maxLength={300} className="mt-2 h-11 w-full rounded-xl border border-line px-3 text-sm text-ink" /></label>)}<label className="block text-xs font-medium text-muted">Service<select name="service" className="mt-2 h-11 w-full rounded-xl border border-line px-3 text-sm text-ink">{["Repair", "Maintenance", "Installation", "Diagnosis"].map(value => <option key={value}>{value}</option>)}</select></label><label className="block text-xs font-medium text-muted">Issue<textarea required name="issue" maxLength={3000} rows={3} className="mt-2 w-full rounded-xl border border-line p-3 text-sm text-ink" /></label><button disabled={busy} className="w-full rounded-xl bg-ink py-3 text-sm font-medium text-white disabled:opacity-50">{busy ? "Creating…" : "Create repair order"}</button></fieldset>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}</form>}</section></div>}
  </>;
}
