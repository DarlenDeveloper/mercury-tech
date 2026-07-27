import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HomeCatalog from "@/components/HomeCatalog";
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
        <section className="relative lg:-mt-[58px]">
          <Hero />
        </section>

        {/* Category showcase and product rows. Primary navigation stays in the header. */}
        <section className="px-4 py-8 lg:px-6">
          <HomeCatalog
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
