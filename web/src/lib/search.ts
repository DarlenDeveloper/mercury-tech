import { type Product } from "./products";

/**
 * Searches products by name, brand, category, and description.
 * Returns results ranked by relevance (best matches first).
 */
export function searchProducts(products: Product[], rawQuery: string): Product[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  // Split into individual terms for multi-word matching
  const terms = query.split(/\s+/).filter(Boolean);

  const scored = products
    .map((product) => ({
      product,
      score: scoreProduct(product, query, terms),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((r) => r.product);
}

function scoreProduct(product: Product, query: string, terms: string[]): number {
  const name = (product.name || "").toLowerCase();
  const brand = (product.brand || "").toLowerCase();
  const category = (product.category || "").toLowerCase();
  const description = (product.description || "").toLowerCase();
  const overview = (product.overview || "").toLowerCase();

  let score = 0;

  // Exact full-query matches (highest priority)
  if (name === query) score += 100;
  if (name.startsWith(query)) score += 50;
  if (name.includes(query)) score += 30;
  if (brand === query) score += 40;
  if (brand.includes(query)) score += 20;
  if (category.includes(query)) score += 15;

  // Per-term matching (all terms must match somewhere for a decent score)
  let termsMatched = 0;
  for (const term of terms) {
    let termHit = false;
    if (name.includes(term)) { score += 10; termHit = true; }
    if (brand.includes(term)) { score += 8; termHit = true; }
    if (category.includes(term)) { score += 5; termHit = true; }
    if (description.includes(term)) { score += 2; termHit = true; }
    if (overview.includes(term)) { score += 1; termHit = true; }
    if (termHit) termsMatched++;
  }

  // Require all terms to match somewhere (avoids loose partial matches)
  if (terms.length > 1 && termsMatched < terms.length) {
    // Only keep if the full query is present in the name
    if (!name.includes(query)) return 0;
  }

  return score;
}
