const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-ts.cjs');
const time = load('src/features/focus/time.ts');
const validation = load('src/features/focus/validation.ts', { '@/features/tasks/validation': load('src/features/tasks/validation.ts') });
const records = load('src/features/focus/server/records.ts');
const id = '30000000-0000-0000-0000-000000000001';
const task = '10000000-0000-0000-0000-000000000001';
const draft = { id, taskId: task, label: 'Work', kind: 'work', minutes: 25 };

test('focus input validation rejects malformed IDs, durations, labels, and transitions', () => {
    assert.deepEqual(validation.parseFocusDraft(draft), draft);
    for (const input of [null, { ...draft, id: 'invalid' }, { ...draft, taskId: 'other' }, { ...draft, minutes: 0 },
        { ...draft, minutes: 181 }, { ...draft, minutes: 1.5 }, { ...draft, minutes: '25' }, { ...draft, label: ' ' },
        { ...draft, label: 'x'.repeat(201) }, { ...draft, kind: 'break' }, { ...draft, kind: 'invalid' }]) {
        assert.throws(() => validation.parseFocusDraft(input));
    }
    assert.throws(() => validation.parseTransition(id, 'delete', 0));
    assert.throws(() => validation.parseTransition(id, 'pause', -1));
});

test('timer excludes pauses, tolerates clock skew, and caps at its target', () => {
    const session = { plannedSeconds: 1500, elapsedSeconds: 120, status: 'running', runningSince: '2026-10-01T12:00:00Z' };
    assert.equal(time.elapsedSeconds(session, Date.parse('2026-10-01T12:01:00Z')), 180);
    assert.equal(time.elapsedSeconds({ ...session, status: 'paused' }, Date.parse('2026-10-01T15:00:00Z')), 120);
    assert.equal(time.elapsedSeconds(session, Date.parse('2026-10-01T11:00:00Z')), 120);
    assert.equal(time.elapsedSeconds(session, Date.parse('2026-10-01T15:00:00Z')), 1500);
    assert.equal(time.formatTime(3661), '61:01');
});

test('actual time comes only from completed work and follows linked task/project membership', () => {
    const session = { kind: 'work', status: 'completed', elapsedSeconds: 600, taskId: task };
    const sessions = [session, { ...session, taskId: 'moved', elapsedSeconds: 300 }, { ...session, taskId: null, elapsedSeconds: 60 },
        { ...session, status: 'cancelled' }, { ...session, status: 'running' }, { ...session, status: 'paused' }, { ...session, kind: 'break' }];
    assert.equal(time.actualSeconds(sessions), 960);
    assert.equal(time.actualSeconds(sessions, [task]), 600);
    assert.equal(time.actualSeconds(sessions, [task, 'moved']), 900);
    assert.equal(time.actualSeconds(sessions, []), 0);
});

test('server actions authenticate before RPC, validate, and refresh connected views', async () => {
    let authenticated = false;
    let calls = [];
    let refreshed = [];
    let failure = null;
    const row = { id, task_id: task, label: 'Work', kind: 'work', planned_seconds: 1500, elapsed_seconds: 0, status: 'running',
        started_at: '2026-10-01T12:00:00Z', running_since: '2026-10-01T12:00:00Z', ended_at: null, version: 0 };
    const actions = load('src/features/focus/server/actions.ts', {
        'next/cache': { revalidatePath: (...args) => refreshed.push(args) },
        '@/lib/supabase/server': { createServerSupabaseClient: async () => ({
            auth: { getUser: async () => ({ data: { user: authenticated ? { id: 'owner' } : null }, error: null }) },
            rpc: async (...args) => { calls.push(args); return { data: failure ? null : row, error: failure }; },
        }) },
        '../validation': validation, './records': records,
    });
    assert.equal((await actions.startFocus(draft)).status, 'error');
    assert.equal((await actions.transitionFocus(id, 'finish', 0)).status, 'error');
    assert.equal(calls.length, 0);
    authenticated = true;
    assert.equal((await actions.startFocus({ ...draft, minutes: -1 })).status, 'error');
    assert.equal(calls.length, 0);
    assert.equal((await actions.startFocus(draft)).status, 'success');
    assert.deepEqual(calls[0], ['start_focus_session', { p_id: id, p_task_id: task, p_label: 'Work', p_kind: 'work', p_minutes: 25 }]);
    assert.equal((await actions.transitionFocus(id, 'pause', 0)).status, 'success');
    assert.deepEqual(calls[1], ['transition_focus_session', { p_id: id, p_action: 'pause', p_version: 0 }]);
    assert.deepEqual(refreshed, [['/dashboard', 'layout'], ['/dashboard', 'layout']]);
    failure = { message: 'Session changed in another tab.' };
    assert.equal((await actions.transitionFocus(id, 'finish', 0)).status, 'error');
    assert.equal(refreshed.length, 2);
});

test('queries scope every page and distinguish missing storage from empty history', async () => {
    let error = { code: 'PGRST205', message: 'missing' };
    let authenticated = true;
    let ranges = [];
    let owners = [];
    const chain = { select: () => chain, eq: (_column, value) => { owners.push(value); return chain; }, order: () => chain,
        range: async (from, to) => { ranges.push([from, to]); return { error, data: from === 0 ? Array(500).fill({ id }) : [] }; } };
    const queries = load('src/features/focus/server/queries.ts', {
        '@/lib/supabase/server': { createServerSupabaseClient: async () => ({
            auth: { getUser: async () => ({ data: { user: authenticated ? { id: 'owner' } : null }, error: null }) }, from: () => chain,
        }) }, './records': { focusSession: (row) => row },
    });
    assert.deepEqual(await queries.loadFocusSessions(), { status: 'unavailable', setupRequired: true });
    error = { code: '42501', message: 'denied' };
    assert.deepEqual(await queries.loadFocusSessions(), { status: 'unavailable', setupRequired: false });
    error = null; ranges = []; owners = [];
    const result = await queries.loadFocusSessions();
    assert.equal(result.sessions.length, 500);
    assert.deepEqual(ranges, [[0, 499], [500, 999]]);
    assert.deepEqual(owners, ['owner', 'owner']);
    authenticated = false;
    await assert.rejects(queries.loadFocusSessions(), /sign in/);
});
