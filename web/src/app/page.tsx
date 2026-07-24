import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryShowcase from "@/components/CategoryShowcase";
import BrandStrip from "@/components/BrandStrip";
import Sidebar from "@/components/Sidebar";
import HomeProductRows from "@/components/HomeProductRows";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { getProductsFromFirestore, getFlashSaleProducts } from "@/lib/getProducts";

// Cache the rendered page and revalidate every 5 minutes (ISR).
export const revalidate = 300;

export default async function Home() {
  const [products, flashSale] = await Promise.all([
    getProductsFromFirestore(),
    getFlashSaleProducts(),
  ]);

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Full-bleed hero sits directly under the nav. */}
        <section className="relative">
          <Hero />
        </section>

        {/* Category sidebar on the left; showcase + products on the right. */}
        <section className="px-4 py-8 lg:px-6">
          <div className="flex gap-8">
            <Sidebar />
            <div className="min-w-0 flex-1">
              <CategoryShowcase />
              <div className="mt-10">
                <BrandStrip />
              </div>
              <HomeProductRows
                products={products}
                flashSaleProducts={flashSale.products}
                flashSaleTitle={flashSale.title}
              />
            </div>
          </div>
        </section>

        {/* Newsletter / sales CTA. */}
        <Newsletter />
      </main>

      <Footer />
    </>
  );
}
