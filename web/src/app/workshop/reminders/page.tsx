"use client";

import { useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Check, Clock, Mail, RefreshCw, Search, ShieldAlert } from "@/components/admin/WorkspaceIcons";
import {
  fetchCustomerReminders,
  type CustomerReminder,
  type ReminderOutcome,
  type ReminderSummary,
} from "@/lib/reminders";
import { REPAIR_STATUS_LABELS, type RepairStatus } from "@/lib/repairs";

type Filter = "all" | "completed" | "failed";

const EMPTY_SUMMARY: ReminderSummary = { all: 0, completed: 0, failed: 0, pending: 0 };

const OUTCOME_STYLES: Record<ReminderOutcome, string> = {
  completed: "bg-[#e9f6ef] text-[#247a5a]",
  failed: "bg-[#f9ecea] text-[#a7463b]",
  pending: "bg-amber-50 text-amber-700",
};

function statusLabel(status: string) {
  return REPAIR_STATUS_LABELS[status as RepairStatus] || status.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase()) || "Repair update";
}

function providerStatusLabel(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function maskPhone(phone: string) {
  if (!phone) return "Phone unavailable";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 5) return phone;
  return `+${digits.slice(0, 3)} ••••• ${digits.slice(-4)}`;
}

function formatDate(value: Date | null) {
  if (!value || Number.isNaN(value.getTime())) return "Time unavailable";
  return value.toLocaleString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function failureCopy(reminder: CustomerReminder) {
  if (reminder.failureReason === "invalid_or_missing_phone") return "The customer has no valid WhatsApp phone number.";
  if (reminder.failureReason) return reminder.failureReason;
  return "KaCyberPay did not accept this reminder.";
}

export default function CustomerRemindersPage() {
  const [reminders, setReminders] = useState<CustomerReminder[]>([]);
  const [summary, setSummary] = useState<ReminderSummary>(EMPTY_SUMMARY);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function load(refresh = false) {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const data = await fetchCustomerReminders();
      setReminders(data.reminders);
      setSummary(data.summary);
    } catch {
      setError("Customer reminder logs could not be loaded. Refresh to try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reminders.filter(reminder => {
      if (filter !== "all" && reminder.outcome !== filter) return false;
      if (!term) return true;
      return [
        reminder.customerName,
        reminder.customerPhone,
        reminder.device,
        reminder.ticketId,
        reminder.trackingReference,
        reminder.repairStatus,
        reminder.providerStatus,
        reminder.kacyberReference,
        reminder.messageId,
        reminder.failureReason,
      ].some(value => value.toLowerCase().includes(term));
    });
  }, [filter, reminders, search]);

  const filters: Array<{ id: Filter; label: string; count: number }> = [
    { id: "all", label: "All reminders", count: summary.all },
    { id: "completed", label: "Completed", count: summary.completed },
    { id: "failed", label: "Failed", count: summary.failed },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Customer reminders"
        subtitle="Monitor WhatsApp repair updates sent to customers"
        action={(
          <button
            type="button"
            onClick={() => load(true)}
            disabled={loading || refreshing}
            className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-xs font-semibold text-ink transition hover:border-mercury hover:text-mercury disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        )}
      />

      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="All reminders" value={summary.all} icon={Mail} tone="neutral" />
        <SummaryCard label="Completed" value={summary.completed} icon={Check} tone="green" />
        <SummaryCard label="Failed" value={summary.failed} icon={ShieldAlert} tone="red" />
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${filter === item.id ? "bg-ink text-white" : "border border-line bg-white text-muted hover:border-mercury hover:text-mercury"}`}
              >
                {item.label}
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${filter === item.id ? "bg-white/15 text-white" : "bg-surface-soft text-muted"}`}>{item.count}</span>
              </button>
            ))}
          </div>
          <label className="flex h-11 w-full items-center gap-3 rounded-xl border border-line bg-[#fafbfc] px-4 lg:max-w-sm">
            <Search size={18} className="text-muted" />
            <input
              aria-label="Search customer reminders"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Customer, repair or provider reference"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </label>
        </div>
      </section>

      {error && (
        <p role="alert" className="mt-5 rounded-xl border border-[#ecd4d0] bg-[#f9ecea] px-4 py-3 text-sm text-[#923f35]">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" /></div>
      ) : visible.length === 0 ? (
        <section className="mt-5 rounded-3xl border border-line bg-white px-6 py-16 text-center">
          <Mail size={42} className="mx-auto text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-ink">No matching reminders</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            {reminders.length ? "Try another search or status filter." : "WhatsApp repair updates will be logged here when they are sent."}
          </p>
        </section>
      ) : (
        <section className="mt-5 overflow-hidden rounded-2xl border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-line bg-[#fafbfc] text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Repair update</th>
                  <th className="px-5 py-4">Provider</th>
                  <th className="px-5 py-4">Time</th>
                  <th className="px-5 py-4">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {visible.map(reminder => (
                  <tr key={reminder.id} className="align-top transition hover:bg-[#fafbfc]">
                    <td className="px-5 py-5">
                      <p className="font-semibold text-ink">{reminder.customerName}</p>
                      <p className="mt-1.5 text-xs text-muted">{maskPhone(reminder.customerPhone)}</p>
                    </td>
                    <td className="px-5 py-5">
                      <p className="font-medium text-ink">{statusLabel(reminder.repairStatus)}</p>
                      <p className="mt-1.5 text-xs text-muted">{reminder.device || "Device not recorded"}</p>
                      <p className="mt-1 font-mono text-[10px] text-muted">{reminder.trackingReference || reminder.ticketId}</p>
                    </td>
                    <td className="px-5 py-5">
                      <p className="font-medium capitalize text-ink">{reminder.provider}</p>
                      <p className="mt-1.5 text-xs text-muted">{reminder.kacyberReference || reminder.messageId || "Reference unavailable"}</p>
                      {reminder.fee !== null && <p className="mt-1 text-[11px] text-muted">{reminder.currency || "UGX"} {reminder.fee.toLocaleString("en-UG")}</p>}
                    </td>
                    <td className="px-5 py-5">
                      <p className="flex items-center gap-2 text-xs text-ink"><Clock size={15} className="text-muted" />{formatDate(reminder.updatedAt || reminder.acceptedAt)}</p>
                    </td>
                    <td className="px-5 py-5">
                      <span className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize ${OUTCOME_STYLES[reminder.outcome]}`}>{reminder.outcome}</span>
                      <p className="mt-2 text-[11px] text-muted">Provider: {providerStatusLabel(reminder.providerStatus)}</p>
                      {reminder.outcome === "failed" && (
                        <div className="mt-3 max-w-xs break-words rounded-xl border border-[#ecd4d0] bg-[#fbf2f1] px-3 py-2.5 text-xs leading-5 text-[#923f35]">
                          {failureCopy(reminder)}
                          {reminder.httpStatus ? <span className="mt-1 block text-[10px] opacity-70">HTTP {reminder.httpStatus}{reminder.retryable ? " · Retryable" : ""}</span> : null}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-4 text-xs leading-5 text-muted">
        Completed means KaCyberPay accepted the reminder. Delivered and read states will appear here after provider webhook tracking is connected.
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Mail;
  tone: "neutral" | "green" | "red";
}) {
  const iconStyle = tone === "green"
    ? "bg-[#e9f6ef] text-[#247a5a]"
    : tone === "red"
      ? "bg-[#f9ecea] text-[#a7463b]"
      : "bg-[#eef3f8] text-[#496173]";
  return (
    <article className="rounded-2xl border border-line bg-white p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle}`}><Icon size={20} variant="Bulk" /></div>
      <p className="mt-5 text-xs text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">{value.toLocaleString("en-UG")}</p>
    </article>
  );
}
