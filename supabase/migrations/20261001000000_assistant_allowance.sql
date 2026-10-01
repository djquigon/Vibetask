-- Durable account limits shared across application instances.
create table public.assistant_usage (
    user_id uuid not null references auth.users(id) on delete cascade,
    channel text not null check (channel in ('chat', 'voice')),
    minute_start timestamptz not null,
    minute_count integer not null,
    day_start date not null,
    day_count integer not null,
    primary key (user_id, channel)
);
alter table public.assistant_usage enable row level security;
revoke all on public.assistant_usage from anon, authenticated;

create or replace function public.consume_assistant_allowance(requested_channel text)
returns boolean
language plpgsql
security definer set search_path = ''
as $$
declare
    account_id uuid := auth.uid();
    current_minute timestamptz := date_trunc('minute', now());
    current_day date := timezone('utc', now())::date;
    consumed boolean;
begin
    if account_id is null or requested_channel not in ('chat', 'voice') or requested_channel is null then
        return false;
    end if;
    -- ON CONFLICT locks the account/channel row, preventing concurrent overspending.
    insert into public.assistant_usage as usage
        (user_id, channel, minute_start, minute_count, day_start, day_count)
    values (account_id, requested_channel, current_minute, 1, current_day, 1)
    on conflict (user_id, channel) do update
    set minute_start = current_minute,
        minute_count = case when usage.minute_start = current_minute then usage.minute_count + 1 else 1 end,
        day_start = current_day,
        day_count = case when usage.day_start = current_day then usage.day_count + 1 else 1 end
    where (usage.minute_start <> current_minute or usage.minute_count < 10)
      and (usage.day_start <> current_day or usage.day_count < 100)
    returning true into consumed;
    return coalesce(consumed, false);
end;
$$;
revoke all on function public.consume_assistant_allowance(text) from public, anon;
grant execute on function public.consume_assistant_allowance(text) to authenticated;
