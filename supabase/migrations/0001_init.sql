-- ============================================================================
-- ValueTrace — Rule Engine schema
-- Run this against a fresh Supabase project (SQL Editor, or `supabase db push`).
-- Everything the app used to hardcode now lives in these tables.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles — one row per auth user, carries the role that gates /admin.
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'analyst')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user is created.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'admin');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Helper used throughout RLS policies below.
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ----------------------------------------------------------------------------
-- cities
-- ----------------------------------------------------------------------------
create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- rule_categories — every adjustable factor, per city. kind drives which
-- table holds its configuration. Admin can insert new rows here (via the
-- "+ Add Category" flows) with no code change required.
-- ----------------------------------------------------------------------------
create table if not exists rule_categories (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities (id) on delete cascade,
  kind text not null check (kind in ('numeric', 'flat', 'matrix')),
  key text not null,                    -- stable machine key, e.g. "loadFactor", "facing"
  label text not null,                  -- display name, e.g. "Load Factor"
  description text,                     -- methodology "Definition"
  comparison_rule text,                 -- methodology "Comparison rule"
  example text,                         -- methodology "Example"
  higher_is_better boolean default true, -- numeric only: does a bigger raw value favor the comparable?
  value_type text check (value_type in ('count', 'boolean')), -- flat only
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (city_id, key)
);

-- ----------------------------------------------------------------------------
-- category_options — the rankable values for a matrix category
-- (e.g. facing: north/east/south/... each with a rank).
-- ----------------------------------------------------------------------------
create table if not exists category_options (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references rule_categories (id) on delete cascade,
  value text not null,
  label text not null,
  rank int not null default 0,
  sort_order int not null default 0,
  unique (category_id, value)
);

-- ----------------------------------------------------------------------------
-- rule_drafts — the working, unpublished configuration for a category.
-- One row per category. `payload` shape depends on the category's kind:
--   numeric: { percentPerUnit, capPercent, enabled }
--   flat:    { percent, enabled }
--   matrix:  { percentPerRankStep, capPercent, enabled }  (cell values are
--            derived from category_options ranks, not stored separately)
-- ----------------------------------------------------------------------------
create table if not exists rule_drafts (
  category_id uuid primary key references rule_categories (id) on delete cascade,
  payload jsonb not null,
  updated_by uuid references profiles (id),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- rule_published — append-only snapshots. The row with the highest version
-- per category is what the public valuation engine reads.
-- ----------------------------------------------------------------------------
create table if not exists rule_published (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references rule_categories (id) on delete cascade,
  payload jsonb not null,
  options_snapshot jsonb,              -- matrix categories: a copy of category_options at publish time
  version int not null,
  published_by uuid references profiles (id),
  published_at timestamptz not null default now(),
  unique (category_id, version)
);

-- ----------------------------------------------------------------------------
-- rule_change_log — the audit trail. One row per Save Draft or Publish.
-- ----------------------------------------------------------------------------
create table if not exists rule_change_log (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references cities (id) on delete set null,
  category_id uuid references rule_categories (id) on delete set null,
  action text not null check (action in ('draft_saved', 'published', 'category_created', 'city_created', 'city_updated', 'city_deleted')),
  previous_value jsonb,
  new_value jsonb,
  reason text,
  user_id uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- valuations — every completed public valuation, for analytics.
-- ----------------------------------------------------------------------------
create table if not exists valuations (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references cities (id),
  subject jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table profiles enable row level security;
alter table cities enable row level security;
alter table rule_categories enable row level security;
alter table category_options enable row level security;
alter table rule_drafts enable row level security;
alter table rule_published enable row level security;
alter table rule_change_log enable row level security;
alter table valuations enable row level security;

-- profiles: a user can read their own row; admins can read all.
create policy "profiles_self_select" on profiles for select using (id = auth.uid() or is_admin());
create policy "profiles_admin_write" on profiles for all using (is_admin()) with check (is_admin());

-- cities: public reads active cities only; admins do everything.
create policy "cities_public_select" on cities for select using (is_active = true or is_admin());
create policy "cities_admin_write" on cities for insert with check (is_admin());
create policy "cities_admin_update" on cities for update using (is_admin());
create policy "cities_admin_delete" on cities for delete using (is_admin());

-- rule_categories: public reads active categories only; admins do everything.
create policy "categories_public_select" on rule_categories for select using (is_active = true or is_admin());
create policy "categories_admin_write" on rule_categories for insert with check (is_admin());
create policy "categories_admin_update" on rule_categories for update using (is_admin());
create policy "categories_admin_delete" on rule_categories for delete using (is_admin());

-- category_options: same visibility as their parent category.
create policy "options_public_select" on category_options for select using (true);
create policy "options_admin_write" on category_options for insert with check (is_admin());
create policy "options_admin_update" on category_options for update using (is_admin());
create policy "options_admin_delete" on category_options for delete using (is_admin());

-- rule_drafts: admin only, full stop. Public users must never see draft rules.
create policy "drafts_admin_only" on rule_drafts for all using (is_admin()) with check (is_admin());

-- rule_published: public can read (this is what the valuation engine uses);
-- only admins can write.
create policy "published_public_select" on rule_published for select using (true);
create policy "published_admin_write" on rule_published for insert with check (is_admin());

-- rule_change_log: admin only.
create policy "changelog_admin_only" on rule_change_log for all using (is_admin()) with check (is_admin());

-- valuations: anyone can insert (the public tool logs its own runs);
-- only admins can read the log back for analytics.
create policy "valuations_public_insert" on valuations for insert with check (true);
create policy "valuations_admin_select" on valuations for select using (is_admin());
