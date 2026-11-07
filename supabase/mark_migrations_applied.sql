-- Run this in the Supabase SQL Editor AFTER pasting both migration files successfully.
-- Keeps local `supabase db push` in sync when CLI can reach the DB again.

create schema if not exists supabase_migrations;

create table if not exists supabase_migrations.schema_migrations (
  version text primary key,
  statements text[],
  name text
);

insert into supabase_migrations.schema_migrations (version, name)
values
  ('20261107134938', 'core_schema'),
  ('20261107142302', 'grants_and_patient_signup')
on conflict (version) do nothing;
