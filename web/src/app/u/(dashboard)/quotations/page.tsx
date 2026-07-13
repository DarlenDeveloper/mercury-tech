import AdminHeader from "@/components/admin/AdminHeader";

export default function QuotationsPage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Quotations"
        subtitle="Create and manage customer quotations"
      />
      <div className="mt-16 flex flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-soft">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
        </div>
        <h2 className="mt-4 text-lg font-bold text-ink">Coming Soon</h2>
        <p className="mt-1 text-sm text-muted">Quotation management is being built.</p>
      </div>
    </div>
  );
}
