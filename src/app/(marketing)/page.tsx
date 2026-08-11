import { FeaturePreview } from "./_components/feature-preview";
import { Hero } from "./_components/hero";
import { MarketingHeader } from "./_components/marketing-header";

export default function MarketingHomePage() {
  return (
    <main className="min-h-screen bg-vt-background-deep text-vt-text">
      <MarketingHeader />
      <Hero />
      <FeaturePreview />
    </main>
  );
}
