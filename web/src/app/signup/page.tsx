"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, MapPin } from "lucide-react";
import { signUp } from "@/lib/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [phoneMode, setPhoneMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [location, setLocation] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const phoneEmail = `256${phone.replace(/\D/g, "").replace(/^0/, "")}@mercury.phone`;

  const valid =
    name.trim().length > 0 &&
    (phoneMode ? phone.replace(/\D/g, "").length >= 7 : email.includes("@")) &&
    password.length >= 6 &&
    password === confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setError("");
    setBusy(true);
    try {
      const signUpEmail = phoneMode ? phoneEmail : email.trim();
      await signUp(signUpEmail, password, name.trim());
      router.push("/");
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "auth/email-already-in-use") {
        setError("This account already exists. Try signing in.");
      } else if (code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err?.message ?? "Something went wrong.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#cfe6fb] via-[#e4f0fb] to-[#f4f8fc]">
      <div className="absolute left-6 top-6 flex items-center gap-2">
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

      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-3xl border border-white/60 bg-white/60 p-8 shadow-[0_30px_60px_-20px_rgba(31,62,151,0.25)] backdrop-blur-xl">
          <h1 className="text-center text-2xl font-extrabold tracking-tight text-ink">
            Create account
          </h1>
          <p className="mx-auto mt-1.5 max-w-[16rem] text-center text-[13px] leading-relaxed text-muted">
            Sign up to save favorites, track orders, and check out faster.
          </p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
            {/* Name */}
            <div className="flex items-center gap-2 rounded-full bg-white/80 px-3.5 shadow-sm ring-1 ring-black/5 transition focus-within:ring-mercury">
              <User size={16} className="text-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
            </div>

            {/* Email or Phone */}
            {phoneMode ? (
              <div className="flex items-center gap-2 rounded-full bg-white/80 px-3.5 shadow-sm ring-1 ring-black/5 transition focus-within:ring-mercury">
                <span className="text-sm text-muted">+256</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="700 000 000"
                  className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-white/80 px-3.5 shadow-sm ring-1 ring-black/5 transition focus-within:ring-mercury">
                <Mail size={16} className="text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                />
              </div>
            )}

            {/* Password */}
            <div className="flex items-center gap-2 rounded-full bg-white/80 px-3.5 shadow-sm ring-1 ring-black/5 transition focus-within:ring-mercury">
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

            {/* Confirm Password */}
            <div className="flex items-center gap-2 rounded-full bg-white/80 px-3.5 shadow-sm ring-1 ring-black/5 transition focus-within:ring-mercury">
              <Lock size={16} className="text-muted" />
              <input
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
                className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 rounded-full bg-white/80 px-3.5 shadow-sm ring-1 ring-black/5 transition focus-within:ring-mercury">
              <MapPin size={16} className="text-muted" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g. Kampala)"
                className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            {password.length > 0 && confirm.length > 0 && password !== confirm && (
              <p className="text-xs text-red-500">Passwords don&apos;t match.</p>
            )}

            <button
              type="submit"
              disabled={!valid || busy}
              className="mt-1 h-11 rounded-full bg-ink text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
            >
              {busy ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-4 text-center text-[13px] text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-ink hover:text-mercury">
              Sign in
            </Link>
          </p>
          <button
            type="button"
            onClick={() => { setPhoneMode(!phoneMode); setError(""); }}
            className="mt-2 block w-full text-center text-[13px] font-semibold text-mercury hover:text-mercury-dark"
          >
            {phoneMode ? "Use email instead" : "Use phone number instead"}
          </button>
        </div>
      </div>
    </div>
  );
}
