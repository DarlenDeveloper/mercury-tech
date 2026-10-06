import type { Metadata } from "next";

const SITE_URL = "https://mercurycomputerslimited.com";
const TRACKING_URL = `${SITE_URL}/repair-status`;
const title = "Track Your Computer Repair | Mercury Computers Uganda";
const description =
  "Track your Mercury Computers repair or service order online in Uganda. Enter your repair reference and phone number to see the latest status securely.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: TRACKING_URL },
  openGraph: {
    type: "website",
    locale: "en_UG",
    siteName: "Mercury Computers Limited",
    url: TRACKING_URL,
    title,
    description,
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Track a repair",
      item: TRACKING_URL,
    },
  ],
};

export default function RepairStatusLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
