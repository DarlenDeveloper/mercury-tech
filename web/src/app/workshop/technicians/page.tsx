"use client";

import { useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Plus, Search, X, User, Phone, Mail, Setting2 } from "@/components/admin/WorkspaceIcons";
import { approveTechnicianLink, deactivateTechnician, fetchTechnicians, saveTechnician, technicianErrorMessage, type Technician } from "@/lib/technicians";

const emptyForm = { name: "", phone: "", email: "", speciality: "", notes: "" };
const inputClass = "mt-1.5 h-11 w-full rounded-xl border border-line bg-[#fafbfc] px-3 text-sm outline-none transition focus:border-mercury";

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Technician | null | undefined>(undefined);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try { setTechnicians(await fetchTechnicians()); }
    catch (error) { setError(technicianErrorMessage(error, "Could not load technicians.")); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return technicians.filter(item => !term || [item.name, item.phone, item.email, item.speciality].some(value => value.toLowerCase().includes(term)));
  }, [search, technicians]);

  function openCreate() { setForm(emptyForm); setEditing(null); setError(""); }
  function openEdit(item: Technician) {
    setForm({ name: item.name, phone: item.phone, email: item.email, speciality: item.speciality, notes: item.notes });
    setEditing(item); setError("");
  }
  async function save() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      await saveTechnician({ id: editing?.id, ...form, active: editing?.active ?? true });
      setEditing(undefined); await load();
    } catch (error) { setError(technicianErrorMessage(error, "Could not save technician.")); }
    finally { setBusy(false); }
  }
  async function deactivate(item: Technician) {
    if (busy || !window.confirm(`Deactivate ${item.name}? Existing job history will be kept.`)) return;
    setBusy(true); setError("");
    try { await deactivateTechnician(item.id); await load(); }
    catch (error) { setError(technicianErrorMessage(error, "Could not deactivate technician.")); }
    finally { setBusy(false); }
  }
  async function approveLink(item: Technician) {
    if (busy) return;
    setBusy(true); setError("");
    try { await approveTechnicianLink(item.id); await load(); }
    catch (error) { setError(technicianErrorMessage(error, "Could not link account.")); }
    finally { setBusy(false); }
  }

  return <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8 lg:py-7">
    <AdminHeader title="Technicians" subtitle="Create workshop technicians, assign work and link accounts when they are ready." action={<button onClick={openCreate} className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black"><Plus size={18} />Add technician</button>} />

    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {[
        ["Active technicians", technicians.filter(item => item.active).length, "bg-[#eef7ee] text-[#24796d]"],
        ["WhatsApp only", technicians.filter(item => item.active && !item.authUid).length, "bg-[#fef3e2] text-[#b45309]"],
        ["Linked accounts", technicians.filter(item => item.active && !!item.authUid).length, "bg-[#eaf1fc] text-mercury"],
      ].map(([label, value, color]) => <div key={String(label)} className="rounded-2xl border border-line bg-white p-5"><p className="text-xs text-muted">{label}</p><div className="mt-3 flex items-end justify-between"><p className="text-3xl font-semibold tracking-tight">{value}</p><span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${color}`}>{label}</span></div></div>)}
    </div>

    <label className="mt-6 flex max-w-xl items-center gap-3 rounded-xl border border-line bg-white px-4"><Search size={18} className="text-muted" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, WhatsApp, email or speciality" className="h-11 w-full bg-transparent text-sm outline-none" /></label>
    {error && editing === undefined && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

    <section className="mt-5 overflow-hidden rounded-2xl border border-line bg-white">
      {loading ? <p className="py-14 text-center text-sm text-muted">Loading technicians…</p> : !visible.length ? <div className="px-6 py-14 text-center"><User size={34} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-semibold">No technicians yet</p><p className="mt-1 text-xs text-muted">Add someone using only their name and WhatsApp number.</p></div> : <div className="divide-y divide-line">{visible.map(item => <article key={item.id} className={`flex flex-col gap-4 p-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-center ${item.active ? "" : "opacity-55"}`}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#edf5f2] text-sm font-bold text-[#24796d]">{item.name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase()}</div>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-ink">{item.name}</h2><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${item.authUid ? "bg-[#eaf1fc] text-mercury" : item.accountLinkStatus === "pending" ? "bg-[#f3e8ff] text-[#7c3aed]" : "bg-[#fef3e2] text-[#b45309]"}`}>{item.authUid ? "Account linked" : item.accountLinkStatus === "pending" ? "Match pending" : "WhatsApp only"}</span>{!item.active && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-muted">Inactive</span>}</div><div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted"><span className="flex items-center gap-1.5"><Phone size={14} />{item.phone}</span>{item.email && <span className="flex items-center gap-1.5"><Mail size={14} />{item.email}</span>}{item.speciality && <span className="flex items-center gap-1.5"><Setting2 size={14} />{item.speciality}</span>}</div>{item.accountLinkStatus === "pending" && <p className="mt-2 text-xs text-[#7c3aed]">Possible account: {item.pendingAuthEmail || "Account awaiting review"}</p>}</div>
        <div className="flex items-center gap-2">{item.accountLinkStatus === "pending" && <button disabled={busy} onClick={() => approveLink(item)} className="rounded-full bg-[#edf5f2] px-4 py-2 text-xs font-semibold text-[#24796d] disabled:opacity-50">Approve match</button>}<button onClick={() => openEdit(item)} className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink hover:border-ink">Edit</button>{item.active && <button disabled={busy} onClick={() => deactivate(item)} className="px-2 py-2 text-xs font-medium text-red-500 disabled:opacity-50">Deactivate</button>}</div>
      </article>)}</div>}
    </section>

    {editing !== undefined && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="technician-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl"><div className="flex items-center justify-between"><div><h2 id="technician-title" className="text-xl font-semibold">{editing ? "Edit technician" : "Add technician"}</h2><p className="mt-1 text-xs text-muted">No login account is required. WhatsApp is used for assignments.</p></div><button aria-label="Close" disabled={busy} onClick={() => setEditing(undefined)}><X size={22} /></button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold">Full name<input autoFocus value={form.name} onChange={event => setForm(previous => ({ ...previous, name: event.target.value }))} className={inputClass} placeholder="Technician name" /></label><label className="text-xs font-semibold">WhatsApp number<input type="tel" value={form.phone} onChange={event => setForm(previous => ({ ...previous, phone: event.target.value }))} className={inputClass} placeholder="0700 000 000" /></label><label className="text-xs font-semibold">Email <span className="font-normal text-muted">(optional)</span><input type="email" value={form.email} onChange={event => setForm(previous => ({ ...previous, email: event.target.value }))} className={inputClass} placeholder="name@example.com" /></label><label className="text-xs font-semibold">Speciality <span className="font-normal text-muted">(optional)</span><input value={form.speciality} onChange={event => setForm(previous => ({ ...previous, speciality: event.target.value }))} className={inputClass} placeholder="Laptops, printers…" /></label><label className="text-xs font-semibold sm:col-span-2">Internal notes <span className="font-normal text-muted">(optional)</span><textarea value={form.notes} onChange={event => setForm(previous => ({ ...previous, notes: event.target.value }))} rows={3} className="mt-1.5 w-full resize-none rounded-xl border border-line bg-[#fafbfc] px-3 py-3 text-sm outline-none focus:border-mercury" /></label></div>
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}<div className="mt-6 flex justify-end gap-3"><button disabled={busy} onClick={() => setEditing(undefined)} className="rounded-full border border-line px-5 py-2.5 text-sm font-medium">Cancel</button><button disabled={busy || !form.name.trim() || form.phone.replace(/\D/g, "").length < 9} onClick={save} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{busy ? "Saving…" : editing ? "Save changes" : "Create technician"}</button></div>
    </section></div>}
  </div>;
}

