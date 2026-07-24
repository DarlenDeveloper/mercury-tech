import { cache } from "react";
import { fetchProducts, fetchProductById, fetchRate, fetchHomepageConfig, type FirestoreProduct, type HomepageConfig } from "./firestore";
import { type Product } from "./products";

/** Cached homepage config (flash sale selection). */
export const getHomepageConfig = cache(async (): Promise<HomepageConfig> => {
  return fetchHomepageConfig();
});

/**
 * Builds the flash-sale row: each selected product with its admin-set promo
 * price applied as the current price and the original price struck through.
 * Sale prices come from config (USD) and are converted with the live rate;
 * the product records themselves are never modified.
 */
export const getFlashSaleProducts = cache(
  async (): Promise<{ title: string; products: Product[] }> => {
    const [cfg, firestoreProducts, rate] = await Promise.all([
      fetchHomepageConfig(),
      fetchProducts(),
      fetchRate(),
    ]);
    const byId = new Map(firestoreProducts.map((p) => [p.id, p]));
    const products = cfg.flashSale
      .map((entry) => {
        const fp = byId.get(entry.id);
        if (!fp) return null;
        const base = mapProduct(fp, rate);
        const salePrice = Math.round(entry.salePriceUsd * rate);
        // Only treat it as a deal if the promo price is actually lower.
        const oldPrice = salePrice < base.price ? base.price : undefined;
        return { ...base, price: salePrice, oldPrice };
      })
      .filter((p): p is Product => Boolean(p));
    return { title: cfg.flashSaleTitle, products };
  }
);

/** Maps a raw Firestore product to the frontend Product type. */
function mapProduct(p: FirestoreProduct, rate: number): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.shortDescription || p.description || "",
    category: p.category,
    categoryId: p.categoryId,
    price: Math.round(p.priceUsd * rate),
    oldPrice: undefined,
    rating: 4.5,
    reviews: "0 Reviews",
    image: p.image ?? "/placeholder-product.svg",
    gallery: p.images && p.images.length > 0 ? p.images : undefined,
    stock: p.stock,
    brand: p.brand,
    overview: p.description,
    specs: p.specifications
      ? Object.entries(p.specifications).map(([spec, details]) => ({
          spec,
          details,
          moreInfo: "",
          remarks: "",
        }))
      : undefined,
  };
}

/** Fetches a single product by ID (efficient — one Firestore doc read). */
export const getProductFromFirestore = cache(
  async (id: string): Promise<Product | null> => {
    const [fsProduct, rate] = await Promise.all([
      fetchProductById(id),
      fetchRate(),
    ]);
    if (!fsProduct) return null;
    return mapProduct(fsProduct, rate);
  }
);

/**
 * Fetches products from Firestore and converts to the Product type
 * used by frontend components (price in UGX).
 *
 * Wrapped in React cache() so multiple calls within a single render
 * (or request) reuse the same Firestore query instead of refetching.
 */
export const getProductsFromFirestore = cache(async (): Promise<Product[]> => {
  const [firestoreProducts, rate] = await Promise.all([
    fetchProducts(),
    fetchRate(),
  ]);

  return firestoreProducts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.shortDescription || p.description || "",
    category: p.category,
    categoryId: p.categoryId,
    price: Math.round(p.priceUsd * rate),
    oldPrice: undefined,
    rating: 4.5,
    reviews: "0 Reviews",
    image: p.image ?? "/placeholder-product.svg",
    gallery: p.images && p.images.length > 0 ? p.images : undefined,
    stock: p.stock,
    brand: p.brand,
    overview: p.description,
    specs: p.specifications
      ? Object.entries(p.specifications).map(([spec, details]) => ({
          spec,
          details,
          moreInfo: "",
          remarks: "",
        }))
      : undefined,
  }));
});
