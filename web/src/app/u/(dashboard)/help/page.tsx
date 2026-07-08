import {
  BookOpen,
  MessageSquare,
  LifeBuoy,
  Activity,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";

const CARDS: { icon: LucideIcon; title: string; desc: string; action: string }[] = [
  { icon: BookOpen, title: "Documentation", desc: "Guides for managing products, orders and the storefront.", action: "Browse docs" },
  { icon: MessageSquare, title: "Contact Support", desc: "Reach the Mercury team for account or technical help.", action: "Start a chat" },
  { icon: LifeBuoy, title: "Submit a Ticket", desc: "Report an issue and track it to resolution.", action: "Open ticket" },
  { icon: Activity, title: "System Status", desc: "All services operational. View uptime and incidents.", action: "View status" },
];

const FAQS = [
  "How do I add a new product and set its USD price?",
  "How is the USD → UGX rate applied at checkout?",
  "How do I schedule a flash sale on the homepage?",
  "How do I invite a new staff member and set their role?",
  "Where can I export orders and financial reports?",
];

export default function HelpPage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Help & Support"
        subtitle="Guides, support and system status"
      />

      {/* Cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="admin-card flex items-start gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-soft text-mercury">
                <Icon size={20} />
              </span>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-ink">{c.title}</p>
                <p className="mt-1 text-[13px] text-muted">{c.desc}</p>
                <button className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-mercury transition hover:text-mercury-dark">
                  {c.action}
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQs */}
      <section className="admin-card mt-6 p-5">
        <h3 className="mb-2 text-lg font-bold text-ink">
          Frequently asked questions
        </h3>
        <ul className="flex flex-col">
          {FAQS.map((q) => (
            <li key={q}>
              <button className="flex w-full items-center justify-between gap-4 border-b border-line/70 py-3.5 text-left text-sm font-medium text-ink transition last:border-0 hover:text-mercury">
                {q}
                <ChevronRight size={16} className="shrink-0 text-muted" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
