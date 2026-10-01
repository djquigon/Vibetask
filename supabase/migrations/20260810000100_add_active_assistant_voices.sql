alter table public.profiles
add column if not exists assistant_active_voice_ids text[];

grant update (
    display_name,
    avatar_path,
    assistant_context,
    assistant_active_voice_ids
)
on table public.profiles
to authenticated;
