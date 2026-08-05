import { createClient } from "@/lib/supabase/server";
import { getDashboardStats } from "@/lib/supabase/queries";
import { Building2, SlidersHorizontal, Calculator } from "lucide-react";

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="card-surface p-6">
      <Icon size={18} strokeWidth={1.5} className="text-gold mb-4" />
      <div className="font-display font-bold text-3xl ledger-figure">{value}</div>
      <div className="text-sm text-navy-400 mt-1">{label}</div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const supabase = createClient();
  let stats;
  let loadError: string | null = null;
  try {
    stats = await getDashboardStats(supabase);
  } catch (err: any) {
    loadError = err.message ?? "Could not load dashboard stats.";
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <div className="mb-10">
        <div className="eyebrow mb-3">Dashboard</div>
        <h1 className="font-display font-bold text-3xl tracking-tight">Overview</h1>
      </div>

      {loadError ? (
        <div className="card-surface p-6 text-sm text-discount">{loadError}</div>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            <StatCard icon={Building2} label="Cities configured" value={stats!.cityCount} />
            <StatCard icon={SlidersHorizontal} label="Rule categories" value={stats!.categoryCount} />
            <StatCard icon={Calculator} label="Valuations run" value={stats!.valuationCount} />
          </div>

          <div className="card-surface p-6">
            <h2 className="font-display font-semibold mb-4">Recent activity</h2>
            {stats!.recentChanges.length === 0 ? (
              <p className="text-sm text-navy-400">No changes logged yet.</p>
            ) : (
              <ul className="space-y-3">
                {stats!.recentChanges.map((c) => (
                  <li key={c.id} className="flex items-start justify-between text-sm border-b border-line dark:border-line-dark pb-3 last:border-0">
                    <div>
                      <span className="font-medium capitalize">{c.action.replace("_", " ")}</span>
                      {c.categoryLabel && <span className="text-navy-400"> · {c.categoryLabel}</span>}
                      {c.cityName && <span className="text-navy-400"> · {c.cityName}</span>}
                    </div>
                    <span className="text-xs text-navy-400">{new Date(c.createdAt).toLocaleString("en-IN")}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
