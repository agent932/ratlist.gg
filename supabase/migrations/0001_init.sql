-- Schema initialization for Ratlist.gg
create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

-- games
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text unique not null,
  created_at timestamptz not null default now()
);

-- players (per-game identity)
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  identifier text not null,
  display_name text,
  created_at timestamptz not null default now(),
  unique (game_id, identifier)
);
create index if not exists idx_players_game_identifier on public.players (game_id, identifier);
create index if not exists idx_players_identifier_trgm on public.players using gin (identifier gin_trgm_ops);

-- incident categories
create table if not exists public.incident_categories (
  id smallint primary key,
  slug text unique not null,
  label text not null
);

-- incidents
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  reported_player_id uuid not null references public.players(id) on delete cascade,
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  category_id smallint not null references public.incident_categories(id),
  occurred_at timestamptz,
  description text not null check (char_length(description) between 10 and 2000),
  region text,
  mode text,
  map text,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_incidents_player_created on public.incidents (reported_player_id, created_at desc);
create index if not exists idx_incidents_game_created on public.incidents (game_id, created_at desc);
create index if not exists idx_incidents_category_created on public.incidents (category_id, created_at desc);
create index if not exists idx_incidents_desc_tsv on public.incidents using gin (to_tsvector('english', description));

-- flags (moderation)
create table if not exists public.flags (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  flagger_user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  unique (incident_id, flagger_user_id)
);

-- optional user profiles
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text default 'user', -- 'user' | 'moderator'
  created_at timestamptz not null default now()
);

-- Reputation view
create or replace view public.player_reputation_view as
select
  i.game_id,
  p.id as player_id,
  count(i.*) as report_count,
  max(i.created_at) as last_incident_at,
  jsonb_object_agg(c.slug, cnt.cnt) filter (where cnt.cnt is not null) as category_counts,
  coalesce(sum(case c.slug
    when 'betrayal' then -5
    when 'extract-camping' then -3
    when 'stream-sniping' then -4
    when 'team-violation' then -3
    when 'clutch-save' then 3
    else 0 end), 0) as score
from public.players p
join public.incidents i on i.reported_player_id = p.id
join public.incident_categories c on c.id = i.category_id
left join (
  select category_id, reported_player_id, count(*) as cnt
  from public.incidents group by category_id, reported_player_id
) cnt on cnt.reported_player_id = p.id and cnt.category_id = c.id
group by i.game_id, p.id;

-- RPC: get player profile
create or replace function public.fn_get_player_profile(game_slug text, identifier text)
returns table (
  game_id uuid,
  player_id uuid,
  report_count bigint,
  last_incident_at timestamptz,
  category_counts jsonb,
  score integer
) language sql stable as $$
  select v.game_id, v.player_id, v.report_count, v.last_incident_at, v.category_counts, v.score
  from public.player_reputation_view v
  join public.games g on g.id = v.game_id and g.slug = game_slug
  join public.players p on p.id = v.player_id and p.identifier = identifier;
$$;

-- RPC: leaderboard
create or replace function public.fn_get_leaderboard(game_slug text, period text)
returns table (
  player_id uuid,
  report_count bigint,
  score integer
) language sql stable as $$
  with base as (
    select p.id as player_id, i.created_at,
      sum(case c.slug
        when 'betrayal' then -5
        when 'extract-camping' then -3
        when 'stream-sniping' then -4
        when 'team-violation' then -3
        when 'clutch-save' then 3 else 0 end) as score,
      count(*) as report_count
    from public.players p
    join public.incidents i on i.reported_player_id = p.id
    join public.incident_categories c on c.id = i.category_id
    join public.games g on g.id = i.game_id
    where g.slug = game_slug
      and (
        period = 'week' and i.created_at >= now() - interval '7 days' or
        period = 'month' and i.created_at >= now() - interval '30 days' or
        period not in ('week','month')
      )
    group by p.id, i.created_at
  )
  select player_id, sum(report_count) as report_count, sum(score) as score
  from base group by player_id order by report_count desc limit 100;
$$;

-- RPC: recent incidents
create or replace function public.fn_get_recent_incidents(game_slug text, lim int)
returns table (
  id uuid,
  reported_player_id uuid,
  category_id smallint,
  description text,
  created_at timestamptz
) language sql stable as $$
  select i.id, i.reported_player_id, i.category_id, i.description, i.created_at
  from public.incidents i
  join public.games g on g.id = i.game_id and g.slug = game_slug
  order by i.created_at desc
  limit greatest(lim, 1);
$$;

-- Enable RLS
alter table public.players enable row level security;
alter table public.incidents enable row level security;
alter table public.flags enable row level security;
alter table public.user_profiles enable row level security;

-- Basic policies
-- Public reads for games and categories (no RLS there)

-- players: public select
create policy if not exists players_select_public on public.players for select using (true);

-- incidents: public select (hide reporter via column selection in app)
create policy if not exists incidents_select_public on public.incidents for select using (true);

-- incidents: insert by authenticated user only
create policy if not exists incidents_insert_owner on public.incidents for insert with check (auth.uid() = reporter_user_id);

-- incidents: update/delete by owner within 15 minutes
create policy if not exists incidents_owner_modify on public.incidents for update using (
  auth.uid() = reporter_user_id and created_at > now() - interval '15 minutes'
);
create policy if not exists incidents_owner_delete on public.incidents for delete using (
  auth.uid() = reporter_user_id and created_at > now() - interval '15 minutes'
);

-- flags: select by author or moderator; insert by authenticated
create policy if not exists flags_select_owner on public.flags for select using (
  auth.uid() = flagger_user_id or exists (
    select 1 from public.user_profiles up where up.user_id = auth.uid() and up.role = 'moderator'
  )
);
create policy if not exists flags_insert_owner on public.flags for insert with check (auth.uid() = flagger_user_id);
