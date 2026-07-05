import { Search, Bell, ChevronDown } from "lucide-react";

export default function AdminHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {action}

        <button
          type="button"
          aria-label="Search"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-muted shadow-sm transition hover:text-ink"
        >
          <Search size={18} />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-muted shadow-sm transition hover:text-ink"
        >
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-mercury-accent ring-2 ring-white" />
        </button>

        <span className="mx-1 hidden h-6 w-px bg-line sm:block" />

        <button
          type="button"
          className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition hover:bg-surface-soft"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mercury text-sm font-bold text-white">
            DO
          </span>
          <span className="hidden text-sm font-semibold text-ink sm:block">
            Daniel Okello
          </span>
          <ChevronDown size={16} className="text-muted" />
        </button>
      </div>
    </header>
  );
}
