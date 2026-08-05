import { createClient } from "@/lib/supabase/server";
import { getCities } from "@/lib/supabase/queries";

export default async function AnalyticsPage() {
  const supabase = createClient();
  const cities = await getCities(supabase);

  const counts = await Promise.all(
    cities.map(async (city) => {
      const { count } = await supabase.from("valuations").select("*", { count: "exact", head: true }).eq("city_id", city.id);
      return { city: city.name, count: count ?? 0 };
    })
  );

  const total = counts.reduce((sum, c) => sum + c.count, 0);
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <div className="mb-10">
        <div className="eyebrow mb-3">Analytics</div>
        <h1 className="font-display font-bold text-3xl tracking-tight">Valuations by city</h1>
        <p className="text-navy-400 mt-2 measure">
          Pulled live from the <code className="font-mono text-xs">valuations</code> table — every completed
          public valuation is logged there automatically.
        </p>
      </div>

      <div className="card-surface p-6 mb-6">
        <div className="text-xs text-navy-400 mb-1">Total valuations run</div>
        <div className="font-display font-bold text-4xl ledger-figure">{total}</div>
      </div>

      <div className="card-surface p-6">
        <h2 className="font-display font-semibold mb-5 text-sm">By city</h2>
        {counts.length === 0 ? (
          <p className="text-sm text-navy-400">No cities configured yet.</p>
        ) : (
          <div className="space-y-4">
            {counts.map((c) => (
              <div key={c.city}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span>{c.city}</span>
                  <span className="ledger-figure font-semibold">{c.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-line dark:bg-line-dark overflow-hidden">
                  <div className="h-full bg-gold rounded-full" style={{ width: `${(c.count / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
