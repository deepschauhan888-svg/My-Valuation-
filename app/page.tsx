import Nav from "@/components/Nav";
import AuditTrailHero from "@/components/AuditTrailHero";
import HowItWorks from "@/components/HowItWorks";
import ComparisonSection from "@/components/ComparisonSection";
import MethodologySection from "@/components/MethodologySection";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main>
      <Nav />
      <AuditTrailHero />
      <HowItWorks />
      <ComparisonSection />
      <MethodologySection />

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="card-surface p-12 text-center bg-gradient-to-b from-navy-50/60 dark:from-white/[0.03] to-transparent">
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4">
            See exactly what your property is worth.
          </h2>
          <p className="text-navy-400 max-w-lg mx-auto mb-8">
            Bring your property and a few comparables. Ledger shows you every premium, every discount,
            and every rupee behind the final number.
          </p>
          <Link
            href="/valuation"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink font-semibold hover:opacity-90 transition-opacity"
          >
            Start Valuation <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-line dark:border-line-dark">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-navy-400">
          <span>© {new Date().getFullYear()} Ledger. Transparent property valuation.</span>
          <div className="flex gap-6">
            <Link href="/admin" className="hover:text-ink dark:hover:text-paper transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
