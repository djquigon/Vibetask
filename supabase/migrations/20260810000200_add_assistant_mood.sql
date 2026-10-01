alter table public.profiles
add column if not exists assistant_mood text not null default 'balanced';

alter table public.profiles
drop constraint if exists profiles_assistant_mood_check;

alter table public.profiles
add constraint profiles_assistant_mood_check
check (
    assistant_mood in (
        'balanced',
        'calm',
        'encouraging',
        'focused',
        'playful',
        'direct',
        'angry',
        'excited'
    )
);

grant update (assistant_mood) on table public.profiles to authenticated;
