import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublishedRuleSetForCity, getCities } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  const citySlug = request.nextUrl.searchParams.get("city");
  const supabase = createClient();

  try {
    if (!citySlug) {
      const cities = await getCities(supabase, { activeOnly: true });
      return NextResponse.json({ cities });
    }

    const ruleSet = await getPublishedRuleSetForCity(supabase, citySlug);
    return NextResponse.json({ ruleSet });
  } catch (err) {
    console.error("GET /api/categories failed", err);
    return NextResponse.json(
      { error: "Could not load categories. Confirm Supabase is configured and seeded — see README." },
      { status: 500 }
    );
  }
}
