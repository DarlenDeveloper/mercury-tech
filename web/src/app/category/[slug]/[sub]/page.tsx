import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilteredProductGrid from "@/components/FilteredProductGrid";
import Sidebar from "@/components/Sidebar";
import { getCategoriesFromFirestore } from "@/lib/categories";
import { getProductsFromFirestore } from "@/lib/getProducts";

export const revalidate = 300;

export default async function SubCategoryPage({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>;
}) {
  const { slug, sub } = await params;
  const categories = await getCategoriesFromFirestore();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const subCategory = category.children.find((c) => c.slug === sub);
  if (!subCategory) notFound();

  const allProducts = await getProductsFromFirestore();
  const products = allProducts.filter((p) => {
    const prodCatSlug = p.category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return prodCatSlug === sub;
  });

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
                <Link
                  href={`/category/${slug}`}
                  className="transition hover:text-mercury"
                >
                  {category.name}
                </Link>
                <ChevronRight size={14} />
                <span className="font-medium text-ink">
                  {subCategory.name}
                </span>
              </nav>

              <h1 className="mb-6 text-2xl font-bold text-ink">
                {subCategory.name}
              </h1>

              <FilteredProductGrid products={products} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
