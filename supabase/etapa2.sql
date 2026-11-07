-- =====================================================================
-- MIAU LIFE · Etapa 2 (Atividades, Agenda, Metas da semana)
-- Como usar: Supabase > SQL Editor > New query > cole TUDO isto > Run.
-- Pode rodar mais de uma vez sem problema.
-- (Rode DEPOIS do schema.sql da Etapa 1, que você já rodou.)
-- =====================================================================

-- Novos campos nas atividades ----------------------------------------
alter table public.atividades add column if not exists prioridade   text not null default 'normal';
alter table public.atividades add column if not exists dias_semana  smallint[];      -- rotinas: 0=Dom ... 6=Sáb (vazio = todo dia)
alter table public.atividades add column if not exists lembrete_min integer;         -- avisar X minutos antes

-- OCORRÊNCIAS: cada vez que uma meta flexível ou rotina é planejada/feita num dia
create table if not exists public.ocorrencias (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  atividade_id  uuid not null references public.atividades(id) on delete cascade,
  dia           date not null,
  feito         boolean not null default false,
  feito_em      timestamptz,
  created_at    timestamptz not null default now(),
  unique (atividade_id, dia)
);
create index if not exists ocorrencias_user_dia on public.ocorrencias (user_id, dia);

alter table public.ocorrencias enable row level security;
drop policy if exists "ocorrencias: so o dono" on public.ocorrencias;
create policy "ocorrencias: so o dono" on public.ocorrencias
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Novo visual: ícones SVG (troca só quem ainda está com o padrão antigo) ----
update public.areas set icone = 'graduation-cap' where chave = 'estudos'    and icone !~ '^[a-z-]+$';
update public.areas set icone = 'laptop'         where chave = 'trabalho'   and icone !~ '^[a-z-]+$';
update public.areas set icone = 'house'          where chave = 'casa'       and icone !~ '^[a-z-]+$';
update public.areas set icone = 'heart'          where chave = 'pessoal'    and icone !~ '^[a-z-]+$';
update public.areas set icone = 'dumbbell'       where chave = 'fit'        and icone !~ '^[a-z-]+$';
update public.areas set icone = 'paw-print'      where chave = 'pets'       and icone !~ '^[a-z-]+$';
update public.areas set icone = 'tractor'        where chave = 'fazenda'    and icone !~ '^[a-z-]+$';
update public.areas set icone = 'coins'          where chave = 'financeiro' and icone !~ '^[a-z-]+$';
update public.areas set icone = 'plane'          where chave = 'viagens'    and icone !~ '^[a-z-]+$';
update public.areas set icone = 'sparkles'       where chave = 'projetos'   and icone !~ '^[a-z-]+$';
update public.areas set icone = 'star'           where chave = 'personalizada' and icone !~ '^[a-z-]+$';

-- Nomes do novo visual (só se você ainda não mudou o nome) -------------------
update public.areas set nome = 'Casa & Organização' where chave = 'casa'    and nome = 'Casa';
update public.areas set nome = 'Vida Fit'           where chave = 'fit'     and nome = 'Fit & Saúde';
update public.areas set nome = 'Fazenda & Rural'    where chave = 'fazenda' and nome = 'Fazenda';
update public.areas set nome = 'Pets'               where chave = 'pets'    and nome = 'Meus Pets';
