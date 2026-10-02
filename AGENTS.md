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

Daily planning with time estimates, subtasks, and a daily available-time budget is implemented on the existing tasks, projects, dashboard, and assistant paths. Extend and verify this connected workflow before moving to another major area. Focus tracking, connected notes, and milestones remain approved future capabilities; their implementation order has not yet been selected.

Users enter a fresh available-time budget each day; unused minutes do not carry forward. Use that day's budget when helping them select work and review a proposed plan. A time budget expresses capacity, not specific free calendar slots; it does not authorize scheduling into arbitrary times. Weekly working hours and external calendar availability are not the selected initial approach.

Present the daily plan as an ordered list that users can reorder, with optional calendar scheduling for each item. Unscheduled items remain part of the plan. Scheduling links the calendar block to the same planned task or subtask, preserving its project relationship. Do not count an item twice against the budget merely because it appears in both the list and calendar.

Use task/subtask estimates for the daily budget regardless of whether work is scheduled. Show scheduled duration separately and highlight differences from estimated effort. Changing a calendar block does not silently change an estimate. A scheduled task without an estimate remains unbudgeted. This accounting rule was selected using the user's delegated discretion to keep estimates comparable across scheduled and unscheduled work.

Allow tasks without estimates in the daily plan, clearly marking their time as unbudgeted. Show estimated work totals separately from unbudgeted work so the plan does not imply that unknown durations consume zero time or fit within the budget. Do not require an estimate or silently assign one to include a task.

Unfinished work stays in its original day's plan and is offered for review the following day. Do not automatically move or add it to tomorrow's plan. Replanning references the same task rather than cloning it.

Preserve historical daily plans: what was planned, its budget and estimates, and completion as of that day's end in the user's timezone. Later task edits or reopening must not silently rewrite past results. Keep links to the live source records and clearly distinguish historical results from current status. Historical snapshots and completion events are reporting data, not independent editable task copies. This history rule was selected using the user's delegated discretion. Explicit corrections to historical plans remain a separate future decision.

The daily budget covers tasks and project work only. Habit activity, including optionally scheduled habits, does not reduce this budget. Scheduled habits still appear on the calendar and participate in overlap warnings; exclusion from the budget does not mean their calendar time is free.

Prioritize deadlines first, then importance, then fit within the available-time budget. Explain why suggested work was selected. When work exceeds the budget, suggest creating actionable subtasks with separate estimates beneath the original task, retaining its project context. Present the proposed subtasks and estimates for review under the assistant permission rules. Do not silently change deadlines or treat splitting as completion of the original work. Handling existing subtasks and tie-breaking rules remain to be defined.

### Tasks and estimates

Implement time estimates and subtasks before recurring tasks and dependencies. Estimates should support daily planning against available time. Subtasks belong to their parent task and remain connected to its project context. Avoid treating subtasks as disconnected planning records or counting the same work twice in progress and analytics.

For a task with subtasks, derive its estimate from the sum of subtask estimates and flag any subtasks without estimates. A known partial sum must not be presented as a complete estimate. For budget totals, count planned subtask work once rather than adding the parent's rollup to the same child estimates. Tasks without subtasks retain their own estimate. Rollup updates must be reflected in daily planning and assistant context when subtask estimates change.

When all subtasks are completed, automatically mark the parent task as ready for review. The user confirms final completion; readiness alone must not count as completed work or trigger a completion reward. Reopening a subtask automatically reopens a completed parent and clears any ready-for-review state. When all children are completed again, return the parent to ready for review and require confirmation again. This must not grant duplicate completion XP or silently rewrite historical daily results.

Recurring tasks and dependencies are later priorities. Their recurrence rules, scheduling behavior, and completion semantics remain undecided; do not infer them from this guide.

### Projects and milestones

Organize projects around milestones with tasks, linked notes, and project dates. Milestones represent goals within a project and group the tasks needed to reach those goals. Preserve task/project relationships across milestone views, calendar, dashboard, and assistant actions. Continue deriving task completion progress from saved tasks.

