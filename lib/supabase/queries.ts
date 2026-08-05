import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CategoryOption,
  FlatPayload,
  LiveCategory,
  LiveCityRuleSet,
  MatrixPayload,
  NumericPayload,
  RuleKind,
} from "@/lib/types";

export interface CityRow {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

function mapCity(row: any): CityRow {
  return { id: row.id, name: row.name, slug: row.slug, isActive: row.is_active, createdAt: row.created_at };
}

export async function getCities(supabase: SupabaseClient, opts: { activeOnly?: boolean } = {}): Promise<CityRow[]> {
  let query = supabase.from("cities").select("*").order("name");
  if (opts.activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapCity);
}

export async function getCityBySlug(supabase: SupabaseClient, slug: string): Promise<CityRow | null> {
  const { data, error } = await supabase.from("cities").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? mapCity(data) : null;
}

export async function createCity(supabase: SupabaseClient, name: string, slug: string, userId: string) {
  const { data, error } = await supabase.from("cities").insert({ name, slug }).select().single();
  if (error) throw error;
  await logChange(supabase, { action: "city_created", cityId: data.id, newValue: { name, slug }, userId });
  return mapCity(data);
}

export async function renameCity(supabase: SupabaseClient, id: string, name: string, userId: string) {
  const { data: before } = await supabase.from("cities").select("name").eq("id", id).single();
  const { error } = await supabase.from("cities").update({ name, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  await logChange(supabase, { action: "city_updated", cityId: id, previousValue: before, newValue: { name }, userId });
}

export async function setCityActive(supabase: SupabaseClient, id: string, isActive: boolean, userId: string) {
  const { error } = await supabase.from("cities").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  await logChange(supabase, { action: "city_updated", cityId: id, newValue: { is_active: isActive }, userId });
}

export async function deleteCity(supabase: SupabaseClient, id: string, userId: string) {
  const { error } = await supabase.from("cities").delete().eq("id", id);
  if (error) throw error;
  await logChange(supabase, { action: "city_deleted", cityId: id, userId });
}

// ---------------------------------------------------------------------------
// Rule categories
// ---------------------------------------------------------------------------

export interface CategoryRow {
  id: string;
  cityId: string;
  kind: RuleKind;
  key: string;
  label: string;
  description: string | null;
  comparisonRule: string | null;
  example: string | null;
  higherIsBetter: boolean | null;
  valueType: "count" | "boolean" | null;
  isActive: boolean;
  sortOrder: number;
}

function mapCategory(row: any): CategoryRow {
  return {
    id: row.id,
    cityId: row.city_id,
    kind: row.kind,
    key: row.key,
    label: row.label,
    description: row.description,
    comparisonRule: row.comparison_rule,
    example: row.example,
    higherIsBetter: row.higher_is_better,
    valueType: row.value_type,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

export async function getCategoriesForCity(supabase: SupabaseClient, cityId: string): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("rule_categories")
    .select("*")
    .eq("city_id", cityId)
    .order("kind")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function getCategoryOptions(supabase: SupabaseClient, categoryId: string): Promise<CategoryOption[]> {
  const { data, error } = await supabase
    .from("category_options")
    .select("*")
    .eq("category_id", categoryId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((o: any) => ({ value: o.value, label: o.label, rank: o.rank }));
}

export async function createCategory(
  supabase: SupabaseClient,
  input: {
    cityId: string;
    kind: RuleKind;
    key: string;
    label: string;
    description?: string;
    comparisonRule?: string;
    example?: string;
    higherIsBetter?: boolean;
    valueType?: "count" | "boolean";
    options?: { value: string; label: string; rank: number }[];
    defaultPayload: NumericPayload | FlatPayload | MatrixPayload;
  },
  userId: string
) {
  const { data: category, error } = await supabase
    .from("rule_categories")
    .insert({
      city_id: input.cityId,
      kind: input.kind,
      key: input.key,
      label: input.label,
      description: input.description ?? null,
      comparison_rule: input.comparisonRule ?? null,
      example: input.example ?? null,
      higher_is_better: input.higherIsBetter ?? null,
      value_type: input.valueType ?? null,
    })
    .select()
    .single();
  if (error) throw error;

  if (input.kind === "matrix" && input.options?.length) {
    const { error: optError } = await supabase.from("category_options").insert(
      input.options.map((o, i) => ({ category_id: category.id, value: o.value, label: o.label, rank: o.rank, sort_order: i }))
    );
    if (optError) throw optError;
  }

  await supabase.from("rule_drafts").insert({ category_id: category.id, payload: input.defaultPayload, updated_by: userId });

  await logChange(supabase, {
    action: "category_created",
    cityId: input.cityId,
    categoryId: category.id,
    newValue: { key: input.key, label: input.label, kind: input.kind },
    userId,
  });

  return mapCategory(category);
}

export async function setCategoryActive(supabase: SupabaseClient, categoryId: string, isActive: boolean) {
  const { error } = await supabase.from("rule_categories").update({ is_active: isActive }).eq("id", categoryId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Draft / publish workflow
// ---------------------------------------------------------------------------

export async function getDraft(supabase: SupabaseClient, categoryId: string) {
  const { data, error } = await supabase.from("rule_drafts").select("*").eq("category_id", categoryId).maybeSingle();
  if (error) throw error;
  return data ? { payload: data.payload, updatedAt: data.updated_at } : null;
}

export async function getLatestPublished(supabase: SupabaseClient, categoryId: string) {
  const { data, error } = await supabase
    .from("rule_published")
    .select("*")
    .eq("category_id", categoryId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data
    ? { payload: data.payload, optionsSnapshot: data.options_snapshot, version: data.version, publishedAt: data.published_at }
    : null;
}

export async function saveDraft(
  supabase: SupabaseClient,
  categoryId: string,
  cityId: string,
  payload: NumericPayload | FlatPayload | MatrixPayload,
  userId: string,
  reason: string
) {
  const previous = await getDraft(supabase, categoryId);

  const { error } = await supabase
    .from("rule_drafts")
    .upsert({ category_id: categoryId, payload, updated_by: userId, updated_at: new Date().toISOString() });
  if (error) throw error;

  await logChange(supabase, {
    action: "draft_saved",
    cityId,
    categoryId,
    previousValue: previous?.payload ?? null,
    newValue: payload,
    reason,
    userId,
  });
}

export async function saveCategoryOptions(
  supabase: SupabaseClient,
  categoryId: string,
  cityId: string,
  options: CategoryOption[],
  userId: string,
  reason: string
) {
  const { data: previous } = await supabase.from("category_options").select("*").eq("category_id", categoryId);

  await supabase.from("category_options").delete().eq("category_id", categoryId);
  const { error } = await supabase
    .from("category_options")
    .insert(options.map((o, i) => ({ category_id: categoryId, value: o.value, label: o.label, rank: o.rank, sort_order: i })));
  if (error) throw error;

  await logChange(supabase, {
    action: "draft_saved",
    cityId,
    categoryId,
    previousValue: previous,
    newValue: options,
    reason,
    userId,
  });
}

export async function publishCategory(supabase: SupabaseClient, categoryId: string, cityId: string, userId: string) {
  const draft = await getDraft(supabase, categoryId);
  if (!draft) throw new Error("No draft to publish for this category.");

  const latest = await getLatestPublished(supabase, categoryId);
  const nextVersion = (latest?.version ?? 0) + 1;

  const { data: category } = await supabase.from("rule_categories").select("kind").eq("id", categoryId).single();
  let optionsSnapshot = null;
  if (category?.kind === "matrix") {
    const options = await getCategoryOptions(supabase, categoryId);
    optionsSnapshot = options;
  }

  const { error } = await supabase.from("rule_published").insert({
    category_id: categoryId,
    payload: draft.payload,
    options_snapshot: optionsSnapshot,
    version: nextVersion,
    published_by: userId,
  });
  if (error) throw error;

  await logChange(supabase, {
    action: "published",
    cityId,
    categoryId,
    previousValue: latest?.payload ?? null,
    newValue: draft.payload,
    reason: `Published as v${nextVersion}`,
    userId,
  });

  return nextVersion;
}

// ---------------------------------------------------------------------------
// Assembling a full rule set (draft, for the admin preview; or published,
// for the public engine) — this is what lib/valuation-engine.ts consumes.
// ---------------------------------------------------------------------------

async function assembleRuleSet(
  supabase: SupabaseClient,
  citySlug: string,
  source: "draft" | "published"
): Promise<LiveCityRuleSet> {
  const city = await getCityBySlug(supabase, citySlug);
  if (!city) return { city: citySlug, cityName: citySlug, categories: [] };

  const categories = await getCategoriesForCity(supabase, city.id);
  const active = source === "published" ? categories.filter((c) => c.isActive) : categories;

  const live: LiveCategory[] = [];
  for (const cat of active) {
    let payload: NumericPayload | FlatPayload | MatrixPayload | null = null;
    let options: CategoryOption[] = [];
    let version = 1;
    let effectiveDate = "";
    let configuredBy = "";

    if (source === "draft") {
      const draft = await getDraft(supabase, cat.id);
      if (!draft) continue;
      payload = draft.payload;
      effectiveDate = draft.updatedAt;
      configuredBy = "Draft (unpublished)";
      if (cat.kind === "matrix") options = await getCategoryOptions(supabase, cat.id);
    } else {
      const published = await getLatestPublished(supabase, cat.id);
      if (!published) continue;
      payload = published.payload;
      version = published.version;
      effectiveDate = published.publishedAt;
      configuredBy = "Published";
      if (cat.kind === "matrix") options = published.optionsSnapshot ?? (await getCategoryOptions(supabase, cat.id));
    }

    live.push({
      id: cat.id,
      cityId: cat.cityId,
      cityName: city.name,
      kind: cat.kind,
      key: cat.key,
      label: cat.label,
      description: cat.description,
      comparisonRule: cat.comparisonRule,
      example: cat.example,
      higherIsBetter: cat.higherIsBetter,
      valueType: cat.valueType,
      isActive: cat.isActive,
      sortOrder: cat.sortOrder,
      options,
      payload: payload!,
      version,
      effectiveDate,
      configuredBy,
    });
  }

  return { city: city.slug, cityName: city.name, categories: live };
}

/** For the public valuation engine — published, active categories only. */
export async function getPublishedRuleSetForCity(supabase: SupabaseClient, citySlug: string): Promise<LiveCityRuleSet> {
  return assembleRuleSet(supabase, citySlug, "published");
}

/** For the admin Rule Engine preview — every category (active or not), draft values. */
export async function getDraftRuleSetForCity(supabase: SupabaseClient, citySlug: string): Promise<LiveCityRuleSet> {
  return assembleRuleSet(supabase, citySlug, "draft");
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

async function logChange(
  supabase: SupabaseClient,
  entry: {
    action: string;
    cityId?: string;
    categoryId?: string;
    previousValue?: unknown;
    newValue?: unknown;
    reason?: string;
    userId: string;
  }
) {
  await supabase.from("rule_change_log").insert({
    action: entry.action,
    city_id: entry.cityId ?? null,
    category_id: entry.categoryId ?? null,
    previous_value: entry.previousValue ?? null,
    new_value: entry.newValue ?? null,
    reason: entry.reason ?? null,
    user_id: entry.userId,
  });
}

export interface ChangeLogRow {
  id: string;
  action: string;
  cityName: string | null;
  categoryLabel: string | null;
  previousValue: unknown;
  newValue: unknown;
  reason: string | null;
  userName: string | null;
  createdAt: string;
}

export async function getChangeLog(supabase: SupabaseClient, opts: { cityId?: string; limit?: number } = {}): Promise<ChangeLogRow[]> {
  let query = supabase
    .from("rule_change_log")
    .select("*, cities(name), rule_categories(label), profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 100);
  if (opts.cityId) query = query.eq("city_id", opts.cityId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    action: row.action,
    cityName: row.cities?.name ?? null,
    categoryLabel: row.rule_categories?.label ?? null,
    previousValue: row.previous_value,
    newValue: row.new_value,
    reason: row.reason,
    userName: row.profiles?.full_name ?? null,
    createdAt: row.created_at,
  }));
}

// ---------------------------------------------------------------------------
// Dashboard stats + valuations log
// ---------------------------------------------------------------------------

export async function getDashboardStats(supabase: SupabaseClient) {
  const [{ count: cityCount }, { count: categoryCount }, { count: valuationCount }, recentChanges] = await Promise.all([
    supabase.from("cities").select("*", { count: "exact", head: true }),
    supabase.from("rule_categories").select("*", { count: "exact", head: true }),
    supabase.from("valuations").select("*", { count: "exact", head: true }),
    getChangeLog(supabase, { limit: 8 }),
  ]);

  return {
    cityCount: cityCount ?? 0,
    categoryCount: categoryCount ?? 0,
    valuationCount: valuationCount ?? 0,
    recentChanges,
  };
}

export async function recordValuation(supabase: SupabaseClient, cityId: string | null, subject: unknown, result: unknown) {
  await supabase.from("valuations").insert({ city_id: cityId, subject, result });
}
