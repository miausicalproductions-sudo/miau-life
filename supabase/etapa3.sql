-- =====================================================================
-- MIAU LIFE · Etapa 3 (Casa & Organização + Pessoal)
-- Como usar: Supabase > SQL Editor > "+" > Create a new snippet
--            > cole TUDO isto > Run.
-- Pode rodar mais de uma vez sem problema.
-- (Rode DEPOIS do schema.sql e do etapa2.sql, que você já rodou.)
-- =====================================================================

-- CUIDADOS: coisas que se repetem de tempos em tempos
-- (limpar a geladeira a cada 30 dias, hidratação capilar a cada 7 dias...)
create table if not exists public.cuidados (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  area_id         uuid references public.areas(id) on delete cascade,
  grupo           text not null default 'Geral',        -- cômodo (Casa) ou tipo de cuidado (Pessoal)
  nome            text not null,
  frequencia_dias integer not null default 7 check (frequencia_dias > 0),
  ultima_em       date,                                  -- última vez que foi feito
  anterior_em     date,                                  -- para poder desfazer o "feito"
  ativo           boolean not null default true,
  created_at      timestamptz not null default now()
);
create index if not exists cuidados_user_area on public.cuidados (user_id, area_id);

-- LISTA: lista de compras / reposição da casa
create table if not exists public.itens_lista (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  area_id     uuid references public.areas(id) on delete cascade,
  nome        text not null,
  feito       boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists itens_lista_user_area on public.itens_lista (user_id, area_id);

-- SEGURANÇA: cada pessoa só enxerga e altera os PRÓPRIOS dados ---------
alter table public.cuidados    enable row level security;
alter table public.itens_lista enable row level security;

drop policy if exists "cuidados: so o dono" on public.cuidados;
create policy "cuidados: so o dono" on public.cuidados
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "itens_lista: so o dono" on public.itens_lista;
create policy "itens_lista: so o dono" on public.itens_lista
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
