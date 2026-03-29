-- ══════════════════════════════════════════════
-- PABLO — Tracking de leads e atividade
-- Colar no Supabase: SQL Editor → New query → Run
-- ══════════════════════════════════════════════

-- 4. LEAD_SESSIONS (cada acesso ao app)
create table if not exists lead_sessions (
  id              uuid primary key default gen_random_uuid(),
  session_id      text not null,          -- ID anônimo gerado no browser (localStorage)
  user_id         uuid references auth.users on delete set null,  -- null até converter
  referrer        text,                   -- document.referrer
  landing_page    text,                   -- primeira URL acessada
  utm_source      text,                   -- ex: google, instagram, tiktok
  utm_medium      text,                   -- ex: cpc, organic, social
  utm_campaign    text,                   -- ex: black-friday-2026
  utm_content     text,                   -- ex: banner-carro-usado
  utm_term        text,                   -- keyword paga (Google Ads)
  converted_at    timestamptz,            -- quando fez cadastro
  created_at      timestamptz default now()
);

create index if not exists lead_sessions_session_id_idx on lead_sessions(session_id);
create index if not exists lead_sessions_user_id_idx    on lead_sessions(user_id);
create index if not exists lead_sessions_created_at_idx on lead_sessions(created_at);

-- 5. USER_ACTIVITY_LOG (todas as ações do lead/usuário no app)
create table if not exists user_activity_log (
  id          bigserial primary key,
  user_id     uuid references auth.users on delete set null,  -- null = pré-login
  session_id  text not null,             -- liga com lead_sessions
  event       text not null,             -- ver lista de eventos abaixo
  laudo_id    uuid references laudos on delete set null,
  metadata    jsonb default '{}',        -- dados adicionais livres
  created_at  timestamptz default now()
);

-- Eventos esperados:
--   page_view
--   cadastro_iniciado, otp_enviado, otp_validado, login_realizado
--   veiculo_preenchido
--   checklist_iniciado, checklist_item_respondido, checklist_concluido
--   cautelar_visualizada
--   mercado_visualizado
--   resultado_visto
--   laudo_compartilhado
--   pagamento_iniciado, pagamento_confirmado

create index if not exists user_activity_log_user_id_idx    on user_activity_log(user_id);
create index if not exists user_activity_log_session_id_idx on user_activity_log(session_id);
create index if not exists user_activity_log_event_idx      on user_activity_log(event);
create index if not exists user_activity_log_created_at_idx on user_activity_log(created_at);

-- ══════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════

alter table lead_sessions     enable row level security;
alter table user_activity_log enable row level security;

-- Sem acesso via anon/authenticated — só service role lê (Metabase, dashboards)
-- Insert é permitido para anon (o browser precisa gravar sem estar logado)
create policy "lead_sessions_insert" on lead_sessions
  for insert with check (true);

create policy "activity_log_insert" on user_activity_log
  for insert with check (true);
