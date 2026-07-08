"use client";

import { useState } from "react";
import { User, MapPin, Phone, X } from "lucide-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "@/lib/firestore";
import { type User as FirebaseUser } from "@/lib/auth";

type Props = {
  user: FirebaseUser;
  onComplete: () => void;
};

export default function AdminProfileSetup({ user, onComplete }: Props) {
  const [name, setName] = useState(user.displayName ?? "");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("Admin");
  const [customRole, setCustomRole] = useState("");
  const [busy, setBusy] = useState(false);

  const valid = name.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);

    try {
      // Update Firebase Auth display name
      await updateProfile(user, { displayName: name.trim() });

      // Save to Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: name.trim(),
          email: user.email ?? "",
          phone: phone.trim(),
          location: location.trim(),
          role: role === "Other" ? customRole.trim() || "Other" : role,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      onComplete();
    } catch (e) {
      console.error("Profile setup error:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-ink">Complete your profile</h2>
        <p className="mt-1 text-sm text-muted">
          Let&apos;s set up your admin profile before you get started.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Full Name
            </label>
            <div className="flex items-center gap-2 rounded-full bg-[#F4F5F8] px-4">
              <User size={16} className="text-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Phone Number
            </label>
            <div className="flex items-center gap-2 rounded-full bg-[#F4F5F8] px-4">
              <Phone size={16} className="text-muted" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 700 000 000"
                className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Location
            </label>
            <div className="flex items-center gap-2 rounded-full bg-[#F4F5F8] px-4">
              <MapPin size={16} className="text-muted" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kampala, Uganda"
                className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                if (e.target.value !== "Other") setCustomRole("");
              }}
              className="h-11 w-full rounded-full bg-[#F4F5F8] px-4 text-sm text-ink outline-none"
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Support">Support</option>
              <option value="Developer">Developer</option>
              <option value="Finance">Finance</option>
              <option value="Other">Other (specify)</option>
            </select>
          </div>

          {/* Custom role */}
          {role === "Other" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                Specify Role
              </label>
              <div className="flex items-center gap-2 rounded-full bg-[#F4F5F8] px-4">
                <User size={16} className="text-muted" />
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Your role"
                  className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!valid || busy}
            className="mt-2 h-11 rounded-full bg-ink text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
          >
            {busy ? "Saving..." : "Continue to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
