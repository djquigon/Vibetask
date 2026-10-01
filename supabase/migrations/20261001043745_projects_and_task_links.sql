create table public.projects (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    name text not null check (char_length(trim(name)) between 1 and 120),
    description text not null default '' check (char_length(description) <= 2000),
    status text not null default 'active' check (status in ('active', 'archived')),
    start_date date,
    due_date date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint projects_date_order check (start_date is null or due_date is null or start_date <= due_date),
    constraint projects_identity_owner unique (id, user_id)
);
create index projects_user_status_idx on public.projects(user_id, status, created_at desc);
alter table public.projects enable row level security;
revoke all on public.projects from anon, authenticated;
grant select, insert on public.projects to authenticated;
grant update(name, description, status, start_date, due_date) on public.projects to authenticated;
create policy "Read own projects" on public.projects for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own projects" on public.projects for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own projects" on public.projects for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create trigger set_projects_updated_at before update on public.projects for each row execute function public.set_profiles_updated_at();

alter table public.tasks add column project_id uuid;
-- Both identities must match: even a direct API request cannot link another account's project.
alter table public.tasks add constraint tasks_project_owner_fk
    foreign key (project_id, user_id) references public.projects(id, user_id);
create index tasks_project_owner_idx on public.tasks(project_id, user_id);
grant update(project_id) on public.tasks to authenticated;
