alter table public.profiles
add column if not exists daily_login_streak_count smallint;

alter table public.profiles
alter column daily_login_streak_count set default 0;

update public.profiles
set daily_login_streak_count = 0
where daily_login_streak_count is null;

alter table public.profiles
alter column daily_login_streak_count set not null;

alter table public.profiles
add column if not exists daily_login_streak_last_logged_in_on date;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'profiles_daily_login_streak_count_nonnegative'
    ) then
        alter table public.profiles
        add constraint profiles_daily_login_streak_count_nonnegative
        check (daily_login_streak_count >= 0);
    end if;
end;
$$;

revoke update on table public.profiles from authenticated;
grant update (display_name) on table public.profiles to authenticated;

create or replace function public.record_daily_login_streak()
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
    current_day date := timezone('utc', now())::date;
begin
    update public.profiles
    set
        daily_login_streak_count = case
            when daily_login_streak_last_logged_in_on is null then 1
            when daily_login_streak_last_logged_in_on = current_day - 1
                then least(daily_login_streak_count + 1, 32767)
            else 1
        end,
        daily_login_streak_last_logged_in_on = current_day
    where id = (select auth.uid())
      and (
          daily_login_streak_last_logged_in_on is null
          or daily_login_streak_last_logged_in_on < current_day
      );
end;
$$;

revoke all on function public.record_daily_login_streak() from public;
grant execute on function public.record_daily_login_streak() to authenticated;
