import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import Sidebar from "@/components/Sidebar";
import { CATEGORIES } from "@/lib/categories";
import { getProductsFromFirestore } from "@/lib/getProducts";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();

  const allProducts = await getProductsFromFirestore();
  // Match by categoryId or category name
  const products = allProducts.filter(
    (p) => p.categoryId === slug ||
      p.category.toLowerCase().includes(category.name.toLowerCase().split(" ")[0])
  );

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="flex-1">
        <section className="px-4 py-6 lg:px-6 lg:py-8">
          <div className="flex gap-8">
            <Sidebar />
            <div className="min-w-0 flex-1">
              {/* Breadcrumb */}
              <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted">
                <Link href="/" className="transition hover:text-mercury">
                  Home
                </Link>
                <ChevronRight size={14} />
                <span className="font-medium text-ink">{category.name}</span>
              </nav>

              <h1 className="mb-6 text-2xl font-bold text-ink">
                {category.name}
              </h1>

              {products.length === 0 ? (
                <p className="text-muted">
                  No products found in this category yet.
                </p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(172px,1fr))] gap-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
