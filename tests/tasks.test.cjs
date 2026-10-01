const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-ts.cjs');
const validation = load('src/features/tasks/validation.ts');

test('missing task storage returns setup state while query failures never become empty task lists', async () => {
    let queryError = { code: 'PGRST205', message: 'Missing public.tasks' };
    let authenticated = true;
    const chain = {
        select: () => chain,
        eq: () => chain,
        order: async () => ({ data: [], error: queryError }),
    };
    const queries = load('src/features/tasks/server/queries.ts', {
        '@/lib/supabase/server': { createServerSupabaseClient: async () => ({
            auth: { getUser: async () => ({ data: { user: authenticated ? { id: 'account' } : null }, error: null }) },
            from: () => chain,
        }) },
    });
    assert.deepEqual(await queries.loadTasksForPage(), { status: 'unavailable', setupRequired: true });
    await assert.rejects(queries.listTasks(), /Unable to load/);
    queryError = { code: '42501', message: 'Permission denied' };
    assert.deepEqual(await queries.loadTasksForPage(), { status: 'unavailable', setupRequired: false });
    queryError = null;
    assert.deepEqual(await queries.loadTasksForPage(), { status: 'ready', tasks: [] });
    authenticated = false;
    await assert.rejects(queries.loadTasksForPage(), /sign in/);
});

for (const page of ['src/app/(app)/dashboard/page.tsx', 'src/app/(app)/dashboard/tasks/page.tsx']) {
    test(page + ' renders a recoverable state when task storage is missing', async () => {
        const notice = () => null;
        const dependencies = {
            'react/jsx-runtime': { jsx: (type, props) => ({ type, props }) },
            '@/features/tasks/server/queries': { loadTasksForPage: async () => ({ status: 'unavailable', setupRequired: true }) },
            '@/features/tasks/components/task-load-notice': { TaskLoadNotice: notice },
            '@/features/dashboard/components/dashboard-overview': { DashboardOverview: () => null },
            '@/features/tasks/components/tasks-view': { TasksView: () => null },
            '@/features/projects/server/queries': { listProjects: async () => [] },
        };
        const result = await load(page, dependencies).default();
        assert.equal(result.type, notice);
        assert.equal(result.props.setupRequired, true);
    });
}

test('task drafts validate dates, priorities, titles, statuses, and IDs', () => {
    const draft = { title: ' Work ', description: '', priority: 'high', dueDate: '2026-10-01' };
    assert.equal(validation.parseTaskDraft(draft).title, 'Work');
    for (const value of [null, { ...draft, title: '' }, { ...draft, title: 'x'.repeat(201) },
        { ...draft, description: 'x'.repeat(2001) }, { ...draft, priority: 'urgent' },
        { ...draft, dueDate: '2026-02-30' }, { ...draft, dueDate: 'tomorrow' }]) {
        assert.throws(() => validation.parseTaskDraft(value));
    }
    assert.throws(() => validation.taskStatus('overdue'));
    assert.throws(() => validation.taskId('other'));
});

for (const storageReady of [true, false]) {
test('assistant handles task storage readiness ' + storageReady + ' without performing mutations', async () => {
    let options;
    const chat = load('src/features/assistant/server/chat.ts', {
        'node:crypto': require('node:crypto'),
        '@/lib/openai/server': { openai: { responses: { create: async (input) => {
            options = input;
            return { output_text: storageReady ? '' : 'Task storage is unavailable.', output: [{ type: 'function_call', name: 'propose_task',
                arguments: JSON.stringify({ title: 'Write proposal', description: '', priority: 'high', dueDate: null }) }] };
        } } } },
        '@/lib/env/server': { serverEnv: { openAiModel: 'configured-model' } },
        '@/features/assistant/moods': { getAssistantMoodOption: () => ({ name: 'Balanced', openAiInstructions: '' }) },
        '@/features/profile/server/queries': { getCurrentUserAssistantPreferences: async () => ({ assistantContext: null, assistantMood: 'balanced' }) },
        '@/features/tasks/server/queries': { loadTasksForPage: async () => storageReady
            ? ({ status: 'ready', tasks: [{ title: 'Existing task', description: '', status: 'todo', priority: 'normal', dueDate: null }] })
            : ({ status: 'unavailable', setupRequired: true }) },
        '@/features/tasks/validation': validation,
        '@/features/projects/server/queries': { listProjects: async () => [] },
        '@/features/projects/validation': load('src/features/projects/validation.ts'),
    });
    const result = await chat.createAssistantChatResponse('Create a task to write a proposal');
    if (!storageReady) {
        assert.equal(result.actions.length, 0);
        assert.deepEqual(options.tools, []);
        assert.match(options.instructions, /Task storage is currently unavailable/);
        assert.doesNotMatch(options.input[0].content, /"total":0/);
        return;
    }
    assert.equal(result.actions.length, 1);
    assert.equal(result.actions[0].requiresConfirmation, true);
    assert.equal(result.actions[0].draft.title, 'Write proposal');
    assert.equal(validation.taskId(result.actions[0].id), result.actions[0].id);
    assert.match(options.input[0].content, /Existing task/);
    assert.equal(options.parallel_tool_calls, false);
    assert.equal(options.tools[0].strict, true);
});
}

test('task mutations authenticate, scope updates, and validate before writes', async () => {
    const id = '10000000-0000-0000-0000-000000000001';
    const draft = { title: 'Write proposal', description: '', priority: 'high', dueDate: null };
    let authenticated = false;
    const calls = [];
    const chain = {
        upsert: (row, options) => { calls.push(['upsert', row, options]); return chain; },
        update: (row) => { calls.push(['update', row]); return chain; },
        delete: () => { calls.push(['delete']); return chain; },
        select: () => chain,
        eq: (key, value) => { calls.push(['eq', key, value]); return chain; },
        maybeSingle: async () => ({ data: { id }, error: null }),
        then: (resolve) => Promise.resolve({ error: null }).then(resolve),
    };
    const mutations = load('src/features/tasks/server/mutations.ts', {
        '@/lib/supabase/server': { createServerSupabaseClient: async () => ({
            auth: { getUser: async () => ({ data: { user: authenticated ? { id: 'current-account' } : null }, error: null }) },
            from: () => chain,
        }) },
        '../validation': validation,
    });
    await assert.rejects(mutations.saveTask(id, draft), /sign in/i);
    assert.equal(calls.length, 0);
    authenticated = true;
    await mutations.saveTask(id, draft);
    assert.equal(calls[0][1].user_id, 'current-account');
    assert.equal(calls[0][2].ignoreDuplicates, true);
    calls.length = 0;
    await mutations.setTaskStatus(id, 'done');
    assert.ok(calls.some((call) => call[0] === 'eq' && call[1] === 'user_id' && call[2] === 'current-account'));
    calls.length = 0;
    await assert.rejects(mutations.setTaskStatus(id, 'invalid'));
    assert.equal(calls.length, 0);
    await mutations.removeTask(id);
    assert.ok(calls.some((call) => call[0] === 'eq' && call[1] === 'user_id' && call[2] === 'current-account'));
    calls.length = 0;
    await mutations.setTaskProject(id, '20000000-0000-0000-0000-000000000001');
    assert.deepEqual(calls[0][1], { project_id: '20000000-0000-0000-0000-000000000001' });
    assert.ok(calls.some((call) => call[0] === 'eq' && call[1] === 'user_id' && call[2] === 'current-account'));
});
