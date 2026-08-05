-- ============================================================================
-- ValueTrace — seed data
-- Run after 0001_init.sql. Safe to re-run (guards on slug/key uniqueness).
-- This replaces what used to be hardcoded in lib/rules-data.ts — from here on,
-- that file is a fallback shape reference only, not a runtime data source.
-- ============================================================================

do $$
declare
  v_city_id uuid;
  v_category_id uuid;
  v_cities text[][] := array[
    array['Mumbai', 'mumbai'],
    array['Bengaluru', 'bengaluru'],
    array['Delhi NCR', 'delhi-ncr'],
    array['Pune', 'pune'],
    array['Hyderabad', 'hyderabad']
  ];
  v_row text[];
begin
  foreach v_row slice 1 in array v_cities loop
    insert into cities (name, slug, is_active)
    values (v_row[1], v_row[2], true)
    on conflict (slug) do nothing;
  end loop;
end $$;

-- For every city, create the same default category set the app used to
-- hardcode, each with a starting draft AND an initial published v1 so the
-- public site has live rules immediately after seeding.
do $$
declare
  c record;
  v_category_id uuid;

  -- numeric categories: key, label, description, comparison_rule, example, higher_is_better, percentPerUnit, capPercent
  v_numeric jsonb := '[
    {"key":"loadFactor","label":"Load Factor","description":"The share of Super Built-up Area that isn''t usable carpet area — (SBA − Carpet) ÷ SBA.","comparison_rule":"Lower load factor (less area lost to common space) is preferred.","example":"Subject load factor 28%, comparable 24% → comparable is more efficient → comparable gets a positive adjustment.","higherIsBetter":false,"percentPerUnit":0.4,"capPercent":5},
    {"key":"age","label":"Age of Property","description":"Years since the property was constructed or handed over.","comparison_rule":"Newer is preferred.","example":"Subject is 8 years old, comparable is 3 years old → comparable is newer → comparable gets a positive adjustment.","higherIsBetter":false,"percentPerUnit":0.6,"capPercent":8},
    {"key":"floor","label":"Floor Number","description":"The unit''s floor, expressed as a fraction of the building''s total floors so it is comparable across buildings of different heights.","comparison_rule":"A higher relative floor is generally preferred.","example":"Subject on floor 6 of 20 (30%), comparable on floor 16 of 20 (80%) → comparable is higher → positive adjustment.","higherIsBetter":true,"percentPerUnit":0.25,"capPercent":4}
  ]'::jsonb;

  -- flat categories: key, label, description, comparison_rule, example, valueType, percent
  v_flat jsonb := '[
    {"key":"parking","label":"Parking","description":"Number of covered parking slots included with the unit.","comparison_rule":"More covered slots is preferred.","example":"Subject has 1 slot, comparable has 2 → comparable has more → comparable gets a positive adjustment.","valueType":"count","percent":1},
    {"key":"balcony","label":"Balcony","description":"Number of balconies attached to the unit.","comparison_rule":"More balconies is preferred.","example":"Subject has 1 balcony, comparable has 2 → comparable has more → comparable gets a positive adjustment.","valueType":"count","percent":0.5},
    {"key":"legalIssues","label":"Legal Issues","description":"Whether the property carries a flagged legal or title issue.","comparison_rule":"A clean title is always preferred over a flagged one.","example":"Comparable has a flagged title issue, subject doesn''t → comparable is marked down by the configured penalty.","valueType":"boolean","percent":4}
  ]'::jsonb;

  -- matrix categories: key, label, description, comparison_rule, example, percentPerRankStep, capPercent, options[]
  v_matrix jsonb := '[
    {"key":"unitType","label":"Unit Type","description":"The configuration of the unit — Studio, 1BHK, 2BHK, 3BHK, 4BHK, or Villa.","comparison_rule":"Larger configurations rank higher on a fixed scale.","example":"Subject is 2BHK, comparable is 3BHK → comparable ranks higher → positive adjustment.","percentPerRankStep":1.2,"capPercent":6,"options":[{"value":"studio","label":"Studio","rank":1},{"value":"1bhk","label":"1BHK","rank":2},{"value":"2bhk","label":"2BHK","rank":3},{"value":"3bhk","label":"3BHK","rank":4},{"value":"4bhk","label":"4BHK","rank":5},{"value":"villa","label":"Villa","rank":6}]},
    {"key":"constructionStatus","label":"Construction Status","description":"Under-construction, new-launch, or ready-to-move.","comparison_rule":"Ready-to-move ranks highest, followed by new-launch, then under-construction.","example":"Subject is under-construction, comparable is ready-to-move → comparable ranks higher → positive adjustment.","percentPerRankStep":2.5,"capPercent":5,"options":[{"value":"under-construction","label":"Under Construction","rank":1},{"value":"new-launch","label":"New Launch","rank":2},{"value":"ready-to-move","label":"Ready to Move","rank":3}]},
    {"key":"condition","label":"Property Condition","description":"The physical state of the unit — needs-repair, average, good, or excellent.","comparison_rule":"Better condition ranks higher on a fixed scale.","example":"Subject is in average condition, comparable is excellent → comparable ranks higher → positive adjustment.","percentPerRankStep":2,"capPercent":6,"options":[{"value":"needs-repair","label":"Needs Repair","rank":1},{"value":"average","label":"Average","rank":2},{"value":"good","label":"Good","rank":3},{"value":"excellent","label":"Excellent","rank":4}]},
    {"key":"furnishing","label":"Furnishing","description":"Unfurnished, semi-furnished, or fully-furnished.","comparison_rule":"More furnished ranks higher.","example":"Subject is unfurnished, comparable is fully-furnished → comparable ranks higher → positive adjustment.","percentPerRankStep":1.5,"capPercent":4,"options":[{"value":"unfurnished","label":"Unfurnished","rank":1},{"value":"semi-furnished","label":"Semi-Furnished","rank":2},{"value":"fully-furnished","label":"Fully Furnished","rank":3}]},
    {"key":"facing","label":"Facing","description":"The direction the unit''s main frontage opens to.","comparison_rule":"Certain directions are ranked higher per city — for example East and North-East are commonly preferred.","example":"Subject faces South, comparable faces East → comparable ranks higher → positive adjustment.","percentPerRankStep":1,"capPercent":3,"options":[{"value":"south","label":"South","rank":1},{"value":"south-west","label":"South-West","rank":2},{"value":"west","label":"West","rank":3},{"value":"other","label":"Other","rank":3},{"value":"north","label":"North","rank":4},{"value":"north-east","label":"North-East","rank":5},{"value":"east","label":"East","rank":5}]}
  ]'::jsonb;

  n jsonb; f jsonb; m jsonb; o jsonb;
