import type { Metadata } from "next";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy – Computer Shop, Kampala Uganda",
  description: "Privacy Policy for Mercury Computers Limited. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 lg:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">Last updated: July 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted">
          <Section title="1. Who We Are">
            Mercury Computers Limited ("Mercury", "we", "our") operates the mercurycomputerslimited.com website and mobile application. We are located at Plot 91, Kamwokya, Kira Road, Kampala, Uganda. For privacy inquiries, contact us at customercare@mercurycomputerslimited.com or call 0414 256 136.
          </Section>

          <Section title="2. Information We Collect">
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Account information:</strong> Name, email address, phone number when you create an account or place an order.</li>
              <li><strong>Order information:</strong> Products purchased, delivery address, payment method selected.</li>
              <li><strong>Usage data:</strong> Pages visited, search queries, device type, browser information — collected automatically to improve our services.</li>
              <li><strong>Communications:</strong> Messages you send through our AI assistant or customer care channels.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>To process and deliver your orders.</li>
              <li>To communicate with you about your orders, quotations, and support requests.</li>
              <li>To personalise your shopping experience and provide product recommendations.</li>
              <li>To improve our website, mobile app, and services.</li>
              <li>To send promotional communications (you can opt out at any time).</li>
              <li>To prevent fraud and ensure security.</li>
            </ul>
          </Section>

          <Section title="4. Information Sharing">
            We do not sell your personal information. We may share your data with:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Service providers:</strong> Payment processors, delivery partners, hosting services (Firebase/Google Cloud) that help us operate.</li>
              <li><strong>Legal requirements:</strong> When required by Ugandan law or to protect our rights.</li>
            </ul>
          </Section>

          <Section title="5. Data Security">
            We use industry-standard measures to protect your data, including SSL encryption, Firebase Security Rules, and secure authentication. However, no internet transmission is 100% secure and we cannot guarantee absolute security.
          </Section>

          <Section title="6. Your Rights">
            You have the right to:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Opt out of marketing communications.</li>
            </ul>
            To exercise these rights, email customercare@mercurycomputerslimited.com.
          </Section>

          <Section title="7. Cookies & Analytics">
            We use cookies and similar technologies to maintain your session, remember preferences (such as currency selection), and collect anonymous analytics to improve our services.
          </Section>

          <Section title="8. Third-Party Services">
            Our services integrate with Google Firebase (authentication, database, hosting), Google Analytics, and WhatsApp for customer support. These services have their own privacy policies.
          </Section>

          <Section title="9. Children's Privacy">
            Our services are not directed to individuals under 18. We do not knowingly collect personal information from children.
          </Section>

          <Section title="10. Changes to This Policy">
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. Continued use of our services after changes constitutes acceptance.
          </Section>

          <Section title="11. Contact Us">
            If you have questions about this Privacy Policy, contact us:
            <ul className="mt-2 list-none space-y-1 pl-0">
              <li><strong>Email:</strong> customercare@mercurycomputerslimited.com</li>
              <li><strong>Phone:</strong> 0414 256 136 / 0707 749 506</li>
              <li><strong>Address:</strong> Plot 91, Kamwokya, Kira Road, Kampala, Uganda</li>
            </ul>
          </Section>
        </div>
      </main>

      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-ink">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
