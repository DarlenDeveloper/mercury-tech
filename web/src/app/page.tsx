import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import Recommendations from "@/components/Recommendations";

export default function Home() {
  return (
    <>
      <Hero />
      <main className="flex-1">
        <CategorySection />
        <Recommendations />
      </main>
    </>
  );
}
