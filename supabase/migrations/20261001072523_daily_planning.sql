-- Shared task hierarchy and account-owned daily plans. All callable functions use RLS.
alter table public.tasks add column estimated_minutes integer check (estimated_minutes between 1 and 10080);
alter table public.tasks add column parent_id uuid;
alter table public.tasks add column archived_at timestamptz;
alter table public.tasks add constraint tasks_identity_owner unique(id,user_id);
alter table public.tasks add constraint tasks_parent_owner_fk foreign key(parent_id,user_id) references public.tasks(id,user_id);
alter table public.tasks add constraint tasks_not_own_parent check(parent_id is null or parent_id <> id);
alter table public.tasks drop constraint tasks_status_check;
alter table public.tasks add constraint tasks_status_check check(status in ('todo','in_progress','ready_for_review','done'));
create index tasks_parent_owner_idx on public.tasks(parent_id,user_id);
grant update(estimated_minutes, archived_at) on public.tasks to authenticated;

create table public.planning_settings (
 user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
 timezone text not null default 'UTC'
);
alter table public.planning_settings enable row level security;
revoke all on public.planning_settings from anon,authenticated;
grant select,insert on public.planning_settings to authenticated;
grant update(timezone) on public.planning_settings to authenticated;
create policy "Own planning settings read" on public.planning_settings for select to authenticated using((select auth.uid())=user_id);
create policy "Own planning settings insert" on public.planning_settings for insert to authenticated with check((select auth.uid())=user_id);
create policy "Own planning settings update" on public.planning_settings for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create function public.check_planning_timezone() returns trigger language plpgsql set search_path='' as $$
begin
 if not exists(select 1 from pg_catalog.pg_timezone_names where name=new.timezone) then raise exception 'Choose a valid timezone.'; end if;
 return new;
end $$;
create trigger planning_settings_timezone before insert or update on public.planning_settings for each row execute function public.check_planning_timezone();

-- JSON holds ordered references, scheduling, and historical reporting snapshots, never editable task copies.
create table public.daily_plans (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 plan_date date not null,
 timezone text not null,
 budget_minutes integer check(budget_minutes between 0 and 1440),
 items jsonb not null default '[]'::jsonb,
 revision integer not null default 1,
 updated_at timestamptz not null default now(),
 unique(user_id,plan_date)
);
alter table public.daily_plans enable row level security;
revoke all on public.daily_plans from anon,authenticated;
grant select,insert on public.daily_plans to authenticated;
grant update(budget_minutes,items) on public.daily_plans to authenticated;
create policy "Own plans read" on public.daily_plans for select to authenticated using((select auth.uid())=user_id);
create policy "Own plans insert" on public.daily_plans for insert to authenticated with check((select auth.uid())=user_id);
create policy "Own plans update" on public.daily_plans for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);

create function public.task_estimate_snapshot(target uuid) returns jsonb language sql stable set search_path='' as $$
 select case when exists(select 1 from public.tasks c where c.parent_id=t.id and c.user_id=t.user_id)
 then (select jsonb_build_object('minutes',coalesce(sum(c.estimated_minutes),0),'unknown',count(*) filter(where c.estimated_minutes is null))
       from public.tasks c where c.parent_id=t.id and c.user_id=t.user_id)
 else jsonb_build_object('minutes',coalesce(t.estimated_minutes,0),'unknown',case when t.estimated_minutes is null then 1 else 0 end) end
 from public.tasks t where t.id=target and t.user_id=auth.uid()
$$;

