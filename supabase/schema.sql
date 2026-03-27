-- ══════════════════════════════════════════════
-- PABLO — Schema inicial
-- Colar no Supabase: SQL Editor → New query → Run
-- ══════════════════════════════════════════════

-- 1. LAUDOS
create table if not exists laudos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade,
  brand         text not null,
  model         text not null,
  year          int  not null,
  km            int  not null,
  condition     text default 'usado',
  asking_price  numeric,
  state         text,
  fipe_price    numeric,
  fipe_ref      text,
  score         numeric,
  verdict       text,
  findings      jsonb default '[]',
  is_paid       boolean default false,
  is_public     boolean default true,
  created_at    timestamptz default now()
);

-- 2. LAUDO_ITEMS (respostas do checklist + cautelar)
create table if not exists laudo_items (
  id         serial primary key,
  laudo_id   uuid references laudos on delete cascade,
  category   text,    -- 'checklist' | 'cautelar'
  item_key   text,
  item_name  text,
  checked    boolean default false,
  severity   text,    -- 'critical' | 'warn' | 'ok'
  notes      text
);

-- 3. CAR_ISSUES (banco de problemas por modelo/km — populado por AI)
create table if not exists car_issues (
  id            serial primary key,
  brand         text,
  model_pattern text,   -- ex: 'Duster', 'Onix', 'HB20'
  year_from     int,
  year_to       int,
  km_from       int,
  km_to         int,
  category      text,   -- 'motor' | 'suspensao' | 'carroceria' | 'documentacao'
  title         text not null,
  description   text,
  severity      text not null,  -- 'critical' | 'warn' | 'ok'
  sort_order    int default 0
);

-- ══════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════

alter table laudos      enable row level security;
alter table laudo_items enable row level security;
alter table car_issues  enable row level security;

-- Laudos: dono vê e edita os próprios
create policy "owner_select" on laudos for select using (auth.uid() = user_id);
create policy "owner_insert" on laudos for insert with check (auth.uid() = user_id);
create policy "owner_update" on laudos for update using (auth.uid() = user_id);

-- Laudos públicos: qualquer um pode visualizar
create policy "public_select" on laudos for select using (is_public = true);

-- Laudo items: seguem o acesso do laudo pai
create policy "owner_items_all" on laudo_items for all
  using (laudo_id in (select id from laudos where user_id = auth.uid()));

-- Car issues: leitura pública (é um banco de dados de referência)
create policy "car_issues_public_read" on car_issues for select using (true);
