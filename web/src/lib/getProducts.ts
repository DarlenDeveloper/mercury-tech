import { fetchProducts, fetchRate } from "./firestore";
import { type Product } from "./products";

/**
 * Fetches products from Firestore and converts to the Product type
 * used by frontend components (price in UGX).
 */
export async function getProductsFromFirestore(): Promise<Product[]> {
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
}
