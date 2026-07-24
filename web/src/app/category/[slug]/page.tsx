import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilteredProductGrid from "@/components/FilteredProductGrid";
import Sidebar from "@/components/Sidebar";
import { getCategoriesFromFirestore } from "@/lib/categories";
import { getProductsFromFirestore } from "@/lib/getProducts";

export const revalidate = 300;

const SITE_NAME = "Computer Shop, Kampala Uganda";
const SITE_URL = "https://mercurycomputerslimited.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategoriesFromFirestore();
  const category = categories.find((c) => c.slug === slug);
  const name = category?.name || "Shop";
  const title = `${name} – ${SITE_NAME}`;
  const description = `Shop ${name} at Mercury Computers, Uganda's trusted ICT retailer. Official & brand new, free delivery within Kampala Central.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/category/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/category/${slug}`, siteName: SITE_NAME },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getCategoriesFromFirestore();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const allProducts = await getProductsFromFirestore();
  const products = allProducts.filter((p) => p.categoryId === slug);

  return (
    <>
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

              <FilteredProductGrid products={products} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
