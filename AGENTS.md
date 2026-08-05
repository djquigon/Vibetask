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
- ElevenLabs for AI voice mode and generated voice options.
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
- AI Voice Mode: prompts and responses with text plus ElevenLabs-generated voice output.

All persisted user data for these areas must be scoped to the authenticated account. Avoid global data access patterns unless the data is intentionally public or system-level.

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
- `ELEVENLABS_API_KEY`
- ElevenLabs voice IDs or voice configuration values.

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

This repository is at the initial documentation/scaffolding stage. Do not assume app source files, package manifests, database schemas, or migrations exist until you inspect the workspace.
