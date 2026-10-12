import type { Product } from "./products";

export const LASER_PRINTERS_SLUG = "laser-printers";

/**
 * Aggregate every laser printer format while excluding consumables. The live
 * catalog uses several specific subcategories (colour, monochrome, A3/A4 and
 * multifunction), so the public "Laser Printers" link must combine them.
 */
export function isLaserPrinterProduct(product: Product): boolean {
  if (product.categoryId !== "printers-office") return false;

  const slugs = product.subcategorySlugs || [];
  const hasLaserPrinterTag = slugs.some(slug =>
    slug.includes("laser") &&
    slug.includes("printer") &&
    !slug.includes("toner") &&
    !slug.includes("cartridge")
  );
  // Classify from identity fields only. Descriptions for real printers often
  // mention toner replacement, which must not make the printer look like a
  // consumable.
  const text = [product.name, product.category, ...slugs]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const isConsumable = /\b(?:toner|cartridge|drum|imaging unit|transfer kit|maintenance kit|reload kit)\b/.test(text);
  const hasLaserSignal = /\blaser(?:jet)?\b/.test(text);
  const hasPrinterSignal = /\b(?:printer|mfp|multifunction|all[ -]?in[ -]?one)\b/.test(text);

  return !isConsumable && (hasLaserPrinterTag || (hasLaserSignal && hasPrinterSignal));
}
