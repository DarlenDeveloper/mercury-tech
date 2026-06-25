import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import Recommendations from "@/components/Recommendations";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <main className="flex-1">
        <CategorySection />
        <Recommendations />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
