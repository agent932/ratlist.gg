-- Admin trend data: daily incident/flag counts + top reporters + top flagged categories

create or replace function public.fn_get_admin_trends()
returns jsonb
language plpgsql
security definer
stable
as $$
declare
  result jsonb;
begin
  if not public.fn_user_has_role('admin') then
    raise exception 'Admin access required';
  end if;

  select jsonb_build_object(
    'daily_incidents', (
      select jsonb_agg(
        jsonb_build_object('date', day::date, 'count', cnt)
        order by day
      )
      from (
        select
          generate_series(
            now() - interval '29 days',
            now(),
            interval '1 day'
          )::date as day
      ) days
      left join lateral (
        select count(*) as cnt
        from public.incidents
        where created_at::date = days.day
      ) inc on true
    ),
    'daily_flags', (
      select jsonb_agg(
        jsonb_build_object('date', day::date, 'count', cnt)
        order by day
      )
      from (
        select
          generate_series(
            now() - interval '29 days',
            now(),
            interval '1 day'
          )::date as day
      ) days
      left join lateral (
        select count(*) as cnt
        from public.flags
        where created_at::date = days.day
      ) fl on true
    ),
    'top_reporters', (
      select jsonb_agg(row)
      from (
        select jsonb_build_object(
          'user_id', i.reporter_user_id,
          'display_name', coalesce(up.display_name, 'Unknown'),
          'count', count(*)
        ) as row
        from public.incidents i
        left join public.user_profiles up on up.user_id = i.reporter_user_id
        where i.created_at >= now() - interval '30 days'
          and i.reporter_user_id is not null
        group by i.reporter_user_id, up.display_name
        order by count(*) desc
        limit 5
      ) t
    ),
    'top_flagged_categories', (
      select jsonb_agg(row)
      from (
        select jsonb_build_object(
          'category', coalesce(ic.label, 'Unknown'),
          'flag_count', count(f.id),
          'incident_count', count(distinct i.id)
        ) as row
        from public.flags f
        join public.incidents i on i.id = f.incident_id
        left join public.incident_categories ic on ic.id = i.category_id
        where f.created_at >= now() - interval '30 days'
        group by ic.label
        order by count(f.id) desc
        limit 5
      ) t
    )
  ) into result;

  return result;
end;
$$;
