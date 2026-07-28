"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, Wrench } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { submitRepairRequest } from "@/lib/repairs";

const SERVICES = ["Repair", "Maintenance", "Installation", "Diagnosis"];
const DEVICES = [
  "Laptop",
  "Desktop",
  "Printer",
  "Monitor",
  "UPS",
  "Networking equipment",
  "Phone",
  "Other",
];

const inputClass =
  "mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-mercury focus:ring-2 focus:ring-mercury/10";

export default function RepairsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [service, setService] = useState(SERVICES[0]);
  const [deviceType, setDeviceType] = useState(DEVICES[0]);
  const [device, setDevice] = useState("");
  const [phone, setPhone] = useState("");
  const [issue, setIssue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/repairs");
    }
  }, [loading, router, user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || busy) return;

    setBusy(true);
    setError("");
    try {
      const id = await submitRepairRequest({
        userId: user.uid,
        userName: user.displayName ?? "",
        userEmail: user.email ?? "",
        userPhone: phone.trim(),
        device: `${deviceType}: ${device.trim()}`,
        issue: issue.trim(),
        service,
      });
      setTicketId(id);
    } catch {
      setError("We could not submit your request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f9]">
        <LoaderCircle className="h-8 w-8 animate-spin text-mercury" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#f6f7f9] px-4 py-12 lg:px-6 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mercury/10 text-mercury">
              <Wrench size={25} />
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">
              Repairs &amp; Services
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
              Tell us about your device and the service you need. Our technical
              team will review your request and contact you.
            </p>
          </div>

          <div className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
            {ticketId ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
                <h2 className="mt-4 text-xl font-bold text-ink">Request received</h2>
                <p className="mt-2 text-sm text-muted">
                  Your reference is <span className="font-semibold text-ink">{ticketId}</span>.
                  We&apos;ll contact you using the details provided.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="mt-6 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Return home
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-ink">
                  Service needed
                  <select value={service} onChange={(e) => setService(e.target.value)} className={inputClass}>
                    {SERVICES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>

                <label className="text-sm font-semibold text-ink">
                  Device type
                  <select value={deviceType} onChange={(e) => setDeviceType(e.target.value)} className={inputClass}>
                    {DEVICES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>

                <label className="text-sm font-semibold text-ink sm:col-span-2">
                  Device make and model
                  <input
                    required
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                    placeholder="e.g. HP ProBook 450 G9"
                    className={inputClass}
                  />
                </label>

                <label className="text-sm font-semibold text-ink">
                  Email
                  <input value={user.email ?? ""} readOnly className={`${inputClass} bg-gray-50 text-muted`} />
                </label>

                <label className="text-sm font-semibold text-ink">
                  Phone number
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0700 000 000"
                    className={inputClass}
                  />
                </label>

                <label className="text-sm font-semibold text-ink sm:col-span-2">
                  Describe the issue or service
                  <textarea
                    required
                    rows={5}
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="Include symptoms, damage, or the work you need done."
                    className={`${inputClass} resize-y`}
                  />
                </label>

                {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

                <button
                  type="submit"
                  disabled={busy}
                  className="flex h-12 items-center justify-center rounded-xl bg-mercury px-6 text-sm font-semibold text-white transition hover:bg-mercury-dark disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                >
                  {busy ? <LoaderCircle className="h-5 w-5 animate-spin" /> : "Submit service request"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
