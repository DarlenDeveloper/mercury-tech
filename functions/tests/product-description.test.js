import test from "node:test";
import assert from "node:assert/strict";
import { parseGeneratedContent } from "../product-description.js";

test("generated product content always includes storefront usage and care sections", () => {
  const result = parseGeneratedContent(JSON.stringify({
    description: "A practical laptop for everyday office work and study.",
    howToUse: [
      "1. Connect the supplied power adapter and charge the laptop.",
      "2. Press the power button and follow the on-screen setup.",
      "3. Connect to a trusted network and install required updates.",
    ],
    tipsAndCare: [
      "• Carry the laptop in a protective bag.",
      "• Keep liquids away from the keyboard.",
      "• Use a soft, dry cloth for cleaning.",
    ],
    specifications: { Memory: "8GB" },
  }));

  assert.match(result.description, /📖 HOW TO USE\n\n1\. Connect the supplied power adapter/);
  assert.match(result.description, /💡 TIPS & CARE\n\n• Carry the laptop in a protective bag/);
  assert.deepEqual(result.howToUse, [
    "Connect the supplied power adapter and charge the laptop.",
    "Press the power button and follow the on-screen setup.",
    "Connect to a trusted network and install required updates.",
  ]);
  assert.deepEqual(result.tipsAndCare, [
    "Carry the laptop in a protective bag.",
    "Keep liquids away from the keyboard.",
    "Use a soft, dry cloth for cleaning.",
  ]);
  assert.deepEqual(result.specifications, { Memory: "8GB" });
});

test("generated content is rejected when either important section is missing", () => {
  assert.throws(() => parseGeneratedContent(JSON.stringify({
    description: "Product description",
    howToUse: ["Set up the product carefully."],
    specifications: {},
  })), /care tips/i);
  assert.throws(() => parseGeneratedContent(JSON.stringify({
    description: "Product description",
    tipsAndCare: ["Keep the product clean and dry."],
    specifications: {},
  })), /usage instructions/i);
});
