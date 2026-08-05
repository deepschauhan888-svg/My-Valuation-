# ValueTrace — Transparent Property Valuation Engine

A comparable-sales property valuation platform where every premium and
discount is shown with its reason, its math, and the rule that produced it —
and where every one of those rules is configured live in Supabase by an
authenticated admin, not hardcoded in the app.

**This is a real backend now, not a demo.** Nothing will work — not the
public valuation tool, not the admin dashboard — until you connect a
Supabase project and run the migration + seed below. That's expected; there
was no way to provision or seed a live database from inside this build
environment, so this README is the last step.

## 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the **Project URL** and **anon
   public** key.
3. Copy `.env.example` to `.env.local` and paste them in:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

## 2. Run the schema and seed data

In the Supabase dashboard's **SQL Editor**, run these two files in order:

1. `supabase/migrations/0001_init.sql` — creates every table (cities, rule
   categories, category options, drafts, published snapshots, the audit
   log, valuations, profiles) and every Row Level Security policy.
2. `supabase/seed.sql` — creates the five cities (Mumbai, Bengaluru, Delhi
   NCR, Pune, Hyderabad) and their default rule categories, each with an
   initial published v1, so the site has live rules immediately.

## 3. Create your first admin

There's no public sign-up page — that's intentional; only people you
create in Supabase can reach `/admin`. In the dashboard's
**Authentication → Users**, click **Add user**, set an email + password.
A database trigger (`handle_new_user`, in the migration) automatically
creates a matching `profiles` row with `role = 'admin'`.

> **Before you open this up to a public sign-up flow**, tighten
> `handle_new_user()` — right now it grants `admin` to every new auth user,
> which is fine when only you create accounts from the dashboard, but wrong
> the moment signup is self-serve. See "Security notes" below.

Sign in at `/login` with that email + password.

## 4. Run it

```bash
npm install
npm run dev
```

Requires outbound access to Google Fonts at build time (works out of the
box on Vercel; add the same two env vars there under **Project Settings →
Environment Variables**).

## Architecture

### Nothing is hardcoded

Every adjustment factor — Load Factor, Age, Floor, Parking, Balcony, Legal
Issues, Unit Type, Construction Status, Condition, Furnishing, Facing, and
anything an admin adds later — is a row in `rule_categories`, not a field
in a TypeScript type. `lib/valuation-engine.ts` doesn't know the names of
any of these; it loops over whatever active categories a city has and
applies numeric, flat, or matrix logic generically based on `kind`. Two
things stay structural, per the product's own methodology, not because
they were simplified: Load Factor is derived from area/carpet area, and
the Floor adjustment's ratio is derived from floor number/total floors —
area itself is never adjusted directly, on the site or in the database.

Adding a genuinely new comparison factor — "Distance to Metro," "View
Quality," anything — requires zero code changes: create it from
**Admin → Rule Engine → + Add Category**, and it appears in the public
valuation form, the methodology page, and the calculation itself
automatically, because all three read the same live `rule_categories`
table.

### Draft → Publish, for real

Editing a rule in `/admin/rule-engine` writes to `rule_drafts` only. The
public site — the valuation tool, the methodology page — reads exclusively
from `rule_published`, the append-only table of version snapshots. Nothing
an admin edits affects a live valuation until they click **Publish**, which
copies the current draft into a new `rule_published` row stamped with the
next version number. This is enforced by Row Level Security, not just the
UI: `rule_drafts` has no public SELECT policy at all — a public user
literally cannot query draft rules, even by guessing an API shape.

### Every save is audited

`rule_change_log` gets a row for every draft save, every publish, every
city created/renamed/deleted, and every category created — with the
previous value, the new value, who made the change, and the reason they
typed in. `/admin/versions` reads this table directly.

### Authentication

- `middleware.ts` refreshes the Supabase session on every request and
  redirects unauthenticated visitors away from `/admin/*` to `/login`.
