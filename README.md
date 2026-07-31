# Ledger — Transparent Property Valuation Engine

A comparable-sales property valuation platform where every premium and
discount is shown with its reason, its math, and the rule that produced it.

## What's built (real, working code)

- **Marketing site** (`app/page.tsx`) — hero with a live animated "audit
  trail" (the product's signature visual), a 6-step how-it-works timeline,
  a traditional-vs-Ledger comparison, and a methodology section walking
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
- **Admin rule engine scaffold** (`app/admin/page.tsx`) — per-city rule
  sets, editable numeric/flat rules, and a sample analytics chart. This
  page runs on local React state today (see "Not yet wired" below).
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