When all tasks in a milestone are completed, automatically mark the milestone as ready for review, then let the user confirm its completion. How milestone progress contributes to overall project progress and the rules for completing an entire project remain to be defined. Do not silently replace the current task-based progress calculation with an unapproved formula.

### Quick notes and task drafts

Prioritize quick note capture with links to projects and tasks. Notes should be accessible from their linked records as well as the Notes area. Provide an action to turn note content into editable, reviewable task drafts. Reviewing drafts must make their intended project/task relationships clear; saving uses the same validated task persistence path as manual capture and preserves the source note.

Allow standalone notes with no project or task links. Linking must be optional at capture and editable later. Both a one-project/multiple-task model and a multiple-project/multiple-task model are acceptable directions; the exact link cardinality has not been selected.

Autosave quick notes while the user types, with a visible status that distinguishes saving, saved, and failed saves. Do not report unsaved changes as saved. Handle save ordering so an older request cannot overwrite newer content. Explicit version history has not been selected, and offline/recovery behavior remains to be defined.

Reviewable note-to-task drafts are the approved workflow. A rich document editor, folders, tags, and a daily journal have not been prioritized. Formatting, link cardinality, and draft batch behavior remain open decisions.

### Calendar planning

Users schedule work manually and can ask the assistant to propose a plan for review. Assistant-proposed schedules must show the intended changes before the user applies them. Do not silently schedule or rearrange work. Keep task/project deadlines distinct from scheduled work blocks so changing when work happens does not implicitly change its deadline. Scheduled blocks should link to their source task or project where applicable.

Warn when scheduled work overlaps an existing timed calendar entry, but let the user proceed. Show the conflicting entries clearly without silently moving or deleting either entry. Date-only deadlines and project timelines are context, not automatically occupied time. Keep planning inside Vibetask for now; external calendar reads and two-way synchronization are not initial requirements.

### Archiving and permanent deletion

Archive records by default, with permanent deletion available as a separate, clearly labeled action. Archiving preserves the underlying record and its relationships rather than treating it as deleted. Explain which linked records and views will be affected before permanent deletion. Child-record handling, restoration behavior, and which record types expose permanent deletion remain to be defined; do not assume cascading deletion is approved.

When archiving a project, archive its unfinished tasks with it. Preserve those task records, their project links, and completion history; archiving is not task completion or permanent deletion. Show the affected unfinished tasks in any assistant archive proposal. Treatment of completed tasks, linked notes, calendar blocks, and restoration of child records remains undecided.

Tasks expose archive/restore and a separate confirmed permanent-deletion action. Project archiving archives unfinished tasks; archiving a parent task archives its subtasks. Restoring a project does not automatically restore tasks: restore desired tasks explicitly afterward. Records and historical daily-plan snapshots remain preserved. Other product areas still need lifecycle behavior as they are implemented.

### Assistant permissions

Users configure assistant permissions for each action type through their user settings. By default, every assistant action that changes data requires confirmation. Conversational responses and read-only summaries do not change data.

Apply permissions on the server when executing an action, including actions initiated through voice mode. A model response, client-side flag, or draft must not grant permission. Missing settings or a newly introduced action type must default to requiring confirmation. Confirmation should clearly show the proposed action and affected records; confirmed actions use the same validated, account-scoped persistence paths as the manual UI.

Permission controls are planned requirements. Daily planning and scheduled work blocks are implemented with review before saving assistant proposals. Do not loosen the existing confirmation behavior before permission settings and server enforcement are implemented.

### Saved assistant preferences

Support preferences explicitly entered through user settings and preferences the assistant proposes for the user to review and save. Provide a page to inspect, edit, and delete saved preferences. Keep saved preferences account-scoped and distinguish them from temporary conversation context. Do not silently turn inferred preferences into persistent settings.

