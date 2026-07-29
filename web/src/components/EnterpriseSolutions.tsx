import Link from "next/link";
import {
  Setting2,
  Buildings2,
  Hierarchy3,
  ShieldSecurity,
  Camera,
  MoneyRecive,
  ArrowUp,
} from "iconsax-react";

const SOLUTIONS = [
  {
    title: "Maintenance",
    description: "Keep your technology reliable with preventive maintenance, diagnostics and expert support.",
    icon: Setting2,
    href: "/repairs",
    tone: "light",
  },
  {
    title: "IT Infrastructure",
    description: "Plan, deploy and maintain reliable systems that keep your organisation productive.",
    icon: Buildings2,
    href: "/repairs",
    tone: "orange",
  },
  {
    title: "Enterprise Networking",
    description: "Secure, high-performance wired and wireless networks built for modern teams.",
    icon: Hierarchy3,
    href: "/category/networking-security",
    tone: "blue",
  },
  {
    title: "Cybersecurity",
    description: "Protect users, devices and business data with practical, layered security solutions.",
    icon: ShieldSecurity,
    href: "mailto:corporate@mercurycomputerslimited.com?subject=Cybersecurity%20Solutions",
    tone: "light",
  },
  {
    title: "CCTV & Security",
    description: "Professional surveillance, access control and monitoring for complete visibility.",
    icon: Camera,
    href: "/category/networking-security/hikvision-cameras",
    tone: "orange",
  },
  {
    title: "Leasing",
    description: "Equip your workforce with current technology through flexible leasing arrangements.",
    icon: MoneyRecive,
    href: "mailto:corporate@mercurycomputerslimited.com?subject=Technology%20Leasing",
    tone: "blue",
  },
] as const;

const TONES = {
  light: {
    card: "bg-[#FFFCF8] text-ink",
    iconColor: "#24459f",
    copy: "text-muted",
    action: "bg-surface-soft text-ink",
  },
  orange: {
    card: "bg-[#FFF0E3] text-ink",
    iconColor: "#ff7100",
    copy: "text-[#6f5543]",
    action: "bg-mercury-accent text-white",
  },
  blue: {
    card: "bg-mercury text-white",
    iconColor: "#9EC1FF",
    copy: "text-white/70",
    action: "bg-white text-mercury",
  },
};

export default function EnterpriseSolutions() {
  return (
    <section>
      <div className="mb-7 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Built for business
        </p>
        <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-mercury-accent sm:text-3xl">
          Enterprise Solutions
        </h2>
        <p className="mx-auto mt-2 text-sm leading-6 text-muted lg:whitespace-nowrap">
          From infrastructure to intelligent automation, Mercury helps organisations
          build secure, scalable technology environments.
        </p>
      </div>

      <div className="grid grid-flow-col auto-cols-[minmax(250px,1fr)] gap-3 overflow-x-auto pb-5 xl:grid-cols-6 xl:auto-cols-auto xl:overflow-visible">
        {SOLUTIONS.map((solution) => {
          const Icon = solution.icon;
          const tone = TONES[solution.tone];
          return (
            <article
              key={solution.title}
              className={`flex min-h-[300px] min-w-0 flex-col rounded-[22px] p-5 ${tone.card}`}
            >
              <span className="inline-flex h-9 w-9 items-center justify-center">
                <Icon size={25} variant="Bulk" color={tone.iconColor} />
              </span>
              <h3 className="mt-7 text-[17px] font-semibold leading-tight">
                {solution.title}
              </h3>
              <p className={`mt-2 max-w-sm text-[13px] leading-5 ${tone.copy}`}>
                {solution.description}
              </p>
              <Link
                href={solution.href}
                className={`mt-auto inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-semibold transition hover:gap-2.5 ${tone.action}`}
              >
                Explore solution
                <ArrowUp size={13} className="rotate-45" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