- `app/admin/layout.tsx` then does a second, stronger check: it looks up
  the signed-in user's `profiles.role` and shows an "access restricted"
  screen if they're authenticated but not an admin. This matters because
  middleware only proves *someone* is logged in, not that they're
  authorized.
- Underneath both of those, RLS is the actual security boundary — the
  `is_admin()` Postgres function gates every write policy, so even a
  request that somehow bypassed the Next.js layers would still be
  rejected by Postgres itself.

### Public API surface

The public site never runs the valuation engine against untrusted,
client-suppliable rules — it calls two server-side endpoints:

- `GET /api/categories?city=<slug>` — the published, active rule
  categories for a city (also used with no `city` param to list active
  cities). Powers the dynamic valuation form and the homepage methodology
  section.
- `POST /api/valuate` — takes a subject + comparables + city, fetches that
  city's published rules server-side, runs `calculateValuation`, logs the
  result to `valuations` for analytics, and returns it. This is the only
  place `calculateValuation` runs for a request that matters.

The Playground fetches the published rule set once on load and holds it
in memory for instant slider response — still 100% database-sourced, just
cached client-side rather than re-fetched per pixel of drag.

## Security notes — read before going to production

- **`handle_new_user()` grants `admin` to every new signup.** Fine for a
  single-operator setup where you create accounts by hand in the Supabase
  dashboard. Before adding any self-serve signup flow, change the
  trigger's default role (or remove the trigger and provision `profiles`
  rows by hand/via an invite flow instead).
- **The "Users" page is a placeholder**, per your spec's own "(future)"
  label — there's no invite flow or per-city permission model yet. Every
  admin today can edit every city.
- **RLS is the real boundary, not the UI.** If you add new tables or
  columns, give them explicit policies — Supabase defaults to blocking all
  access until you do, so a forgotten policy fails safe, but it's worth
  double-checking after any schema change.

## What's still a deliberate placeholder

- **Users (future)** — exactly as specced, a "coming soon" page. No
  multi-admin invite flow, roles are binary (admin/analyst) and only
  settable directly in the `profiles` table today.
- **Analytics** is real (it queries the `valuations` table live) but
  simple — a per-city count. No time-series, no most-compared-society
  breakdown yet; the table has everything needed to build those next.

## File map (additions this pass)

```
supabase/
  migrations/0001_init.sql   full schema + RLS
  seed.sql                    default cities + categories + v1 published rules
middleware.ts                  session refresh + /admin route protection
lib/supabase/
  client.ts                    browser Supabase client
  server.ts                    server Supabase client (Server Components/Actions/Routes)
  queries.ts                   every data-access function — start here
  actions.ts                   "use server" mutations called from admin UI
lib/valuation-engine.ts         now generic — loops over LiveCategory[], no named factors
lib/types.ts                    PropertyInput.attributes replaces named fields
app/login/page.tsx              admin sign-in
app/admin/
  layout.tsx                    auth + role gate, renders the sidebar
  page.tsx                      dashboard overview
  cities/                       city CRUD
  rule-engine/                  category list, add-category, per-category editor
  versions/                     audit log viewer
  analytics/                    live valuation counts by city
  users/, settings/             placeholder + account info
app/api/
  categories/route.ts           public: published categories for a city
  valuate/route.ts               public: run a valuation server-side
```

---

## Design system (from earlier passes — unchanged this round)

Colors: warm brass gold (`#9C7A45`), muted premium green / discount red,
near-invisible card shadows so surfaces read as paper. Type: Sora
(display), Inter (body), JetBrains Mono (every number). A custom cursor,
ambient background grain, and cursor-following card spotlights run
site-wide; every button has tiny press feedback; numbers tween instead of
snapping. The hero's live valuation unfolds over ~6–8 seconds with a beat
of anticipation before the first line. None of this changed in this pass
— this round was architecture only, exactly as asked.