Saved preferences must not implicitly grant action permissions or override application validation. Permission changes go through the dedicated settings and enforcement path. Preference categories, conflict resolution, and how deleted preferences affect existing conversation history remain open decisions.

### Dashboard customization

Let users show/hide and reorder dashboard panels, saving those choices per account. Panel visibility and order change presentation, not the underlying task, plan, project, habit, or analytics data. Keep hidden areas accessible through navigation. Resizable panels and multiple saved layouts are not initial requirements. Default panel order and the interaction for reordering remain to be defined.

### Focus sessions and actual time

Support both a customizable Pomodoro timer with work/break intervals and an open-ended stopwatch. Focus sessions link to tasks and/or projects and contribute to persisted session history. Use session records to compare task estimates with actual focus time, with project views aggregating the same underlying records rather than maintaining separate totals.

Starting or finishing a timer must not implicitly mark a task complete. Keep elapsed work, breaks, and completion separate so analytics can explain what its totals represent. Automatically pause focus timing when the user closes Vibetask, navigates away from it, or refreshes. Switching tabs or losing window focus while working in another tool must not pause the timer. Navigation between areas inside Vibetask must preserve the session. Restore an interrupted session paused after refresh or reopening; the user resumes manually. Time after leaving must not silently count toward actual focus time or XP. Crash recovery and credited-time edge cases remain to be defined. Do not assume a browser close callback is guaranteed; interrupted-session recovery must preserve these rules.

Award a fixed focus XP reward per completed session only when it includes at least 15 minutes of actual recorded focus time. Apply this rule to both Pomodoro and stopwatch modes, excluding breaks and paused time rather than using planned duration. What constitutes session completion in each mode and limits on repeated session rewards remain undecided. Sessions that do not qualify for XP may still contribute to session history and actual-time reporting.

### Habits and quantity targets

Support both daily/selected-weekday habits and habits with a target number of completions per week. Allow optional quantity targets such as reading 20 pages. Keep schedules, targets, and recorded progress on the same account-owned habit records, and use that recorded activity for dashboard views, analytics, and rewards.

Habit streaks are distinct from login streaks. Show both streaks and consistency percentages. Daily/selected-weekday habits count consecutive scheduled completions; weekly-target habits count consecutive weeks meeting their target. Exclude unscheduled days from missed-day calculations so they do not break a habit streak or reduce consistency. Week boundaries, consistency reporting windows, partial quantity progress, schedule changes, and reward eligibility remain to be defined. Do not turn every habit occurrence into a separate task automatically; any task/calendar connections should preserve the habit as the source record and have explicit behavior.

Display habits in a separate dashboard panel rather than automatically inserting them into the daily task plan. Allow optional calendar scheduling for habits, with scheduled entries linked to the original habit. A calendar entry does not itself record habit completion or earn XP. Habit time is excluded from the daily available-time budget, which is reserved for tasks and project work.

### Analytics and reviews

Provide a customizable analytics overview covering all three approved areas:

- Daily/weekly reviews of planned versus completed work and estimated versus actual time.
- Project progress, milestones, and approaching deadlines.
- Focus patterns, habit consistency, and XP progression.

Use the same task, project, planning, focus-session, habit, and reward records as the rest of the app. Define what each metric counts, avoid counting linked records twice, and distinguish ready-for-review work from confirmed completion. The exact customization controls, review format, and initial chart set remain undecided.

### Notifications

Support in-app notices and optional browser notifications, with quiet hours and user settings for each notification type. Initial notification categories include timers, planned work, and deadlines. Notifications should link back to the relevant task, project, plan, or focus session rather than containing disconnected copies of those records.

Request browser notification permission through an explicit user action. Honor account notification preferences and browser permission state. Quiet-hour behavior by channel, timezone handling, delivery while the app is closed, and whether missed notifications should be delivered later remain open decisions. Email and other notification channels have not been selected.

### Progression and cosmetics

