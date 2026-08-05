import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCities, getChangeLog } from "@/lib/supabase/queries";

const ACTION_LABEL: Record<string, string> = {
  draft_saved: "Draft saved",
  published: "Published",
  category_created: "Category created",
  city_created: "City created",
  city_updated: "City updated",
  city_deleted: "City deleted",
};

export default async function VersionsPage({ searchParams }: { searchParams: { city?: string } }) {
  const supabase = createClient();
  const cities = await getCities(supabase);
  const activeCity = cities.find((c) => c.slug === searchParams.city);
  const changes = await getChangeLog(supabase, { cityId: activeCity?.id });

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <div className="mb-10 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow mb-3">Version History</div>
          <h1 className="font-display font-bold text-3xl tracking-tight">Every change, attributed and reversible-in-spirit</h1>
        </div>
        <div className="flex gap-1 flex-wrap">
          <Link
            href="/admin/versions"
            className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors tap-feedback ${
              !activeCity ? "bg-gold text-white" : "border border-line dark:border-line-dark text-navy-400 hover:border-gold hover:text-gold"
            }`}
          >
            All cities
          </Link>
          {cities.map((c) => (
            <Link
              key={c.slug}
              href={`/admin/versions?city=${c.slug}`}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors tap-feedback ${
                activeCity?.slug === c.slug ? "bg-gold text-white" : "border border-line dark:border-line-dark text-navy-400 hover:border-gold hover:text-gold"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {changes.length === 0 ? (
        <p className="text-sm text-navy-400">No changes logged yet.</p>
      ) : (
        <div className="card-surface divide-y divide-line dark:divide-line-dark overflow-hidden">
          {changes.map((c) => (
            <div key={c.id} className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{ACTION_LABEL[c.action] ?? c.action}</span>
                <span className="text-xs text-navy-400">{new Date(c.createdAt).toLocaleString("en-IN")}</span>
              </div>
              <div className="text-xs text-navy-400 mb-2">
                {c.cityName && <span>{c.cityName}</span>}
                {c.categoryLabel && <span> · {c.categoryLabel}</span>}
                {c.userName && <span> · by {c.userName}</span>}
              </div>
              {c.reason && <p className="text-sm mb-2 italic">&ldquo;{c.reason}&rdquo;</p>}
              {Boolean(c.previousValue || c.newValue) && (
                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                  {Boolean(c.previousValue) && (
                    <div className="rounded-lg bg-navy-50 dark:bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-navy-400 mb-1">Previous</div>
                      <pre className="text-[11px] font-mono whitespace-pre-wrap break-all">{JSON.stringify(c.previousValue, null, 2)}</pre>
                    </div>
                  )}
                  {Boolean(c.newValue) && (
                    <div className="rounded-lg bg-navy-50 dark:bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-navy-400 mb-1">New</div>
                      <pre className="text-[11px] font-mono whitespace-pre-wrap break-all">{JSON.stringify(c.newValue, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
