-- Player ID Linking System
-- Feature: 003-player-linking
-- T001, T006, T014: Create player_links table, functions for linked players and ownership

-- Create player_links table
create table if not exists public.player_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(user_id) on delete cascade,
  player_id text not null,
  game_id uuid not null references public.games(id) on delete cascade,
  linked_at timestamptz not null default now(),
  verified boolean not null default false,
  
  -- Ensure one player ID per game can only be claimed by one user
  unique(player_id, game_id)
);

-- Create indexes for performance
create index if not exists idx_player_links_user_id on public.player_links(user_id);
create index if not exists idx_player_links_player_game on public.player_links(player_id, game_id);

-- Enable RLS
alter table public.player_links enable row level security;

-- RLS Policy: Anyone can view player links (public data)
drop policy if exists "player_links_select_policy" on public.player_links;
create policy "player_links_select_policy" on public.player_links
  for select
  using (true);

-- RLS Policy: Users can insert their own links
drop policy if exists "player_links_insert_policy" on public.player_links;
create policy "player_links_insert_policy" on public.player_links
  for insert
  with check (auth.uid() = user_id);

-- RLS Policy: Users can delete their own links
drop policy if exists "player_links_delete_policy" on public.player_links;
create policy "player_links_delete_policy" on public.player_links
  for delete
  using (auth.uid() = user_id);

-- RLS Policy: Admins can manage all links
drop policy if exists "player_links_admin_all_policy" on public.player_links;
create policy "player_links_admin_all_policy" on public.player_links
  for all
  using (public.fn_user_has_role('admin'));

-- T006: Function to get linked players for a user
create or replace function public.fn_get_linked_players(target_user_id uuid)
returns table (
  player_id text,
  game_id uuid,
  game_name text,
  game_slug text,
  linked_at timestamptz,
  incident_count bigint,
  verified boolean
)
language sql
stable
security definer
as $$
  select 
    pl.player_id,
    pl.game_id,
    g.name as game_name,
    g.slug as game_slug,
    pl.linked_at,
    coalesce(incident_counts.count, 0) as incident_count,
    pl.verified
  from public.player_links pl
  join public.games g on g.id = pl.game_id
  left join lateral (
    select count(*) as count
    from public.incidents i
    join public.players p on p.id = i.reported_player_id
    where p.identifier = pl.player_id
    and i.game_id = pl.game_id
    and i.status = 'active'  -- Only count active incidents
  ) incident_counts on true
  where pl.user_id = target_user_id
  order by pl.linked_at desc;
$$;

-- T014: Function to get player ownership (for verified badge)
create or replace function public.fn_get_player_ownership(
  target_player_id text,
  target_game_id uuid
)
returns table (
  user_id uuid,
  display_name text,
  linked_at timestamptz,
  verified boolean
)
language sql
stable
security definer
as $$
  select 
    pl.user_id,
    up.display_name,
    pl.linked_at,
    pl.verified
  from public.player_links pl
  join public.user_profiles up on up.user_id = pl.user_id
  where pl.player_id = target_player_id
  and pl.game_id = target_game_id
  limit 1;
$$;

-- Comments
comment on table public.player_links is 'Links user accounts to in-game player IDs for ownership and notifications';
comment on function public.fn_get_linked_players is 'Get all player IDs linked to a user account with stats';
comment on function public.fn_get_player_ownership is 'Check if a player ID is claimed by a user (for verified badge)';
