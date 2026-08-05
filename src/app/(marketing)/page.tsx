import { FeaturePreview } from "./_components/feature-preview";
import { Hero } from "./_components/hero";
import { MarketingHeader } from "./_components/marketing-header";

export default function MarketingHomePage() {
  return (
    <main className="min-h-screen bg-[#07110f] text-[#f8e8c0]">
      <MarketingHeader />
      <Hero />
      <FeaturePreview />
    </main>
  );
}
