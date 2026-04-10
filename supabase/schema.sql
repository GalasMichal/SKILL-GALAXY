-- Skill Galaxy: initial schema for Plan A.
create extension if not exists "pgcrypto";

create table if not exists public.nodes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  category text not null default 'other',
  level int not null default 1 check (level between 1 and 5),
  position jsonb not null default '{"x":0,"y":0,"z":0}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.edges (
  id uuid primary key default gen_random_uuid(),
  from_node_id uuid not null references public.nodes(id) on delete cascade,
  to_node_id uuid not null references public.nodes(id) on delete cascade,
  relation text not null default 'related',
  created_at timestamptz not null default now(),
  unique (from_node_id, to_node_id, relation)
);

create table if not exists public.layouts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  graph jsonb not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.nodes enable row level security;
alter table public.edges enable row level security;
alter table public.layouts enable row level security;

drop policy if exists "nodes_read_all" on public.nodes;
create policy "nodes_read_all"
  on public.nodes
  for select
  to anon, authenticated
  using (true);

drop policy if exists "edges_read_all" on public.edges;
create policy "edges_read_all"
  on public.edges
  for select
  to anon, authenticated
  using (true);

drop policy if exists "layouts_read_all" on public.layouts;
create policy "layouts_read_all"
  on public.layouts
  for select
  to anon, authenticated
  using (true);

drop policy if exists "nodes_write_authenticated" on public.nodes;
create policy "nodes_write_authenticated"
  on public.nodes
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "edges_write_authenticated" on public.edges;
create policy "edges_write_authenticated"
  on public.edges
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "layouts_write_authenticated" on public.layouts;
create policy "layouts_write_authenticated"
  on public.layouts
  for all
  to authenticated
  using (true)
  with check (true);
