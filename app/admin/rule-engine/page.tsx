import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCities, getCategoriesForCity } from "@/lib/supabase/queries";
import AddCategoryModal from "@/components/admin/AddCategoryModal";
import { ChevronRight } from "lucide-react";

const KIND_LABELS: Record<string, string> = { numeric: "Numeric Rules", flat: "Flat Rules", matrix: "Comparison Matrix" };

export default async function RuleEnginePage({ searchParams }: { searchParams: { city?: string } }) {
  const supabase = createClient();
  const cities = await getCities(supabase);
  const activeCity = cities.find((c) => c.slug === searchParams.city) ?? cities[0];

  const categories = activeCity ? await getCategoriesForCity(supabase, activeCity.id) : [];
  const grouped = { numeric: categories.filter((c) => c.kind === "numeric"), flat: categories.filter((c) => c.kind === "flat"), matrix: categories.filter((c) => c.kind === "matrix") };

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <div className="mb-10 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow mb-3">Rule Engine</div>
          <h1 className="font-display font-bold text-3xl tracking-tight">
            {activeCity ? activeCity.name : "No cities yet"}
          </h1>
        </div>
        {cities.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {cities.map((c) => (
              <Link
                key={c.slug}
                href={`/admin/rule-engine?city=${c.slug}`}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors tap-feedback ${
                  activeCity?.slug === c.slug
                    ? "bg-gold text-white"
                    : "border border-line dark:border-line-dark text-navy-400 hover:border-gold hover:text-gold"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {!activeCity ? (
        <p className="text-sm text-navy-400">Add a city from City Management first.</p>
      ) : (
        <div className="space-y-10">
          {(["numeric", "flat", "matrix"] as const).map((kind) => (
            <div key={kind}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold">{KIND_LABELS[kind]}</h2>
                <AddCategoryModal cityId={activeCity.id} kind={kind} label={KIND_LABELS[kind].split(" ")[0]} />
              </div>
              {grouped[kind].length === 0 ? (
                <p className="text-sm text-navy-400">No {KIND_LABELS[kind].toLowerCase()} configured yet.</p>
              ) : (
                <div className="card-surface divide-y divide-line dark:divide-line-dark overflow-hidden">
                  {grouped[kind].map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/admin/rule-engine/${cat.id}?city=${activeCity.slug}`}
                      className="flex items-center justify-between p-4 hover:bg-navy-50 dark:hover:bg-white/5 transition-colors tap-feedback"
                    >
                      <div>
                        <span className="font-medium text-sm">{cat.label}</span>
                        {!cat.isActive && <span className="ml-2 text-xs text-navy-400">(inactive)</span>}
                        <div className="text-xs text-navy-400 font-mono">{cat.key}</div>
                      </div>
                      <ChevronRight size={16} strokeWidth={1.5} className="text-navy-400" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
