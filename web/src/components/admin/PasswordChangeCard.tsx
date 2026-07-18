"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { useAuth } from "@/components/AuthProvider";

export default function PasswordChangeCard() {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = async () => {
    setMessage(null);

    if (!user || !user.email) {
      setMessage({ type: "error", text: "No user signed in." });
      return;
    }
    if (newPass.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPass !== confirm) {
      setMessage({ type: "error", text: "Passwords don't match." });
      return;
    }

    setBusy(true);
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, current);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPass);

      setMessage({ type: "success", text: "Password updated successfully." });
      setCurrent("");
      setNewPass("");
      setConfirm("");
    } catch (e: any) {
      const code = e?.code ?? "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setMessage({ type: "error", text: "Current password is incorrect." });
      } else if (code === "auth/requires-recent-login") {
        setMessage({ type: "error", text: "Please sign out and sign in again before changing password." });
      } else {
        setMessage({ type: "error", text: e?.message ?? "Something went wrong." });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="admin-card p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-soft text-mercury">
          <Lock size={18} />
        </span>
        <h3 className="text-[15px] font-bold text-ink">Change Password</h3>
      </div>

      <div className="flex flex-col gap-3">
        <PasswordField
          label="Current password"
          value={current}
          onChange={setCurrent}
          show={showCurrent}
          onToggle={() => setShowCurrent(!showCurrent)}
        />
        <PasswordField
          label="New password"
          value={newPass}
          onChange={setNewPass}
          show={showNew}
          onToggle={() => setShowNew(!showNew)}
        />
        <PasswordField
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          show={showNew}
          onToggle={() => setShowNew(!showNew)}
        />
      </div>

      {message && (
        <p className={`mt-3 text-xs font-medium ${message.type === "success" ? "text-[#16a34a]" : "text-red-500"}`}>
          {message.text}
        </p>
      )}

      <button
        onClick={handleChange}
        disabled={busy || !current || !newPass || !confirm}
        className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
      >
        {busy ? "Updating..." : "Update Password"}
      </button>
    </section>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="relative mt-1.5">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-line bg-surface-soft px-3.5 py-2.5 pr-10 text-sm text-ink outline-none transition focus:border-mercury focus:bg-white"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-ink"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}
