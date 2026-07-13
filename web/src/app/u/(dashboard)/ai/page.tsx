import AdminHeader from "@/components/admin/AdminHeader";

export default function AiPage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="AI"
        subtitle="AI-powered insights and automation"
      />
      <div className="mt-16 flex flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-soft">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.57-3.25 3.93a1 1 0 0 0-.75.97V13"/><path d="M12 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/><path d="M12 17v2"/><path d="M12 2V1"/><path d="m4.93 4.93-.7-.7"/><path d="M2 12h1"/><path d="m4.93 19.07-.7.7"/><path d="m19.07 4.93.7-.7"/><path d="M22 12h-1"/><path d="m19.07 19.07.7.7"/></svg>
        </div>
        <h2 className="mt-4 text-lg font-bold text-ink">Coming Soon</h2>
        <p className="mt-1 text-sm text-muted">AI features are being developed.</p>
      </div>
    </div>
  );
}
