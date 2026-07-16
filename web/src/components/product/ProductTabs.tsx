"use client";

import { useState } from "react";
import { Sparkles, BookOpen, Lightbulb } from "lucide-react";
import type { Product } from "@/lib/products";
import ProductReviews from "./ProductReviews";

const TABS = ["Description", "Additional Information", "Reviews"] as const;
type Tab = (typeof TABS)[number];

export default function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<Tab>("Additional Information");

  return (
    <section className="mt-10">
      {/* Tab headers */}
      <div className="flex justify-center gap-8 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative -mb-px pb-3 text-sm font-semibold transition ${
              tab === t
                ? "text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            {t}
            {tab === t && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-mercury" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-8">
        {tab === "Description" && <DescriptionContent text={product.overview ?? product.description} />}

        {tab === "Additional Information" && <SpecTable product={product} />}

        {tab === "Reviews" && <ProductReviews productId={product.id} />}
      </div>
    </section>
  );
}

function DescriptionContent({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!text || !text.trim()) {
    return (
      <p className="text-center text-sm text-muted">
        No description available for this product.
      </p>
    );
  }

  // Parse sections from the text
  const sections = parseDescription(text);
  const mainText = sections.main;
  const isLong = mainText.length > 400;
  const displayText = expanded || !isLong ? mainText : mainText.slice(0, 400) + "…";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Main description */}
      <div>
        <p className="text-sm leading-relaxed text-muted whitespace-pre-line text-left">
          {displayText}
        </p>
        {isLong && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-2 text-sm font-semibold text-mercury transition hover:text-mercury-dark"
          >
            Read more
          </button>
        )}
      </div>

      {/* Key Features (extracted from text) */}
      {sections.features.length > 0 && (
        <div className="rounded-2xl border border-line bg-white p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mercury/10 text-mercury">
              <Sparkles size={15} />
            </span>
            Key Features
          </h3>
          <ul className="space-y-2">
            {sections.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mercury" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* How to Use */}
      {sections.howToUse.length > 0 && (
        <div className="rounded-2xl border border-line bg-white p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-mercury">
              <BookOpen size={15} />
            </span>
            How to Use
          </h3>
          <ol className="space-y-2">
            {sections.howToUse.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mercury/10 text-[11px] font-bold text-mercury">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Tips & Care */}
      {sections.tips.length > 0 && (
        <div className="rounded-2xl border border-line bg-white p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Lightbulb size={15} />
            </span>
            Tips & Care
          </h3>
          <ul className="space-y-2">
            {sections.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Parses a product description into structured sections. */
function parseDescription(raw: string) {
  let main = raw;
  const features: string[] = [];
  const howToUse: string[] = [];
  const tips: string[] = [];

  // Split at known markers
  const howToIdx = raw.search(/📖\s*HOW TO USE|HOW TO USE/i);
  const tipsIdx = raw.search(/💡\s*TIPS\s*[&]?\s*CARE|TIPS\s*[&]?\s*CARE/i);

  if (howToIdx > 0) {
    main = raw.slice(0, howToIdx).trim();
    const howToSection = tipsIdx > howToIdx
      ? raw.slice(howToIdx, tipsIdx)
      : raw.slice(howToIdx);

    // Extract numbered steps
    const steps = howToSection
      .replace(/📖\s*HOW TO USE/i, "")
      .split(/\d+\.\s*/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);
    howToUse.push(...steps);
  }

  if (tipsIdx > 0) {
    if (howToIdx <= 0) main = raw.slice(0, tipsIdx).trim();
    const tipsSection = raw.slice(tipsIdx);
    const items = tipsSection
      .replace(/💡\s*TIPS\s*[&]?\s*CARE/i, "")
      .split(/[•·]\s*/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);
    tips.push(...items);
  }

  // Try to extract key features from the main text
  // Look for "Key features include:" or similar patterns
  const featureIdx = main.search(/Key features include:|Features:|Key Specifications:/i);
  if (featureIdx > 0) {
    const featurePart = main.slice(featureIdx);
    main = main.slice(0, featureIdx).trim();

    // Split on colons followed by text that looks like a feature
    const parts = featurePart
      .replace(/Key features include:|Features:|Key Specifications:/i, "")
      .split(/(?=[A-Z][^:]+:)/g)
      .map((s) => s.trim())
      .filter((s) => s.length > 10 && s.length < 200);
    features.push(...parts.slice(0, 6));
  }

  return { main: main.trim(), features, howToUse, tips };
}

function SpecTable({ product }: { product: Product }) {
  const specs = product.specs ?? [];

  if (specs.length === 0) {
    return (
      <p className="text-center text-sm text-muted">
        No additional information available for this product yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-mercury text-white">
            <th className="px-4 py-3 font-semibold">Specification</th>
            <th className="px-4 py-3 font-semibold">Details</th>
            <th className="hidden px-4 py-3 font-semibold sm:table-cell">
              More Info
            </th>
            <th className="hidden px-4 py-3 font-semibold sm:table-cell">
              Remarks
            </th>
          </tr>
        </thead>
        <tbody>
          {specs.map((row, i) => (
            <tr
              key={row.spec}
              className={i % 2 === 0 ? "bg-white" : "bg-surface-soft"}
            >
              <td className="px-4 py-3 font-medium text-ink">{row.spec}</td>
              <td className="px-4 py-3 text-muted">{row.details}</td>
              <td className="hidden px-4 py-3 text-muted sm:table-cell">
                {row.moreInfo}
              </td>
              <td className="hidden px-4 py-3 text-muted sm:table-cell">
                {row.remarks}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


