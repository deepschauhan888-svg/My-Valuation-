import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublishedRuleSetForCity, getCityBySlug, recordValuation } from "@/lib/supabase/queries";
import { calculateValuation } from "@/lib/valuation-engine";
import { PropertyInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  try {
    const body = await request.json();
    const { citySlug, subject, comparables } = body as {
      citySlug: string;
      subject: PropertyInput;
      comparables: PropertyInput[];
    };

    if (!citySlug || !subject || !Array.isArray(comparables)) {
      return NextResponse.json({ error: "citySlug, subject, and comparables are required." }, { status: 400 });
    }

    const ruleSet = await getPublishedRuleSetForCity(supabase, citySlug);
    if (ruleSet.categories.length === 0) {
      return NextResponse.json(
        { error: "No published rules found for this city yet. An admin needs to publish at least one rule set." },
        { status: 422 }
      );
    }

    const validComparables = comparables.filter((c) => c.salePrice && c.salePrice > 0);
    const result = calculateValuation(subject, validComparables, ruleSet);

    // Best-effort logging for analytics — never blocks the response.
    const city = await getCityBySlug(supabase, citySlug);
    recordValuation(supabase, city?.id ?? null, subject, result).catch((err) => console.error("valuation logging failed", err));

    return NextResponse.json({ result });
  } catch (err) {
    console.error("POST /api/valuate failed", err);
    return NextResponse.json({ error: "Valuation failed. Confirm Supabase is configured and seeded — see README." }, { status: 500 });
  }
}
