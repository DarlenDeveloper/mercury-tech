import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilteredProductGrid from "@/components/FilteredProductGrid";
import { getCategoriesFromFirestore } from "@/lib/categories";
import { getProductsFromFirestore } from "@/lib/getProducts";

export const revalidate = 300;

const SITE_NAME = "Computer Shop, Kampala Uganda";
const SITE_URL = "https://mercurycomputerslimited.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>;
}): Promise<Metadata> {
  const { slug, sub } = await params;
  const categories = await getCategoriesFromFirestore();
  const category = categories.find((c) => c.slug === slug);
  const subCategory = category?.children.find((c) => c.slug === sub);
  const name = subCategory?.name || category?.name || "Shop";
  const title = `${name} – ${SITE_NAME}`;
  const description = `Buy ${name} in Uganda at Mercury Computers. Official & brand new, best prices, free delivery within Kampala Central.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/category/${slug}/${sub}` },
    openGraph: { title, description, url: `${SITE_URL}/category/${slug}/${sub}`, siteName: SITE_NAME },
  };
}

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
    if (slug === "desktops" && sub === "all-in-one-pcs") {
      if (p.categoryId === "desktops" && p.subcategorySlugs?.includes(sub)) {
        return true;
      }

      const name = p.name.toLowerCase();
      const belongsToDesktopDepartment =
        p.categoryId === "desktops" || p.categoryId === "computers";
      const hasAllInOneSignal =
        /\ball[\s-]?in[\s-]?one\b|\baio\b|\bproone\b|\bideacentre\b|\bneo\s*50a\b/.test(name);
      const isPrinter =
        /\bprinter\b|\bmfp\b|laserjet|officejet|deskjet|ecotank|smart\s*tank|pixma/.test(name);

      return belongsToDesktopDepartment && hasAllInOneSignal && !isPrinter;
    }

    const prodCatSlug = p.category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return p.subcategorySlugs?.includes(sub) || prodCatSlug === sub;
  });

  return (
    <>
      <Header />

      <main className="flex-1">
        <section className="px-4 py-6 lg:px-6 lg:py-8">
          <div>
            <div className="min-w-0">
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

              <FilteredProductGrid products={products} title={subCategory.name} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
