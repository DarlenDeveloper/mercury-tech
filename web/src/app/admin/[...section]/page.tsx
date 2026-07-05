import { Hammer } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";

function titleFor(section: string[]): string {
  const last = section[section.length - 1] ?? "Page";
  return last
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function AdminPlaceholderPage({
  params,
}: {
  params: Promise<{ section: string[] }>;
}) {
  const { section } = await params;
  const title = titleFor(section);

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader title={title} subtitle="This section is coming soon" />

      <div className="admin-card mt-6 flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-soft text-mercury">
          <Hammer size={26} />
        </span>
        <h2 className="text-lg font-bold text-ink">{title} is under construction</h2>
        <p className="max-w-sm text-sm text-muted">
          We&apos;re building this page next. The navigation and layout are ready —
          content will be wired up soon.
        </p>
      </div>
    </div>
  );
}
