-- ════════════════════════════════════════════════════════════════
--  FURA HANDBÓK — VIÐHALD (keyrt einu sinni, eftir supabase-setup.sql)
--  Límdu allt þetta í Supabase → SQL Editor → Run.
--  Óhætt að keyra aftur.
--
--  Hugmyndin: viðhaldsverkin sjálf (hvað/hversu oft/ábyrgð) búa í
--  handbókinni og breytast bara með breytingakóða (2808). "Lokið"-
--  staðan (hvenær síðast hakað "búið") er geymd hér sérstaklega og
--  BÁÐIR kóðar (1234 og 2808) mega uppfæra hana — en ekkert annað.
-- ════════════════════════════════════════════════════════════════

-- 1) Sérstök tafla fyrir "lokið"-stöðu viðhalds (taskId -> {at, by})
create table if not exists public.maintenance_state (
  id          text primary key default 'main',
  completions jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

insert into public.maintenance_state (id, completions)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.maintenance_state enable row level security;

-- 2) Sækja "lokið"-stöðu — hvor kóði sem er (1234 eða 2808)
create or replace function public.get_maintenance(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_view text; v_edit text;
begin
  select value into v_view from app_config where key = 'view_code';
  select value into v_edit from app_config where key = 'edit_code';
  if p_code is distinct from v_view and p_code is distinct from v_edit then
    return null;                         -- rangur kóði
  end if;
  return (select completions from maintenance_state where id = 'main');
end;
$$;

-- 3) Haka verkefni "búið" — hvor kóði sem er. Uppfærir bara þetta eina verkefni.
create or replace function public.complete_task(p_code text, p_task_id text, p_by text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_view text; v_edit text; v_out jsonb;
begin
  select value into v_view from app_config where key = 'view_code';
  select value into v_edit from app_config where key = 'edit_code';
  if p_code is distinct from v_view and p_code is distinct from v_edit then
    raise exception 'Rangur kóði';
  end if;
  if p_task_id is null or length(p_task_id) = 0 then
    raise exception 'Vantar verkefni';
  end if;
  update maintenance_state
     set completions = jsonb_set(
           completions,
           array[p_task_id],
           jsonb_build_object('at', to_jsonb(now()), 'by', to_jsonb(coalesce(p_by, ''))),
           true),
         updated_at = now()
   where id = 'main'
   returning completions into v_out;
  return v_out;
end;
$$;

-- 4) Taka "búið" til baka (ef hakað óvart) — hvor kóði sem er
create or replace function public.uncomplete_task(p_code text, p_task_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_view text; v_edit text; v_out jsonb;
begin
  select value into v_view from app_config where key = 'view_code';
  select value into v_edit from app_config where key = 'edit_code';
  if p_code is distinct from v_view and p_code is distinct from v_edit then
    raise exception 'Rangur kóði';
  end if;
  update maintenance_state
     set completions = completions - p_task_id,
         updated_at = now()
   where id = 'main'
   returning completions into v_out;
  return v_out;
end;
$$;

grant execute on function public.get_maintenance(text)            to anon;
grant execute on function public.complete_task(text, text, text)  to anon;
grant execute on function public.uncomplete_task(text, text)      to anon;
