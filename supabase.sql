-- Geora: Konten + Fortschritt. Benutzername + Passwort, keine E-Mail.
-- Im Supabase-Dashboard: SQL Editor -> New query -> alles einfügen -> Run.
-- Passwörter werden mit bcrypt gehasht (pgcrypto). Die Tabellen sind für Browser komplett gesperrt;
-- nur die Funktionen unten (security definer) dürfen darauf zugreifen.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.geora_users (
  name   text primary key check (name ~ '^[a-z0-9_-]{3,20}$'),
  pw     text not null,                                   -- bcrypt-Hash
  data   text not null default '{}' check (length(data) <= 40000),  -- kompakter Fortschritt (JSON-Text)
  fails  smallint not null default 0,
  locked timestamptz
);
create table if not exists public.geora_sessions (
  h    text primary key,                                  -- SHA-256 des Anmelde-Tokens
  name text not null references public.geora_users(name) on delete cascade,
  t    timestamptz not null default now()
);
create index if not exists geora_sessions_name on public.geora_sessions(name);

alter table public.geora_users    enable row level security;   -- ohne Policy: kein Direktzugriff
alter table public.geora_sessions enable row level security;
revoke all on public.geora_users, public.geora_sessions from anon, authenticated;

-- Registrieren
create or replace function public.geora_register(p_name text, p_pass text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare v_tok text;
begin
  p_name := lower(btrim(coalesce(p_name, '')));
  if p_name !~ '^[a-z0-9_-]{3,20}$' then return jsonb_build_object('e', 'name'); end if;
  if length(coalesce(p_pass, '')) < 6 or length(p_pass) > 72 then return jsonb_build_object('e', 'pass'); end if;
  if exists (select 1 from public.geora_users where name = p_name) then return jsonb_build_object('e', 'taken'); end if;
  insert into public.geora_users(name, pw) values (p_name, crypt(p_pass, gen_salt('bf', 10)));
  v_tok := encode(gen_random_bytes(24), 'hex');
  insert into public.geora_sessions(h, name) values (encode(digest(v_tok, 'sha256'), 'hex'), p_name);
  return jsonb_build_object('t', v_tok, 'd', '{}');
end $$;

-- Anmelden (5 Fehlversuche = 10 Minuten Sperre; alte Sitzungen werden aufgeräumt, um Platz zu sparen)
create or replace function public.geora_login(p_name text, p_pass text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare u public.geora_users%rowtype; v_tok text;
begin
  p_name := lower(btrim(coalesce(p_name, '')));
  select * into u from public.geora_users where name = p_name for update;
  if not found then
    perform crypt(coalesce(p_pass, ''), gen_salt('bf', 10));   -- gleiche Dauer, damit man nicht erkennt, ob der Name existiert
    return jsonb_build_object('e', 'cred');
  end if;
  if u.locked is not null and u.locked > now() then return jsonb_build_object('e', 'locked'); end if;
  if u.pw <> crypt(coalesce(p_pass, ''), u.pw) then
    update public.geora_users
       set fails  = case when fails + 1 >= 5 then 0 else fails + 1 end,
           locked = case when fails + 1 >= 5 then now() + interval '10 minutes' else locked end
     where name = p_name;
    return jsonb_build_object('e', 'cred');
  end if;
  update public.geora_users set fails = 0, locked = null where name = p_name and (fails <> 0 or locked is not null);
  delete from public.geora_sessions
   where name = p_name and (t < now() - interval '60 days'
         or h in (select h from public.geora_sessions where name = p_name order by t desc offset 3));
  v_tok := encode(gen_random_bytes(24), 'hex');
  insert into public.geora_sessions(h, name) values (encode(digest(v_tok, 'sha256'), 'hex'), p_name);
  return jsonb_build_object('t', v_tok, 'd', u.data);
end $$;

-- Fortschritt lesen
create or replace function public.geora_get(p_tok text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare v_h text := encode(digest(coalesce(p_tok, ''), 'sha256'), 'hex'); v_name text; v_data text;
begin
  select name into v_name from public.geora_sessions where h = v_h and t > now() - interval '60 days';
  if v_name is null then return jsonb_build_object('e', 'session'); end if;
  update public.geora_sessions set t = now() where h = v_h and t < now() - interval '1 day';
  select data into v_data from public.geora_users where name = v_name;
  return jsonb_build_object('d', v_data);
end $$;

-- Fortschritt speichern (schreibt nur, wenn sich etwas geändert hat)
create or replace function public.geora_put(p_tok text, p_data text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare v_h text := encode(digest(coalesce(p_tok, ''), 'sha256'), 'hex'); v_name text;
begin
  if length(coalesce(p_data, '')) > 40000 then return jsonb_build_object('e', 'big'); end if;
  select name into v_name from public.geora_sessions where h = v_h and t > now() - interval '60 days';
  if v_name is null then return jsonb_build_object('e', 'session'); end if;
  update public.geora_users set data = p_data where name = v_name and data is distinct from p_data;
  return jsonb_build_object('ok', true);
end $$;

-- Abmelden / Konto löschen
create or replace function public.geora_logout(p_tok text)
returns void language sql security definer set search_path = public, extensions as $$
  delete from public.geora_sessions where h = encode(digest(coalesce(p_tok, ''), 'sha256'), 'hex');
$$;
create or replace function public.geora_delete(p_tok text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare v_h text := encode(digest(coalesce(p_tok, ''), 'sha256'), 'hex'); v_name text;
begin
  select name into v_name from public.geora_sessions where h = v_h and t > now() - interval '60 days';
  if v_name is null then return jsonb_build_object('e', 'session'); end if;
  delete from public.geora_users where name = v_name;   -- Sitzungen werden automatisch mitgelöscht
  return jsonb_build_object('ok', true);
end $$;

grant execute on function public.geora_register(text, text), public.geora_login(text, text), public.geora_get(text),
  public.geora_put(text, text), public.geora_logout(text), public.geora_delete(text) to anon, authenticated;
