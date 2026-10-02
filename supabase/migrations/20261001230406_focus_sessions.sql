create table public.focus_sessions (
    id uuid primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    task_id uuid references public.tasks(id) on delete set null,
    label text not null check (char_length(trim(label)) between 1 and 200),
    kind text not null check (kind in ('work', 'break')),
    planned_seconds integer not null check (planned_seconds between 60 and 10800),
    elapsed_seconds integer not null default 0 check (elapsed_seconds >= 0 and elapsed_seconds <= planned_seconds),
    status text not null default 'running' check (status in ('running', 'paused', 'completed', 'cancelled')),
    started_at timestamptz not null default clock_timestamp(),
    running_since timestamptz default clock_timestamp(),
    ended_at timestamptz,
    version integer not null default 0,
    check ((status = 'running') = (running_since is not null)),
    check ((status in ('completed', 'cancelled')) = (ended_at is not null)),
    check (kind = 'work' or task_id is null)
);
create unique index focus_one_active_per_account on public.focus_sessions(user_id) where status in ('running', 'paused');
create index focus_user_history on public.focus_sessions(user_id, started_at desc);
create index focus_task_time on public.focus_sessions(task_id, user_id) where status = 'completed' and kind = 'work';
alter table public.focus_sessions enable row level security;
revoke all on public.focus_sessions from anon, authenticated;
grant select on public.focus_sessions to authenticated;
create policy "Read own focus sessions" on public.focus_sessions for select to authenticated using ((select auth.uid()) = user_id);

-- Definer access is intentionally limited to these authenticated, owner-checked RPCs.
-- Clients cannot forge timestamps, elapsed time, ownership, or session transitions.
create function public.start_focus_session(p_id uuid, p_task_id uuid, p_label text, p_kind text, p_minutes integer)
returns public.focus_sessions language plpgsql security definer set search_path = '' as $$
declare
    owner_id uuid := auth.uid();
    existing public.focus_sessions;
    task_title text;
begin
    if owner_id is null then raise exception 'Sign in to start focus.'; end if;
    perform pg_advisory_xact_lock(hashtextextended(owner_id::text, 0));
    select * into existing from public.focus_sessions where id = p_id and user_id = owner_id;
    if found then return existing; end if;
    if p_id is null or p_kind is null or p_kind not in ('work', 'break') or p_minutes is null or p_minutes not between 1 and 180 then
        raise exception 'Invalid focus session.';
    end if;
    if exists (select 1 from public.focus_sessions where user_id = owner_id and status in ('running', 'paused')) then
        raise exception 'Finish or discard your active session first.';
    end if;
    if p_task_id is not null then
        if p_kind <> 'work' then raise exception 'Breaks cannot track task time.'; end if;
        select title into task_title from public.tasks where id = p_task_id and user_id = owner_id;
        if not found then raise exception 'Choose an available task.'; end if;
    end if;
    insert into public.focus_sessions(id, user_id, task_id, label, kind, planned_seconds)
    values (p_id, owner_id, p_task_id, coalesce(task_title, trim(p_label)), p_kind, p_minutes * 60) returning * into existing;
    return existing;
end;
$$;

create function public.transition_focus_session(p_id uuid, p_action text, p_version integer)
returns public.focus_sessions language plpgsql security definer set search_path = '' as $$
declare
    owner_id uuid := auth.uid();
    session public.focus_sessions;
    at_time timestamptz := clock_timestamp();
    elapsed integer;
begin
    if owner_id is null then raise exception 'Sign in to update focus.'; end if;
    if p_action is null or p_action not in ('pause', 'resume', 'finish', 'cancel') then raise exception 'Invalid focus action.'; end if;
    select * into session from public.focus_sessions where id = p_id and user_id = owner_id for update;
    if not found then raise exception 'Session unavailable.'; end if;
    -- Finishing twice never records extra time; conflicting terminal actions fail.
    if (session.status = 'completed' and p_action = 'finish') or (session.status = 'cancelled' and p_action = 'cancel') then return session; end if;
    if session.status in ('completed', 'cancelled') then raise exception 'Session already ended.'; end if;
    if p_version is null or p_version <> session.version then raise exception 'Session changed in another tab. Refresh and try again.'; end if;
    if (p_action = 'pause' and session.status <> 'running') or (p_action = 'resume' and session.status <> 'paused') then raise exception 'Invalid session transition.'; end if;
    elapsed := session.elapsed_seconds;
    if session.status = 'running' then
        elapsed := least(session.planned_seconds, elapsed + greatest(0, floor(extract(epoch from at_time - session.running_since)))::integer);
    end if;
    update public.focus_sessions set
        elapsed_seconds = elapsed,
        status = case p_action when 'pause' then 'paused' when 'resume' then 'running' when 'finish' then 'completed' else 'cancelled' end,
        running_since = case when p_action = 'resume' then at_time else null end,
        ended_at = case when p_action in ('finish', 'cancel') then at_time else null end,
        version = version + 1
    where id = session.id and user_id = owner_id returning * into session;
    return session;
end;
$$;
revoke all on function public.start_focus_session(uuid, uuid, text, text, integer) from public, anon, authenticated;
revoke all on function public.transition_focus_session(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.start_focus_session(uuid, uuid, text, text, integer) to authenticated;
grant execute on function public.transition_focus_session(uuid, text, integer) to authenticated;
