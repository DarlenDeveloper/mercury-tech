import Header from "@/components/Header";
import AnnouncementBar from "@/components/AnnouncementBar";
import Hero from "@/components/Hero";
import Sidebar from "@/components/Sidebar";
import PopularCategories from "@/components/PopularCategories";
import Recommendations from "@/components/Recommendations";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { getProductsFromFirestore } from "@/lib/getProducts";

// Cache the rendered page and revalidate every 5 minutes (ISR).
export const revalidate = 300;

export default async function Home() {
  const products = await getProductsFromFirestore();

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="flex-1">
        {/* Homepage: promos, popular categories and recommendations. */}
        <section className="px-4 py-6 lg:px-6 lg:py-8">
          <div className="flex gap-8">
            <Sidebar />
            <div className="min-w-0 flex-1">
              <Hero />
              <PopularCategories />
              <Recommendations products={products} />
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
