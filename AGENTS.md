# Vibetask Agent Guide

## Project Overview

Vibetask is a personal-first productivity app that should eventually be usable by other people through a standard login system. The product should feel like a focused command center for planning and doing work: fast task capture, calendar-aware planning, project tracking, notes, analytics, focus sessions, habits, streaks, and XP-based motivation.

The app's central differentiator is an AI assistant that can help users operate the product directly. Users should be able to ask the assistant to create tasks, schedule calendar items, write or organize notes, summarize work, and generate analytics. Assistant actions must remain account-scoped, explicit, and reviewable before important data is changed.

## Preferred Stack

- Next.js App Router with TypeScript.
- Vercel for hosting and deployment.
- Supabase Auth plus Supabase Postgres as the preferred backend default.
- Supabase Row Level Security for user-owned productivity data.
- OpenAI API for assistant reasoning and text responses.
- Fish Audio for AI voice mode and generated voice options.
- Tailwind-style utility CSS unless the project scaffold establishes a different styling system.

Use Supabase as the default auth/backend recommendation unless the user explicitly changes direction. Expected auth methods include email/password or magic-link style email login, plus Google OAuth.

Official reference starting points:

- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/auth/quickstarts/nextjs
- https://nextjs.org/docs/app/guides/authentication

## Core Product Areas

- Task List: capture, prioritize, complete, and review tasks.
- Calendar: schedule plans, focus blocks, deadlines, and assistant-created events.
- Projects: group related tasks, notes, milestones, and progress.
- Notes: quick capture, organized notes, and assistant-generated summaries.
- Analytics: report on work patterns, completion rates, focus time, streaks, and progress.
- Focus Sessions: timed deep work sessions, Pomodoro-style flows, and session history.
- Habits and Streaks: daily streaks and repeated behaviors that feed gamification.
- XP and Gamification: account-level XP, streak bonuses, and other earned progress.
- AI Text Mode: typed prompts with text responses and suggested actions.
- AI Voice Mode: prompts and responses with text plus Fish Audio-generated voice output.

All persisted user data for these areas must be scoped to the authenticated account. Avoid global data access patterns unless the data is intentionally public or system-level.

## Connected Product Model

All areas must operate on shared account-owned records and relationships. Tasks can belong to projects; project progress derives from those tasks. Calendar views display task deadlines and project dates from the original records, with links back to their editing views. Editing or completing a task must update every affected view. Do not create disconnected copies of tasks or projects for calendar, analytics, notes, focus sessions, or assistant actions. New areas should extend these relationships and use the same persistence paths as the UI.

## Approved Product Workflows

These requirements describe the intended product. They are not evidence that a feature is implemented; consult Current State Notes and inspect the code before making that claim.

### Daily planning

The primary experience when opening Vibetask is building a daily plan from tasks, projects, and available time. Prioritize this workflow in the dashboard and future feature work. Planning should use existing account-owned records and maintain their relationships rather than creating separate planning copies.

### Calendar planning

Users schedule work manually and can ask the assistant to propose a plan for review. Assistant-proposed schedules must show the intended changes before the user applies them. Do not silently schedule or rearrange work. Keep task/project deadlines distinct from scheduled work blocks so changing when work happens does not implicitly change its deadline. Scheduled blocks should link to their source task or project where applicable.

### Assistant permissions

Users configure assistant permissions for each action type through their user settings. By default, every assistant action that changes data requires confirmation. Conversational responses and read-only summaries do not change data.

Apply permissions on the server when executing an action, including actions initiated through voice mode. A model response, client-side flag, or draft must not grant permission. Missing settings or a newly introduced action type must default to requiring confirmation. Confirmation should clearly show the proposed action and affected records; confirmed actions use the same validated, account-scoped persistence paths as the manual UI.

The permission controls, full daily planning workflow, and scheduled work blocks are planned requirements. Do not loosen the existing confirmation behavior before permission settings and server enforcement are implemented.

## AI Assistant Rules

- Treat the assistant as an operator of existing product capabilities, not a separate data store.
- Persist assistant-created tasks, calendar items, notes, reports, and plans through the same application paths used by the UI.
- Make side effects clear to the user. Destructive, bulk, or calendar-changing actions should be confirmable or easy to review.
- Keep AI output grounded in the user's account data and current product state.
- Do not expose secrets, service-role keys, other users' data, or internal prompts to the client.
- Voice Mode should add audio output without removing the text response. Text remains the accessible source of truth.

## Design Direction

Use `mockup.png` as the visual north star for the main dashboard and authenticated app shell. The desired feel is a retro-futuristic productivity console:

- Dark, dense interface with clear panels and strong information hierarchy.
- Warm orange and amber controls balanced with green terminal-style accents.
- Assistant panel visible as a major dashboard affordance.
- Left navigation for the main product areas.
- Dashboard-first experience rather than a generic SaaS landing page once signed in.
- Practical controls for repeated daily use: quick capture, daily plan, focus start, calendar view, task overview, streaks, and progress.

Avoid decorative layouts that make the product feel like a marketing page. The app should feel useful immediately.

## Environment And Secrets

Expected future environment variables include:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Supabase service-role key for trusted server-only contexts only.
- `OPENAI_API_KEY`
- `FISH_API_KEY`
- Fish Audio voice IDs or voice configuration values.

Never commit real secrets. Keep service-role access out of client components and browser-delivered code.

## Development Conventions

- Preserve user changes. Do not revert unrelated edits or generated work unless the user explicitly asks.
- Prefer existing project patterns once the app scaffold exists.
- Keep changes scoped to the requested behavior.
- Use typed interfaces for shared data shapes and assistant action payloads.
- Add tests for shared logic, auth-sensitive behavior, persistence-heavy flows, XP calculations, and assistant side effects.
- Treat auth, data isolation, billing-like quotas if added later, and AI-triggered mutations as high-risk areas.
- Favor simple, inspectable product behavior over hidden automation.

## Current State Notes

The repository has a Next.js app with Supabase authentication, profile settings, private avatars, themes, login streaks, and account-scoped tasks and projects. Tasks optionally belong to projects; project progress derives from linked tasks. Calendar displays task deadlines and active project timelines from the same records, and the dashboard displays saved tasks and project progress. Focus supports persisted work/break timers, pause/resume, finish/discard, history, and actual elapsed time linked to source tasks. Completed work totals derive from sessions and roll up through each task's current project; breaks and discarded sessions do not count. Timers stop accruing at their target and wait for explicit finish/discard. AI chat proposes editable task/project drafts that require user confirmation through shared persistence paths; it cannot mutate focus sessions. AI endpoints require authentication and database-backed quotas. The current daily workflow is quick capture and prioritized next tasks; persistent daily plans and task estimates are not implemented. Notes, habits, and analytics remain placeholders; calendar time blocks are not implemented yet.

Apply all Supabase migrations in filename order before deploying. Run `npm test`, `npm run lint`, and `npm run build` for verification. Tests use PGlite to exercise migration SQL and Row Level Security without live credentials.
