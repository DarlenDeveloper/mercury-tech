import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HomeProductRows from "@/components/HomeProductRows";
import EnterpriseSolutions from "@/components/EnterpriseSolutions";
import ProductDepartmentNav from "@/components/ProductDepartmentNav";
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
        {/* Full-bleed hero. On desktop it slides up behind the translucent
            department bar so the image shows through the blue. */}
        <section className="relative z-10 overflow-hidden shadow-[0_18px_30px_-20px_rgba(15,35,85,0.42)]">
          <Hero />
        </section>

        <ProductDepartmentNav />

        <section className="px-4 py-8 lg:px-6">
          <EnterpriseSolutions />
        </section>

        {/* Product rows. Primary navigation stays in the header. */}
        <section className="px-4 py-8 lg:px-6">
          <HomeProductRows
            products={products}
            flashSaleProducts={flashSale.products}
            flashSaleTitle={flashSale.title}
          />
        </section>

        {/* Newsletter / sales CTA. */}
        <Newsletter />
      </main>

      <Footer />
    </>
  );
}
