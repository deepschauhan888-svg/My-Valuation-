import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDraft, getLatestPublished, getCategoryOptions } from "@/lib/supabase/queries";
import CategoryEditor from "@/components/admin/CategoryEditor";
import { ArrowLeft } from "lucide-react";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { categoryId: string };
  searchParams: { city?: string };
}) {
  const supabase = createClient();

  const { data: category, error } = await supabase.from("rule_categories").select("*").eq("id", params.categoryId).maybeSingle();
  if (error || !category) notFound();

  const draft = await getDraft(supabase, category.id);
  const published = await getLatestPublished(supabase, category.id);
  const options = category.kind === "matrix" ? await getCategoryOptions(supabase, category.id) : [];

  const fallbackPayload =
    category.kind === "numeric"
      ? { percentPerUnit: 1, capPercent: 5, enabled: true }
      : category.kind === "flat"
        ? { percent: 1, enabled: true }
        : { percentPerRankStep: 1, capPercent: 5, enabled: true };

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <Link
        href={`/admin/rule-engine${searchParams.city ? `?city=${searchParams.city}` : ""}`}
        className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-ink dark:hover:text-paper transition-colors mb-6 tap-feedback"
      >
        <ArrowLeft size={14} strokeWidth={1.5} /> Back to Rule Engine
      </Link>

      <div className="mb-8">
        <div className="eyebrow mb-3 capitalize">{category.kind} Rule</div>
        <h1 className="font-display font-bold text-3xl tracking-tight">{category.label}</h1>
        <p className="text-navy-400 mt-2 font-mono text-sm">{category.key}</p>
      </div>

      <CategoryEditor
        category={{ id: category.id, cityId: category.city_id, kind: category.kind, label: category.label, key: category.key, valueType: category.value_type }}
        draftPayload={draft?.payload ?? fallbackPayload}
        publishedInfo={published ? { version: published.version, publishedAt: published.publishedAt } : null}
        initialOptions={options}
      />
    </div>
  );
}
