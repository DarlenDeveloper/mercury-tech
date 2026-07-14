import Link from "next/link";
import { Search as SearchIcon, ChevronRight } from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import SearchResults from "@/components/SearchResults";
import { getProductsFromFirestore } from "@/lib/getProducts";
import { searchProducts } from "@/lib/search";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  const allProducts = await getProductsFromFirestore();
  const results = query ? searchProducts(allProducts, query) : [];

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
                <span className="font-medium text-ink">Search</span>
              </nav>

              {query ? (
                <>
                  <h1 className="mb-1 text-2xl font-bold text-ink">
                    Search results for &ldquo;{query}&rdquo;
                  </h1>
                  <p className="mb-6 text-sm text-muted">
                    {results.length}{" "}
                    {results.length === 1 ? "product" : "products"} found
                  </p>

                  {results.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-center">
                      <SearchIcon size={40} className="text-muted/30" />
                      <p className="mt-4 text-lg font-semibold text-ink">
                        No products found
                      </p>
                      <p className="mt-1 max-w-sm text-sm text-muted">
                        We couldn&apos;t find anything matching &ldquo;{query}&rdquo;.
                        Try different keywords or browse our categories.
                      </p>
                      <Link
                        href="/"
                        className="mt-5 rounded-full bg-mercury px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-mercury-dark"
                      >
                        Back to Home
                      </Link>
                    </div>
                  ) : (
                    <SearchResults products={results} />
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center py-16 text-center">
                  <SearchIcon size={40} className="text-muted/30" />
                  <p className="mt-4 text-lg font-semibold text-ink">
                    Search our store
                  </p>
                  <p className="mt-1 max-w-sm text-sm text-muted">
                    Enter a product name, brand or category in the search bar above.
                  </p>
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
