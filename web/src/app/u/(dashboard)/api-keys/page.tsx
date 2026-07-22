"use client";

import { useState, useEffect } from "react";
import { Plus, X, Copy, Check, Trash2, Ban, KeyRound, ShieldAlert } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import BarChart from "@/components/admin/charts/BarChart";
import {
  listApiKeys,
  createApiKey,
  revokeApiKey,
  deleteApiKey,
  getApiActivity,
  type ApiKey,
  type ApiScope,
  type ApiActivity,
} from "@/lib/apiKeys";
import { logAudit } from "@/lib/auditLog";
import { useAuth } from "@/components/AuthProvider";

const RESOURCES = ["products", "orders", "quotations", "repairs"] as const;

export default function ApiKeysPage() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [activity, setActivity] = useState<ApiActivity | null>(null);
  const [activityLoading, setActivityLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setKeys(await listApiKeys());
    } catch (e: any) {
      setError(e?.message || "Failed to load API keys.");
    } finally {
      setLoading(false);
    }
  };

  const loadActivity = async () => {
    setActivityLoading(true);
    try {
      setActivity(await getApiActivity(14, 50));
    } catch {
      // usage is non-critical; keep the page usable if it fails
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadActivity();
  }, []);

  const handleRevoke = async (k: ApiKey) => {
    if (!confirm(`Revoke "${k.label}"? Apps using this key will stop working immediately.`)) return;
    await revokeApiKey(k.id);
    logAudit({
      actor: user?.displayName || user?.email || "Unknown",
      actorId: user?.uid || "",
      action: "settings_updated",
      target: `API key revoked — ${k.label}`,
    });
    load();
  };

  const handleDelete = async (k: ApiKey) => {
    if (!confirm(`Permanently delete "${k.label}"? This cannot be undone.`)) return;
    await deleteApiKey(k.id);
    logAudit({
      actor: user?.displayName || user?.email || "Unknown",
      actorId: user?.uid || "",
      action: "settings_updated",
      target: `API key deleted — ${k.label}`,
    });
    load();
  };

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="API Keys"
        subtitle="Grant external systems scoped read/write access to your store data"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
          >
            <Plus size={16} />
            New Key
          </button>
        }
      />

      {/* Endpoint hint */}
      <div className="admin-card mt-6 p-4 text-sm">
        <p className="text-muted">
          Base URL: authenticate every request with{" "}
          <code className="rounded bg-surface-soft px-1.5 py-0.5 text-[12px]">Authorization: Bearer &lt;key&gt;</code>.
          Resources: {RESOURCES.join(", ")}. Scopes are per-resource{" "}
          <code className="rounded bg-surface-soft px-1.5 py-0.5 text-[12px]">read</code> /{" "}
          <code className="rounded bg-surface-soft px-1.5 py-0.5 text-[12px]">write</code>.
        </p>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <ShieldAlert size={16} /> {error}
        </div>
      )}

      {/* Usage summary */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="admin-card p-4" style={{ backgroundColor: "#eaf1fc" }}>
          <p className="text-[12px] text-muted">Total Calls (14d)</p>
          <p className="text-xl font-extrabold text-ink">{activity?.totals.total ?? "—"}</p>
        </div>
        <div className="admin-card p-4" style={{ backgroundColor: "#eef7ee" }}>
          <p className="text-[12px] text-muted">Successful (2xx–3xx)</p>
          <p className="text-xl font-extrabold text-ink">{activity?.totals.success ?? "—"}</p>
        </div>
        <div className="admin-card p-4" style={{ backgroundColor: "#fde8ea" }}>
          <p className="text-[12px] text-muted">Errors (4xx–5xx)</p>
          <p className="text-xl font-extrabold text-ink">{activity?.totals.errors ?? "—"}</p>
        </div>
      </div>

      {/* Usage graph */}
      <section className="admin-card mt-5 p-5">
        <h3 className="mb-4 text-lg font-bold text-ink">API Calls · Last 14 Days</h3>
        {activityLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
          </div>
        ) : activity && activity.totals.total > 0 ? (
          <BarChart
            labels={activity.daily.map((d) => d.date.slice(5).replace("-", "/"))}
            values={activity.daily.map((d) => d.count)}
            color="#1f3e97"
          />
        ) : (
          <p className="py-14 text-center text-sm text-muted">
            No API calls yet — the graph populates as your keys are used.
          </p>
        )}
      </section>

      <section className="admin-card mt-5 p-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-soft text-mercury">
              <KeyRound size={22} />
            </span>
            <p className="text-sm text-muted">No API keys yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[12px] font-medium text-muted">
                  <th className="pb-3 pl-1 font-medium">Label</th>
                  <th className="pb-3 font-medium">Key</th>
                  <th className="pb-3 font-medium">Scopes</th>
                  <th className="pb-3 font-medium">Usage</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b border-line/70 text-sm last:border-0">
                    <td className="py-3 pl-1">
                      <p className="font-medium text-ink">{k.label}</p>
                      <p className="text-[11px] text-muted">by {k.createdBy || "—"}</p>
                    </td>
                    <td className="py-3">
                      <code className="rounded bg-surface-soft px-1.5 py-0.5 text-[12px] text-ink">
                        {k.display}
                      </code>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {k.scopes.map((s) => (
                          <span key={s} className="rounded-full bg-surface-soft px-2 py-0.5 text-[10px] font-medium text-muted">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-muted text-[12px]">
                      {k.usageCount} calls
                      {k.lastUsedAt && (
                        <span className="block text-[11px]">
                          last {new Date(k.lastUsedAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {k.active ? (
                        <span className="rounded-full bg-[#e7f6ee] px-2.5 py-1 text-[11px] font-semibold text-[#16a34a]">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-surface-soft px-2.5 py-1 text-[11px] font-semibold text-muted">
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {k.active && (
                          <button
                            onClick={() => handleRevoke(k)}
                            title="Revoke"
                            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12px] text-amber-600 transition hover:bg-amber-50"
                          >
                            <Ban size={14} /> Revoke
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(k)}
                          title="Delete"
                          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12px] text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent request logs */}
      <section className="admin-card mt-5 p-5">
        <h3 className="mb-4 text-lg font-bold text-ink">Recent Requests</h3>
        {activityLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
          </div>
        ) : !activity || activity.logs.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">No requests logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[12px] font-medium text-muted">
                  <th className="pb-3 pl-1 font-medium">Time</th>
                  <th className="pb-3 font-medium">Key</th>
                  <th className="pb-3 font-medium">Method</th>
                  <th className="pb-3 font-medium">Path</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                {activity.logs.map((l) => (
                  <tr key={l.id} className="border-b border-line/70 text-sm last:border-0">
                    <td className="py-2.5 pl-1 text-[12px] text-muted">
                      {l.timestamp ? new Date(l.timestamp).toLocaleString() : "—"}
                    </td>
                    <td className="py-2.5 text-ink">{l.keyLabel}</td>
                    <td className="py-2.5">
                      <span className="rounded bg-surface-soft px-1.5 py-0.5 text-[11px] font-semibold text-ink">
                        {l.method}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[12px] text-muted">{l.path}</td>
                    <td className="py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          l.status >= 200 && l.status < 400
                            ? "bg-[#e7f6ee] text-[#16a34a]"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-[12px] text-muted">
                      {l.durationMs != null ? `${l.durationMs} ms` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <CreateKeyModal
          onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); load(); loadActivity(); }}
        />
      )}
    </div>
  );
}

function CreateKeyModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { user } = useAuth();
  const [label, setLabel] = useState("");
  const [scopes, setScopes] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toggle = (scope: string) => {
    setScopes((prev) => {
      const next = new Set(prev);
      next.has(scope) ? next.delete(scope) : next.add(scope);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!label.trim() || scopes.size === 0) return;
    setBusy(true);
    setError("");
    try {
      const res = await createApiKey(label.trim(), Array.from(scopes) as ApiScope[]);
      setCreatedKey(res.key);
      logAudit({
        actor: user?.displayName || user?.email || "Unknown",
        actorId: user?.uid || "",
        action: "settings_updated",
        target: `API key created — ${res.label}`,
      });
    } catch (e: any) {
      setError(e?.message || "Failed to create key.");
    } finally {
      setBusy(false);
    }
  };

  const copyKey = async () => {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink">
            {createdKey ? "Key Created" : "New API Key"}
          </h3>
          <button onClick={createdKey ? onCreated : onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        {createdKey ? (
          <div className="mt-4">
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-700">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              <span>
                Copy this key now — it&apos;s shown only once and cannot be retrieved again.
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-[#FAFBFC] p-3">
              <code className="flex-1 break-all text-[13px] text-ink">{createdKey}</code>
              <button
                onClick={copyKey}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-ink px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-black"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <button
              onClick={onCreated}
              className="mt-5 w-full rounded-full bg-ink py-2.5 text-sm font-semibold text-white transition hover:bg-black"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">Label</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Inventory sync (Zapier)"
                className="h-11 w-full rounded-xl border border-line bg-[#FAFBFC] px-4 text-sm text-ink outline-none focus:border-mercury"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                Scopes (least privilege recommended)
              </label>
              <div className="overflow-hidden rounded-xl border border-line">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line bg-surface-soft text-[11px] text-muted">
                      <th className="py-2 pl-3 text-left font-medium">Resource</th>
                      <th className="py-2 text-center font-medium">Read</th>
                      <th className="py-2 pr-3 text-center font-medium">Write</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RESOURCES.map((r) => (
                      <tr key={r} className="border-b border-line/60 last:border-0">
                        <td className="py-2 pl-3 capitalize text-ink">{r}</td>
                        <td className="py-2 text-center">
                          <input
                            type="checkbox"
                            checked={scopes.has(`${r}:read`)}
                            onChange={() => toggle(`${r}:read`)}
                          />
                        </td>
                        <td className="py-2 pr-3 text-center">
                          <input
                            type="checkbox"
                            checked={scopes.has(`${r}:write`)}
                            onChange={() => toggle(`${r}:write`)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:border-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={busy || !label.trim() || scopes.size === 0}
                className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
              >
                {busy ? "Creating..." : "Create Key"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
