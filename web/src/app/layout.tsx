import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const SITE_URL = "https://mercurycomputerslimited.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Computer Shop, Kampala Uganda – Buy Laptops, Printers, Desktops & Electronics",
    template: "%s",
  },
  description:
    "Mercury Computers is one of Uganda's leading independent retailers of laptops, printers and desktop computers. We stock hundreds of products from big brands like Lenovo, HP, Dell and Microsoft at the best prices. Free delivery within Uganda.",
  keywords: [
    "computer shop Kampala",
    "laptops Uganda",
    "printers Uganda",
    "desktops Kampala",
    "HP laptops Uganda",
    "Lenovo Uganda",
    "Dell Uganda",
    "Mercury Computers",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    siteName: "Computer Shop, Kampala Uganda",
    url: SITE_URL,
    title: "Computer Shop, Kampala Uganda – Laptops, Printers & Electronics",
    description:
      "Uganda's trusted ICT retailer. Official & brand new laptops, printers, desktops and more, with free delivery.",
  },
  robots: { index: true, follow: true },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Mercury Computers Limited",
  alternateName: "Computer Shop, Kampala Uganda",
  url: SITE_URL,
  telephone: "+256414256136",
  email: "customercare@mercurycomputerslimited.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Plot 91, Kamwokya, Kira Road",
    addressLocality: "Kampala",
    addressCountry: "UG",
  },
  sameAs: [
    "https://www.facebook.com/mercuryuganda/",
    "https://instagram.com/mercuryuganda/",
    "https://x.com/mercuryuganda/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-ink">
        <AuthProvider>
          <CurrencyProvider>{children}</CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
