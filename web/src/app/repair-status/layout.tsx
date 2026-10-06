import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track a Repair — Mercury Computers",
  description: "Check the current status of a Mercury Computers repair or service order.",
};

export default function RepairStatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
