# ValueTrace — Transparent Property Valuation Engine

A comparable-sales property valuation platform where every premium and
discount is shown with its reason, its math, and the rule that produced it.

## What's built (real, working code)

- **Marketing site** (`app/page.tsx`) — hero with a live animated "audit
  trail" (the product's signature visual), a 6-step how-it-works timeline,
  a traditional-vs-ValueTrace comparison, and a methodology section walking
  through the Comparable Sales flow and the 14 comparison factors.
- **Valuation flow** (`app/valuation/page.tsx`) — enter a subject property,
  add any number of comparables, and run the engine. Results show the
  final value, range, confidence/reliability scores, and a fully
  expandable, comparable-by-comparable adjustment breakdown.
- **Valuation engine** (`lib/valuation-engine.ts`) — the actual math:
  - Size (super built-up / carpet area) is *never* adjusted directly — it
    only feeds PSF and load-factor calculations, per spec.
  - Every other factor (load factor, age, unit type, construction status,
    condition, furnishing, floor, facing, parking, balcony, legal issues,
    unique features) produces a signed adjustment with a human-readable
    reason.
  - Adjustment direction follows the stated philosophy exactly: if the
    subject is superior on a factor, the comparable gets a **negative**
    adjustment; if the comparable is superior, it gets a **positive** one.
  - `Adjusted PSF = Comparable PSF − (Comparable PSF × Total Adjustment)`
- **Admin rule engine** (`app/admin/page.tsx`) — City → Category →
  Comparison Matrix structure: numeric rules, a pairwise comparison matrix
  for every categorical factor (Facing, Condition, Furnishing, Unit Type,
  Construction Status), flat rules, a version-history log with a "publish
  new version" action, and a sample analytics chart. Runs on local React
  state today (see "Not yet wired" below).
- **Trust metrics** (`components/TrustMetrics.tsx`) — animated counters
  (100% transparent, 14 factors, 0 hidden adjustments, 100% explainable)
  right below the hero.
- **Live demo preview** (`components/LiveDemoPreview.tsx`) — a miniature,
  self-running valuation shown before the "Start Valuation" CTA so users
  understand the workflow before entering a single number.
- **Clickable methodology** (`components/MethodologySection.tsx` +
  `components/FactorDetailModal.tsx`) — every one of the 14 factor chips
  opens a modal with its definition, comparison rule, adjustment logic,
  and a worked example (`lib/factor-details.ts`).
- **Full adjustment audit trail** — every adjustment line now carries a
  rule name, the exact calculation, city, rule version, effective date,
  and who configured it (`AdjustmentLine` in `lib/types.ts`), all shown
  when an adjustment row is expanded.
- **Comparable Quality Score** (`lib/quality-score.ts`) — a star rating
  and percentage per comparable, built from concrete, visible checks
  (same society, same city, similar configuration/age/area, no legal
  flags, similar furnishing) — not a hidden model.
- **Ask about this valuation** (`components/AskAiPanel.tsx`) — a
  deterministic, rule-based explainer that answers questions about any
  factor using that valuation's own adjustment data. It does not call an
  external LLM; see "Not yet wired" for how to upgrade it to one.
- **Valuation Playground** (`app/playground/page.tsx`) — sliders for
  parking, floor, age, and facing that recompute the adjusted PSF live
  against a fixed baseline subject, using the same engine as the main flow.
- **Downloadable valuation report** (`components/ValuationReport.tsx`) —
  a print-optimized, multi-section report (cover, executive summary,
  subject, comparables & adjustment sheet, final valuation, methodology,
  assumptions, limitations) exportable to PDF via the browser's print
  dialog — no PDF library dependency required.
- Dark/light mode with no flash-of-wrong-theme (a tiny inline script sets
  the class before paint), fully responsive, keyboard-focusable controls,
  and `prefers-reduced-motion` respected.

## Design system

- Colors: warm paper/near-black bases, muted **gold** for final values,
  **premium green** for positive adjustments, **discount red** for
  negative ones — adjustments read like a real ledger, not a generic SaaS
  gradient.
- Type: Sora (display), Inter (body), JetBrains Mono (every number —
  PSF, percentages, scores — so figures read as precise and auditable).
- Signature element: the animated audit-trail ledger in the hero and the
  expandable adjustment rows throughout — the product's whole pitch is
  "show your work," so the UI is built around that verbatim.

## Getting it running

```bash
npm install
npm run dev
```

Requires outbound access to Google Fonts at build time (works out of the
box on Vercel). If you build somewhere without internet access, swap the
`next/font/google` imports in `app/layout.tsx` for local fonts or system
stacks.

## Deploying

1. Push this repo to GitHub.
2. Import it in Vercel — no special build settings needed, it's a
   standard Next.js 14 App Router project.
3. Add environment variables for Supabase once you wire it in (below).

## Not yet wired — what a next pass should add

This is a strong, working front end and a real (not mocked) calculation
engine. The parts that need a backend are intentionally scaffolded
rather than faked, so nothing here pretends to be production-secure when
it isn't:

- **Supabase auth for `/admin`** — the admin route has no login gate
  yet. Add `@supabase/ssr`, a `middleware.ts` that checks session on
  `/admin/*`, and a `profiles` table with a `role` column.
- **Persisting rule sets** — `lib/rules-data.ts` is an in-memory seed.
  Move `CityRuleSet` rows into a Supabase table (one row per city +
  version, matching the shape in `lib/types.ts`) and replace
  `getRuleSetForCity` with a query. Keep the version/effective-date
  columns — the UI already displays them for auditability.
  Rules take exactly this shape:

  ```sql
  create table city_rule_sets (
    id uuid primary key default gen_random_uuid(),
    city text not null,
    version int not null,
    effective_date date not null,
    notes text,
    rules jsonb not null, -- the NumericRule/CategoricalRule/FlatRule blocks
    created_at timestamptz default now()
  );
  ```

- **Persisting valuations + analytics** — every completed valuation
  (`ValuationResult`) should be written to a `valuations` table so the
  admin analytics panel (today's valuations, top cities, most-compared
  societies, CSV export) can query real data instead of the sample
  chart currently in `app/admin/page.tsx`.
- **Comparable lookup** — right now users type comparables in by hand.
  A real MVP win is autocompleting `society` against a societies table
  so PSF history can be pre-filled.
- **A real LLM behind "Ask about this valuation"** — today's
  `AskAiPanel` is deliberately rule-based (matches the question to a
  factor and returns that factor's own reason/calculation) so it works
  with zero configuration and never invents an explanation. To upgrade
  it: add a server route that calls the Anthropic API with the
  valuation's adjustment lines as context and the user's question as the
  prompt, and swap `answerFor()` for a fetch to that route. Keep an
  API key server-side only — never in client code.

## File map

```
app/
  page.tsx            landing page
  valuation/page.tsx   the calculator flow
  admin/page.tsx       rule engine + analytics scaffold
components/            all UI pieces, one responsibility each
lib/
  types.ts             domain types — start here to understand the model
  valuation-engine.ts  the adjustment math + reasons
  rules-data.ts        seed per-city rule sets (→ move to Supabase)
  format.ts            ₹ crore/lakh formatting
```
