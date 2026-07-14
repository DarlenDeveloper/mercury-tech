import { cache } from "react";
import { fetchProducts, fetchProductById, fetchRate, type FirestoreProduct } from "./firestore";
import { type Product } from "./products";

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