begin
  for c in select id from cities loop

    for n in select * from jsonb_array_elements(v_numeric) loop
      insert into rule_categories (city_id, kind, key, label, description, comparison_rule, example, higher_is_better, sort_order)
      values (c.id, 'numeric', n->>'key', n->>'label', n->>'description', n->>'comparison_rule', n->>'example', (n->>'higherIsBetter')::boolean, 0)
      on conflict (city_id, key) do nothing
      returning id into v_category_id;

      if v_category_id is not null then
        insert into rule_drafts (category_id, payload)
        values (v_category_id, jsonb_build_object('percentPerUnit', (n->>'percentPerUnit')::numeric, 'capPercent', (n->>'capPercent')::numeric, 'enabled', true));

        insert into rule_published (category_id, payload, version, published_at)
        values (v_category_id, jsonb_build_object('percentPerUnit', (n->>'percentPerUnit')::numeric, 'capPercent', (n->>'capPercent')::numeric, 'enabled', true), 1, now());
      end if;
      v_category_id := null;
    end loop;

    for f in select * from jsonb_array_elements(v_flat) loop
      insert into rule_categories (city_id, kind, key, label, description, comparison_rule, example, value_type, sort_order)
      values (c.id, 'flat', f->>'key', f->>'label', f->>'description', f->>'comparison_rule', f->>'example', f->>'valueType', 0)
      on conflict (city_id, key) do nothing
      returning id into v_category_id;

      if v_category_id is not null then
        insert into rule_drafts (category_id, payload)
        values (v_category_id, jsonb_build_object('percent', (f->>'percent')::numeric, 'enabled', true));

        insert into rule_published (category_id, payload, version, published_at)
        values (v_category_id, jsonb_build_object('percent', (f->>'percent')::numeric, 'enabled', true), 1, now());
      end if;
      v_category_id := null;
    end loop;

    for m in select * from jsonb_array_elements(v_matrix) loop
      insert into rule_categories (city_id, kind, key, label, description, comparison_rule, example, sort_order)
      values (c.id, 'matrix', m->>'key', m->>'label', m->>'description', m->>'comparison_rule', m->>'example', 0)
      on conflict (city_id, key) do nothing
      returning id into v_category_id;

      if v_category_id is not null then
        for o in select * from jsonb_array_elements(m->'options') loop
          insert into category_options (category_id, value, label, rank)
          values (v_category_id, o->>'value', o->>'label', (o->>'rank')::int);
        end loop;

        insert into rule_drafts (category_id, payload)
        values (v_category_id, jsonb_build_object('percentPerRankStep', (m->>'percentPerRankStep')::numeric, 'capPercent', (m->>'capPercent')::numeric, 'enabled', true));

        insert into rule_published (category_id, payload, options_snapshot, version, published_at)
        select v_category_id,
               jsonb_build_object('percentPerRankStep', (m->>'percentPerRankStep')::numeric, 'capPercent', (m->>'capPercent')::numeric, 'enabled', true),
               jsonb_agg(jsonb_build_object('value', co.value, 'label', co.label, 'rank', co.rank)),
               1,
               now()
        from category_options co where co.category_id = v_category_id;
      end if;
      v_category_id := null;
    end loop;

  end loop;
end $$;
