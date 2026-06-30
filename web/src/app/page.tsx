import Header from "@/components/Header";
import AnnouncementBar from "@/components/AnnouncementBar";
import Sidebar from "@/components/Sidebar";
import PromoHero from "@/components/PromoHero";
import PopularCategories from "@/components/PopularCategories";
import Recommendations from "@/components/Recommendations";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
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
              <PromoHero />
              <PopularCategories />
              <Recommendations />
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