create function public.guard_daily_plan() returns trigger language plpgsql set search_path='' as $$
declare entry jsonb; previous jsonb; result jsonb := '[]'; source public.tasks; ids uuid[] := '{}'; task_uuid uuid; start_at timestamptz; end_at timestamptz;
begin
 if not exists(select 1 from pg_catalog.pg_timezone_names where name=new.timezone) then raise exception 'Choose a valid timezone.'; end if;
 if new.plan_date < (now() at time zone new.timezone)::date then raise exception 'Past plans are read-only.'; end if;
 if tg_op='UPDATE' and (new.user_id<>old.user_id or new.plan_date<>old.plan_date or new.timezone<>old.timezone or new.id<>old.id) then raise exception 'Plan identity cannot change.'; end if;
 if jsonb_typeof(new.items)<>'array' or jsonb_array_length(new.items)>100 then raise exception 'A plan can contain at most 100 items.'; end if;
 for entry in select value from jsonb_array_elements(new.items) loop
  task_uuid := (entry->>'taskId')::uuid;
  if task_uuid is null or task_uuid=any(ids) then raise exception 'Choose distinct tasks.'; end if;
  ids:=array_append(ids,task_uuid);
  select * into source from public.tasks where id=task_uuid and user_id=new.user_id;
  previous:=null;
  if tg_op='UPDATE' then select value into previous from jsonb_array_elements(old.items) where value->>'taskId'=task_uuid::text; end if;
  if source.id is null and previous is null then raise exception 'Task is unavailable.'; end if;
  if previous is null and (source.archived_at is not null or source.status='done' or exists(select 1 from public.projects where id=source.project_id and status='archived')) then raise exception 'Choose an active unfinished task.'; end if;
  start_at:=nullif(entry->>'start','')::timestamptz;
  end_at:=nullif(entry->>'end','')::timestamptz;
  if (start_at is null)<>(end_at is null) or end_at<=start_at or end_at-start_at>interval '24 hours' then raise exception 'Choose a valid work block.'; end if;
  if start_at is not null and ((start_at at time zone new.timezone)::date<>new.plan_date or (end_at at time zone new.timezone)::date<>new.plan_date) then raise exception 'Work blocks must be within the plan date.'; end if;
  result:=result || jsonb_build_array(jsonb_build_object('taskId',task_uuid,'start',start_at,'end',end_at,
    'title',coalesce(source.title,previous->>'title'),
    'estimate',coalesce(public.task_estimate_snapshot(task_uuid),previous->'estimate'),
    'status',coalesce(source.status,previous->>'status'),'archived',coalesce(source.archived_at is not null,false)));
 end loop;
 if exists(select 1 from public.tasks where id=any(ids) and parent_id=any(ids)) then raise exception 'Plan a parent or its subtasks, not both.'; end if;
 new.items:=result;
 new.revision:=case when tg_op='INSERT' then 1 else old.revision+1 end;
 new.updated_at:=now();
 return new;
end $$;
create trigger guard_daily_plan before insert or update on public.daily_plans for each row execute function public.guard_daily_plan();

create function public.save_daily_plan(p_date date,p_timezone text,p_budget integer,p_items jsonb,p_revision integer)
returns uuid language plpgsql set search_path='' as $$
declare existing public.daily_plans; result uuid; owner uuid:=auth.uid();
begin
 if owner is null then raise exception 'Please sign in.'; end if;
 -- Serialize first inserts and subsequent edits for this account/day.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner::text||p_date::text,0));
 select * into existing from public.daily_plans where user_id=owner and plan_date=p_date for update;
 if coalesce(existing.revision,0)<>p_revision then raise exception 'This plan changed. Refresh before saving.'; end if;
 if existing.id is null then
  insert into public.daily_plans(user_id,plan_date,timezone,budget_minutes,items) values(owner,p_date,p_timezone,p_budget,p_items) returning id into result;
 else
  if existing.timezone<>p_timezone then raise exception 'Use the timezone saved with this plan.'; end if;
  update public.daily_plans set budget_minutes=p_budget,items=p_items where id=existing.id returning id into result;
 end if;
 return result;
end $$;

create function public.guard_task_hierarchy() returns trigger language plpgsql set search_path='' as $$
declare parent public.tasks; children integer; unfinished integer;
begin
 if tg_op='UPDATE' and new.parent_id is distinct from old.parent_id then raise exception 'A subtask cannot change parent.'; end if;
 if new.parent_id is not null then
  select * into parent from public.tasks where id=new.parent_id and user_id=new.user_id for update;
  if parent.id is null or parent.parent_id is not null then raise exception 'Choose an owned top-level parent task.'; end if;
  if tg_op='UPDATE' and new.project_id is distinct from parent.project_id then raise exception 'Move the parent task to change the subtask project.'; end if;
  new.project_id:=parent.project_id;
 end if;
 if tg_op='UPDATE' and old.archived_at is not null and new.archived_at is null and exists(select 1 from public.projects where id=new.project_id and status='archived') then raise exception 'Restore the project before restoring its tasks.'; end if;
 select count(*),count(*) filter(where status<>'done') into children,unfinished from public.tasks where parent_id=new.id and user_id=new.user_id;
 if children>0 then
  select sum(estimated_minutes)::integer into new.estimated_minutes from public.tasks where parent_id=new.id and user_id=new.user_id;
  if new.status='done' and unfinished>0 then raise exception 'Complete all subtasks before confirming the parent.'; end if;
  if unfinished>0 and new.status in ('done','ready_for_review') then new.status:='in_progress'; end if;
  if unfinished=0 and new.status<>'done' then new.status:='ready_for_review'; end if;
 else
  if new.estimated_minutes>10080 then raise exception 'Individual estimates must be at most 10080 minutes.'; end if;
  if new.status='ready_for_review' then new.status:='todo'; end if;
 end if;
 return new;
