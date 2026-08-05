import Nav from "@/components/Nav";
import AuditTrailHero from "@/components/AuditTrailHero";
import TrustMetrics from "@/components/TrustMetrics";
import HowItWorks from "@/components/HowItWorks";
import ComparisonSection from "@/components/ComparisonSection";
import MethodologySection from "@/components/MethodologySection";
import LiveDemoPreview from "@/components/LiveDemoPreview";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCities, getPublishedRuleSetForCity } from "@/lib/supabase/queries";

async function getMethodologyCategories() {
  try {
    const supabase = createClient();
    const cities = await getCities(supabase, { activeOnly: true });
    if (!cities[0]) return [];
    const ruleSet = await getPublishedRuleSetForCity(supabase, cities[0].slug);
    return ruleSet.categories;
  } catch {
    return [];
  }
}

export default async function Home() {
  const categories = await getMethodologyCategories();

  return (
    <main>
      <Nav />
      <AuditTrailHero />
      <TrustMetrics />
      <HowItWorks />
      <ComparisonSection />
      <MethodologySection categories={categories} />
      <LiveDemoPreview />

      <footer className="border-t border-line dark:border-line-dark">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-navy-400">
          <span>© {new Date().getFullYear()} ValueTrace. Transparent property valuation.</span>
          <div className="flex gap-6">
            <Link href="/playground" className="link-underline hover:text-ink dark:hover:text-paper transition-colors">
              Playground
            </Link>
            <Link href="/admin" className="link-underline hover:text-ink dark:hover:text-paper transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
