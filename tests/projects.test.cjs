const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-ts.cjs');
const validation = load('src/features/projects/validation.ts');
const taskValidation = load('src/features/tasks/validation.ts');
const { projectProgress } = load('src/features/projects/progress.ts');
const { connectedCalendarEvents } = load('src/features/calendar/events.ts');

const project = { id: '20000000-0000-0000-0000-000000000001', userId: 'account', name: 'Video', description: '',
    status: 'active', startDate: '2026-10-01', dueDate: '2026-10-03', createdAt: '', updatedAt: '' };
const task = { id: '10000000-0000-0000-0000-000000000001', userId: 'account', title: 'Write script', description: '',
    status: 'todo', priority: 'normal', dueDate: '2026-10-02', projectId: project.id, createdAt: '', updatedAt: '' };

test('project drafts reject invalid dates, reversed ranges, and invalid IDs', () => {
    assert.equal(validation.parseProjectDraft({ ...project, name: ' Video ' }).name, 'Video');
    for (const draft of [null, { ...project, name: '' }, { ...project, name: 'x'.repeat(121) },
        { ...project, description: 'x'.repeat(2001) }, { ...project, startDate: '2026-02-30' },
        { ...project, dueDate: '2026-09-30' }]) assert.throws(() => validation.parseProjectDraft(draft));
    assert.throws(() => validation.projectId('foreign'));
    assert.throws(() => taskValidation.parseTaskDraft({ ...task, projectId: 'invalid' }));
});

test('task completion and reassignment change derived project progress', () => {
    const other = { ...task, id: 'other', status: 'done' };
    assert.deepEqual(projectProgress(project.id, [task, other]), { total: 2, completed: 1, percent: 50 });
    assert.deepEqual(projectProgress(project.id, [{ ...task, status: 'done' }, other]), { total: 2, completed: 2, percent: 100 });
    assert.deepEqual(projectProgress(project.id, [{ ...task, projectId: null }, other]), { total: 1, completed: 1, percent: 100 });
    assert.deepEqual(projectProgress('empty', [task]), { total: 0, completed: 0, percent: 0 });
});

test('calendar derives timelines and deadlines from shared source records', () => {
    const events = connectedCalendarEvents([project], [task]);
    assert.equal(events.length, 2);
    assert.equal(events[0].start, '2026-10-01');
    assert.equal(events[0].end, '2026-10-04'); // inclusive due date, exclusive calendar end
    assert.equal(events[0].url, '/dashboard/projects/' + project.id);
    assert.equal(events[1].start, task.dueDate);
    assert.match(events[1].title, /Write script.*Video/);
    assert.equal(events[1].extendedProps.projectId, project.id);
    assert.equal(events[1].url, '/dashboard/tasks#task-' + task.id);
    const updated = connectedCalendarEvents([{ ...project, name: 'Renamed', dueDate: '2026-12-31' }], [{ ...task, dueDate: '2026-11-01' }]);
    assert.equal(updated[0].end, '2027-01-01');
    assert.equal(updated[1].start, '2026-11-01');
    assert.match(updated[1].title, /Renamed/);
    assert.equal(connectedCalendarEvents([{ ...project, status: 'archived' }], [task]).length, 1);
    assert.equal(connectedCalendarEvents([project], [{ ...task, status: 'done' }]).length, 1);
    assert.equal(connectedCalendarEvents([project], [{ ...task, status: 'done' }], true).length, 2);
    assert.equal(connectedCalendarEvents([{ ...project, startDate: null, dueDate: null }], [{ ...task, dueDate: null }]).length, 0);
});

test('project mutations require authentication and scope updates to the current account', async () => {
    let authenticated = false;
    const calls = [];
    const chain = {
        upsert: (row, options) => { calls.push(['upsert', row, options]); return chain; },
        update: (row) => { calls.push(['update', row]); return chain; },
        select: () => chain,
        eq: (key, value) => { calls.push(['eq', key, value]); return chain; },
        maybeSingle: async () => ({ data: { id: project.id }, error: null }),
        then: (resolve) => Promise.resolve({ error: null }).then(resolve),
    };
    const mutations = load('src/features/projects/server/mutations.ts', {
        '@/lib/supabase/server': { createServerSupabaseClient: async () => ({
            auth: { getUser: async () => ({ data: { user: authenticated ? { id: 'account' } : null }, error: null }) },
            from: () => chain,
        }) }, '../validation': validation,
    });
    await assert.rejects(mutations.saveProject(project.id, project), /sign in/);
    assert.equal(calls.length, 0);
    authenticated = true;
    await mutations.saveProject(project.id, project);
    assert.equal(calls[0][1].user_id, 'account');
    assert.equal(calls[0][2].ignoreDuplicates, true);
    calls.length = 0;
    await mutations.editProject(project.id, project);
    assert.ok(calls.some((call) => call[0] === 'eq' && call[1] === 'user_id' && call[2] === 'account'));
    calls.length = 0;
    await mutations.setProjectStatus(project.id, 'archived');
    assert.equal(calls[0][1].status, 'archived');
    assert.ok(calls.some((call) => call[0] === 'eq' && call[1] === 'user_id' && call[2] === 'account'));
    calls.length = 0;
    await assert.rejects(mutations.setProjectStatus(project.id, 'deleted'));
    assert.equal(calls.length, 0);
});

test('assistant proposes connected tasks and projects but never persists them', async () => {
    let output;
    let options;
    const chat = load('src/features/assistant/server/chat.ts', {
        'node:crypto': require('node:crypto'),
        '@/lib/openai/server': { openai: { responses: { create: async (input) => { options = input; return { output_text: '', output }; } } } },
        '@/lib/env/server': { serverEnv: { openAiModel: 'configured-model' } },
        '@/features/assistant/moods': { getAssistantMoodOption: () => ({ name: 'Balanced', openAiInstructions: '' }) },
        '@/features/profile/server/queries': { getCurrentUserAssistantPreferences: async () => ({ assistantContext: null, assistantMood: 'balanced' }) },
        '@/features/tasks/server/queries': { loadTasksForPage: async () => ({ status: 'ready', tasks: [task] }) },
        '@/features/projects/server/queries': { listProjects: async () => [project] },
        '@/features/projects/validation': validation,
        '@/features/tasks/validation': taskValidation,
    });
    output = [{ type: 'function_call', name: 'propose_project', arguments: JSON.stringify(project) }];
    const projectResult = await chat.createAssistantChatResponse('Create a video project');
    assert.equal(projectResult.actions[0].type, 'create_project');
    assert.equal(projectResult.actions[0].requiresConfirmation, true);
    assert.match(options.input[0].content, /taskCount.*completedTaskCount/);
    output = [{ type: 'function_call', name: 'propose_task', arguments: JSON.stringify(task) }];
    const taskResult = await chat.createAssistantChatResponse('Add a task to Video');
    assert.equal(taskResult.actions[0].draft.projectId, project.id);
    assert.equal(taskResult.actions[0].projects[0].id, project.id);
    assert.equal(taskResult.actions[0].requiresConfirmation, true);
    output = [{ type: 'function_call', name: 'propose_task', arguments: JSON.stringify({ ...task, projectId: '20000000-0000-0000-0000-000000000002' }) }];
    await assert.rejects(chat.createAssistantChatResponse('Add a task'), /unavailable project/);
});
