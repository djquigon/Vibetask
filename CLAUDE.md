# Claude Notes For Vibetask

Read `AGENTS.md` first. It is the canonical cross-agent guide for this project; keep this file short and aligned with it.

## Project Reminder

Vibetask is a personal-first productivity app that may later support other users through login. The app is planned around Next.js App Router, TypeScript, Vercel, Supabase Auth/Postgres/RLS, OpenAI API, and ElevenLabs.

Core features include tasks, calendar, projects, notes, analytics, focus sessions, habits/streaks, account-level XP, AI Text Mode, and AI Voice Mode.

Use `mockup.png` as the visual reference for the authenticated dashboard: retro-futuristic productivity console, dark dense panels, warm orange/amber controls, green terminal accents, visible assistant panel, and a practical dashboard-first app shell.

## Claude-Specific Working Rules

- Stay aligned with `AGENTS.md`; do not introduce a conflicting stack or product direction.
- Treat Supabase Auth plus Supabase Postgres with Row Level Security as the preferred backend/auth default unless the user explicitly changes it.
- Expected auth methods are email/password or magic-link style email login, plus Google OAuth.
- Ask before changing foundational choices such as backend provider, auth model, hosting target, AI provider, or voice provider.
- Keep generated code scoped and consistent with the existing repository once the app scaffold exists.
- Treat auth, user data isolation, service-role access, AI side effects, XP calculations, and assistant-created calendar/task/note mutations as high-risk areas.
- Never commit real secrets. OpenAI, ElevenLabs, and Supabase service-role keys must stay server-only.