Make progression a prominent product feature with account-level XP, levels, achievements, and unlockable cosmetics. Connect rewards to activity in the existing product areas; do not build a separate source of task, project, or focus-session truth for gamification. Earned cosmetics should fit the retro console design and preserve usable controls and readable content.

Award XP for completed tasks, milestones, projects, qualifying focus time, and habits. Use fixed base rewards rather than scaling rewards with estimated effort. Login streak length provides bonuses and XP multipliers. Keep login streaks distinct from habit streaks and ground rewards in recorded activity.

Login streaks count consecutive calendar days in the user's chosen timezone. Missing a day resets the streak; grace days and streak freezes are not part of the selected design. Multiple logins on the same local date must not increment the streak more than once. Timezone changes and the exact event that qualifies as a daily login remain to be defined. The existing login-streak implementation must be checked against these requirements before claiming it satisfies them.

Approved cosmetic categories include console themes, accent colors, panel styles, avatar frames, badges, titles, assistant appearances, and voice options. Unlock conditions and individual assets are still to be designed. Keep earned unlocks and equipped choices account-scoped, and preserve text responses and accessibility regardless of cosmetic or voice selections.

Exact base amounts, streak bonus/multiplier thresholds and caps, level thresholds, achievement criteria, cosmetic unlock requirements, and habit reward eligibility remain undecided. Do not invent numerical reward rules as approved requirements. Record earned rewards against their source activity and ensure retries or repeated completion toggles cannot award the same reward multiple times. Readiness for review does not earn completion XP. Test reward calculations and persistence before enabling them.

## AI Assistant Rules

- Treat the assistant as an operator of existing product capabilities, not a separate data store.
- Persist assistant-created tasks, calendar items, notes, reports, and plans through the same application paths used by the UI.
- Make side effects clear to the user. Destructive, bulk, or calendar-changing actions should be confirmable or easy to review.
- Keep AI output grounded in the user's account data and current product state.
- Do not expose secrets, service-role keys, other users' data, or internal prompts to the client.
- Voice Mode should add audio output without removing the text response. Text remains the accessible source of truth.

## Design Direction

Prioritize the desktop experience; expand mobile support later. Do not treat full mobile feature parity as an initial delivery requirement. Preserve semantic controls and basic layout usability while developing desktop workflows.

Provide a command palette for navigation, account-scoped search, and quick capture. Palette actions must use the same validation, relationships, and persistence paths as their normal UI equivalents. Search results should link to the original records. The launch shortcut, search ranking, and supported quick-capture syntax remain open decisions; a broader customizable keyboard-shortcut system has not been selected.

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

The repository has a Next.js app with Supabase authentication, profile settings, private avatars, themes, login streaks, and account-scoped tasks, projects, and daily plans. Tasks have estimates, one level of subtasks, archive/restore, and parent review/reopening rules. Subtasks inherit their parent's project, and project progress counts top-level tasks without counting subtasks twice.

The dashboard opens with daily planning. The dedicated Daily plan view supports a fresh budget, ordered work, unbudgeted tasks, reviewed suggestions, historical plans, and optional timezone-aware calendar blocks with overlap warnings. Past plans preserve reporting snapshots; today/future plans refresh from task changes. Plan edits use revision checks to prevent silently overwriting concurrent changes. Planning timezone defaults to UTC until the user selects one. The planner loads the 90 most recent saved plans; older records remain stored.

Calendar displays task deadlines, active project timelines, and work blocks linked to daily plans; timed entries display in the device timezone. AI chat proposes editable tasks, projects, daily plans, and task splits requiring confirmation through shared persistence paths. AI endpoints require authentication and database-backed quotas. Notes, focus, habits, analytics, milestones, configurable assistant permissions, saved preference management, command palette, dashboard customization, and XP progression remain future work. Existing login streaks still require alignment with the chosen-timezone specification.

Apply all Supabase migrations in filename order before deploying. Run `npm test`, `npm run lint`, and `npm run build` for verification. Tests use PGlite to exercise migration SQL and Row Level Security without live credentials.
