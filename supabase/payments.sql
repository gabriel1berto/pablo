-- ══════════════════════════════════════════════
-- PABLO — Créditos de laudo (pagamento Stripe)
-- Colar no Supabase: SQL Editor → New query → Run
-- ══════════════════════════════════════════════

create table if not exists laudo_credits (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users on delete cascade,
  stripe_session_id text unique not null,
  used_at           timestamptz,          -- preenchido quando laudo é criado
  created_at        timestamptz default now()
);

create index if not exists laudo_credits_user_id_idx on laudo_credits(user_id);

alter table laudo_credits enable row level security;

-- Usuário só vê seus próprios créditos
create policy "credits_select_own" on laudo_credits
  for select using (auth.uid() = user_id);

-- Inserção apenas pelo service role (webhook)
create policy "credits_insert_service" on laudo_credits
  for insert with check (false);  -- bloqueado para anon/authenticated; webhook usa service role
