"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import * as queries from "@/lib/supabase/queries";
import { RuleKind } from "@/lib/types";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") throw new Error("Not authorized.");
  return { supabase, userId: user.id };
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------------
// Cities
// ---------------------------------------------------------------------------

export async function createCityAction(formData: FormData) {
  const { supabase, userId } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await queries.createCity(supabase, name, slugify(name), userId);
  revalidatePath("/admin/cities");
}

export async function renameCityAction(cityId: string, name: string) {
  const { supabase, userId } = await requireAdmin();
  await queries.renameCity(supabase, cityId, name, userId);
  revalidatePath("/admin/cities");
}

export async function toggleCityActiveAction(cityId: string, isActive: boolean) {
  const { supabase, userId } = await requireAdmin();
  await queries.setCityActive(supabase, cityId, isActive, userId);
  revalidatePath("/admin/cities");
}

export async function deleteCityAction(cityId: string) {
  const { supabase, userId } = await requireAdmin();
  await queries.deleteCity(supabase, cityId, userId);
  revalidatePath("/admin/cities");
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function createCategoryAction(input: {
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
}) {
  const { supabase, userId } = await requireAdmin();

  const defaultPayload =
    input.kind === "numeric"
      ? { percentPerUnit: 1, capPercent: 5, enabled: true }
      : input.kind === "flat"
        ? { percent: 1, enabled: true }
        : { percentPerRankStep: 1, capPercent: 5, enabled: true };

  await queries.createCategory(supabase, { ...input, defaultPayload }, userId);
  revalidatePath("/admin/rule-engine");
}

export async function setCategoryActiveAction(categoryId: string, isActive: boolean) {
  const { supabase } = await requireAdmin();
  await queries.setCategoryActive(supabase, categoryId, isActive);
  revalidatePath("/admin/rule-engine");
}

// ---------------------------------------------------------------------------
// Draft / publish
// ---------------------------------------------------------------------------

export async function saveDraftAction(categoryId: string, cityId: string, payload: object, reason: string) {
  const { supabase, userId } = await requireAdmin();
  await queries.saveDraft(supabase, categoryId, cityId, payload as any, userId, reason || "No reason given");
  revalidatePath(`/admin/rule-engine/${categoryId}`);
}

export async function saveMatrixOptionsAction(
  categoryId: string,
  cityId: string,
  options: { value: string; label: string; rank: number }[],
  reason: string
) {
  const { supabase, userId } = await requireAdmin();
  await queries.saveCategoryOptions(supabase, categoryId, cityId, options, userId, reason || "No reason given");
  revalidatePath(`/admin/rule-engine/${categoryId}`);
}

export async function publishCategoryAction(categoryId: string, cityId: string) {
  const { supabase, userId } = await requireAdmin();
  const version = await queries.publishCategory(supabase, categoryId, cityId, userId);
  revalidatePath(`/admin/rule-engine/${categoryId}`);
  revalidatePath("/admin/versions");
  return version;
}
