"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { signIn } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      router.push("/u");
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        setError("Invalid credentials.");
      } else if (code === "auth/user-not-found") {
        setError("Account not found.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else {
        setError(err?.message ?? "Something went wrong.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#cfe6fb] via-[#e4f0fb] to-[#f4f8fc]">
      {/* Logo */}
      <div className="absolute left-6 top-6">
        <Link href="/">
          <Image
            src="/mercury-logo.png"
            alt="Mercury"
            width={160}
            height={30}
            className="h-8 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Centered card */}
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-3xl border border-white/60 bg-white/60 p-8 shadow-[0_30px_60px_-20px_rgba(31,62,151,0.25)] backdrop-blur-xl">
          {/* Icon */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-ink shadow-sm">
            <LogIn size={20} />
          </div>

          <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-ink">
            Admin Sign In
          </h1>
          <p className="mx-auto mt-1.5 max-w-[16rem] text-center text-[13px] leading-relaxed text-muted">
            Manage your products, orders and store — all in one place.
          </p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
            {/* Email */}
            <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3.5 shadow-sm ring-1 ring-black/5 transition focus-within:ring-mercury">
              <Mail size={16} className="text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email"
                className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3.5 shadow-sm ring-1 ring-black/5 transition focus-within:ring-mercury">
              <Lock size={16} className="text-muted" />
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="text-muted transition hover:text-ink"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="mt-1 h-11 rounded-xl bg-ink text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
            >
              {busy ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
