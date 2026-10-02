# Vibetask

A retro console for personal productivity, built with Next.js, Supabase, OpenAI, and Fish Audio.

## Local setup

1. Install Node.js 24 or newer and run `npm ci`.
2. Copy `.env.example` to `.env.local` and supply your own keys.
3. Apply every file in `supabase/migrations` in filename order to your Supabase project.
4. Configure Supabase Auth's site URL and callback allowlist for `http://localhost:3000/auth/callback` and your production callback.
5. Enable Google in Supabase Auth and configure Google's OAuth client with Supabase's provider callback URL. Google sign-in requires this external setup.
6. Run `npm run dev`.

Server-only keys must never use a NEXT_PUBLIC prefix. The publishable Supabase key is intended for browser use.

## Checks

- `npm test`: request validation, authenticated provider access, quota failure behavior, migrations, account isolation, task/project persistence, connected calendar events, and assistant confirmations.
- `npm run lint`
- `npm run build`

Database tests use PGlite with minimal Supabase auth/storage fixtures. They execute the actual migration SQL; they do not contact a live account or provider.

## Assistant limits

Both endpoints require a verified Supabase user. Each account can make 10 requests per minute and 100 per UTC day **per endpoint**. Invalid requests do not consume allowance; provider failures after allowance consumption do. Counters are stored in Postgres and updated atomically. If the allowance migration is missing or the database check fails, provider calls are blocked with 503. Limits return 429.

Voice text is limited to 4,000 characters, and only the bundled voices are accepted. Chat history is limited to 12 messages of 4,000 characters each; raw request bodies are capped at 256 KiB. OpenAI output is capped at 1,000 tokens. Voice playback failure preserves the text answer.

## Implementation status

Authentication, profiles, private avatars, settings, themes, login streaks, and AI text/voice chat are implemented. Tasks support estimates, subtasks, priority, due dates, completion review, archive/restore, and separate confirmed deletion. Completing all subtasks marks their parent ready for review; reopening a subtask reopens its parent. Subtasks inherit project membership. Projects support dates and archiving of unfinished tasks, preserving records and completion history. Project progress counts top-level tasks rather than counting parents and children twice.

The dashboard and Daily plan view support a fresh daily time budget, estimates, visibly unbudgeted work, ordered tasks, reviewed suggestions, and optional scheduled blocks. Overlaps warn without blocking saves. Estimates count against the budget; scheduled minutes are shown separately. Unfinished work stays in its original plan and is offered for review later. Past plans preserve historical results rather than reflecting later task edits. Revision checks prevent stale edits from overwriting newer plans.

Choose a timezone in Daily plan before planning your day; the initial default is UTC. Existing plans retain their saved timezone. Work blocks use that timezone, while calendar times display in your device timezone. The planner loads the 90 most recent saved plans; older history remains stored.

The assistant receives account-scoped task, project, and planning context. It proposes editable tasks, projects, daily plans with optional scheduling, and actionable task splits. Nothing is saved until confirmed through the same validated persistence paths as manual actions. Stable task/subtask IDs make creation retries idempotent; plans use revision checks.

Calendar displays project timelines, task deadlines, and daily-plan work blocks linked to their source records. Notes, focus sessions, habits, milestones, analytics, XP progression, and the command palette remain future work.

Apply migrations before deploying the updated endpoints. No hosted database changes happen automatically during the build.

## Missing task storage

If Supabase reports `PGRST205` for `public.tasks`, apply `supabase/migrations/20261001000100_tasks.sql` in the connected project's SQL Editor. Also apply `20261001000000_assistant_allowance.sql` if it has not been applied; AI endpoints require that function. Apply only migrations not already present, in filename order. Refresh the dashboard afterward.

The dashboard and Tasks page show a recoverable setup/unavailable state until task storage is ready. They do not display zero task counts or permit capture when the query fails. Server logs retain Supabase's error code and message for diagnosis.
