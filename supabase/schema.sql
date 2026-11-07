-- =====================================================================
-- MIAU LIFE · Banco de dados da Etapa 1 (Fundação)
-- Como usar: Supabase > SQL Editor > New query > cole TUDO isto > Run.
-- Pode rodar de novo sem medo: ele só cria o que ainda não existe.
-- =====================================================================

-- ÁREAS (Estudos, Trabalho, Casa... e as que você criar) -----------------
create table if not exists public.areas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  chave       text not null default 'personalizada',
  nome        text not null,
  icone       text not null default '🎀',
  cor         text not null default 'rosa',
  posicao     integer not null default 0,
  arquivada   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ATIVIDADES: o "motor" que alimenta Início, Calendário e Miau IA ---------
-- tipo: compromisso (com presença) · prazo · agendada · flexivel · rotina · caixa
create table if not exists public.atividades (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  area_id       uuid references public.areas(id) on delete set null,
  titulo        text not null,
  descricao     text,
  tipo          text not null default 'caixa'
                check (tipo in ('compromisso','prazo','agendada','flexivel','rotina','caixa')),
  status        text not null default 'pendente'
                check (status in ('pendente','feita','arquivada')),
  inicio        timestamptz,          -- compromisso: dia e hora
  fim           timestamptz,
  dia           date,                 -- tarefa agendada
  prazo         date,                 -- tarefa com prazo
  meta_semana   integer,              -- tarefa flexível: quantas vezes por semana
  local         text,
  endereco      text,
  concluida_em  timestamptz,
  excluida_em   timestamptz,          -- "lixeira": nada some de verdade sem você confirmar
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists atividades_user_status on public.atividades (user_id, status);
create index if not exists atividades_user_dia on public.atividades (user_id, dia);
create index if not exists areas_user on public.areas (user_id, posicao);

-- Atualiza "updated_at" sozinho
create or replace function public.tocar_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists areas_tocar on public.areas;
create trigger areas_tocar before update on public.areas
  for each row execute function public.tocar_updated_at();

drop trigger if exists atividades_tocar on public.atividades;
create trigger atividades_tocar before update on public.atividades
  for each row execute function public.tocar_updated_at();

-- SEGURANÇA: cada pessoa só enxerga e altera os PRÓPRIOS dados ---------------
alter table public.areas      enable row level security;
alter table public.atividades enable row level security;

drop policy if exists "areas: so o dono" on public.areas;
create policy "areas: so o dono" on public.areas
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "atividades: so o dono" on public.atividades;
create policy "atividades: so o dono" on public.atividades
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