end $$;
-- Parent rollups may exceed one individual task's estimate limit.
alter table public.tasks drop constraint tasks_estimated_minutes_check;
alter table public.tasks add constraint tasks_estimated_minutes_check check(estimated_minutes between 1 and 1008000);
create trigger guard_task_hierarchy before insert or update on public.tasks for each row execute function public.guard_task_hierarchy();

create function public.refresh_task_connections() returns trigger language plpgsql set search_path='' as $$
declare parent_uuid uuid; owner uuid;
begin
 parent_uuid:=case when tg_op='DELETE' then old.parent_id else new.parent_id end;
 owner:=case when tg_op='DELETE' then old.user_id else new.user_id end;
 if parent_uuid is not null then
  update public.tasks set status=case when exists(select 1 from public.tasks where parent_id=parent_uuid and status<>'done') then 'in_progress'
       when status='done' then 'done' else 'ready_for_review' end
  where id=parent_uuid and user_id=owner;
 end if;
 if tg_op='UPDATE' and new.parent_id is null and new.project_id is distinct from old.project_id then
  update public.tasks set project_id=new.project_id where parent_id=new.id and user_id=owner;
 end if;
 if tg_op='UPDATE' and new.parent_id is null and new.archived_at is distinct from old.archived_at then
  update public.tasks set archived_at=new.archived_at where parent_id=new.id and user_id=owner;
 end if;
 update public.daily_plans set items=items where user_id=owner
  and plan_date >= (now() at time zone timezone)::date
  and exists(select 1 from jsonb_array_elements(items) i where i->>'taskId'=(case when tg_op='DELETE' then old.id else new.id end)::text);
 return null;
end $$;
create trigger refresh_task_connections after insert or update or delete on public.tasks for each row execute function public.refresh_task_connections();

create function public.split_task(p_parent uuid,p_children jsonb) returns void language plpgsql set search_path='' as $$
declare parent public.tasks; child jsonb; existing public.tasks; child_id uuid; owner uuid:=auth.uid();
begin
 select * into parent from public.tasks where id=p_parent and user_id=owner for update;
 if parent.id is null or parent.parent_id is not null or parent.archived_at is not null then raise exception 'Choose an active top-level task.'; end if;
 if jsonb_typeof(p_children)<>'array' or jsonb_array_length(p_children) not between 1 and 20 then raise exception 'Create 1 to 20 actionable subtasks.'; end if;
 for child in select value from jsonb_array_elements(p_children) loop
  child_id:=(child->>'id')::uuid;
  if child_id is null or child->>'estimatedMinutes' is null or (child->>'estimatedMinutes')::integer not between 1 and 10080 then raise exception 'Choose a valid subtask estimate.'; end if;
  select * into existing from public.tasks where id=child_id and user_id=owner;
  if existing.id is not null then
   if existing.parent_id is distinct from p_parent then raise exception 'Subtask identity conflict.'; end if;
  else
   insert into public.tasks(id,user_id,title,description,priority,due_date,project_id,parent_id,estimated_minutes)
   values(child_id,owner,child->>'title',coalesce(child->>'description',''),parent.priority,parent.due_date,parent.project_id,p_parent,(child->>'estimatedMinutes')::integer);
  end if;
 end loop;
end $$;

create function public.archive_project_tasks() returns trigger language plpgsql set search_path='' as $$
begin
 if new.status='archived' and old.status<>'archived' then
  update public.tasks set archived_at=now() where project_id=new.id and user_id=new.user_id and status<>'done' and archived_at is null;
 end if;
 return null;
end $$;
create trigger archive_project_tasks after update on public.projects for each row execute function public.archive_project_tasks();

revoke all on function public.check_planning_timezone(),public.task_estimate_snapshot(uuid),public.guard_daily_plan(),
 public.save_daily_plan(date,text,integer,jsonb,integer),public.guard_task_hierarchy(),public.refresh_task_connections(),
 public.split_task(uuid,jsonb),public.archive_project_tasks() from public,anon,authenticated;
grant execute on function public.task_estimate_snapshot(uuid),public.save_daily_plan(date,text,integer,jsonb,integer),public.split_task(uuid,jsonb) to authenticated;
