const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-ts.cjs');
const time = load('src/features/focus/time.ts');

function harness(props, actions = {}) {
    const values = [];
    const refs = [];
    let stateIndex = 0;
    let refIndex = 0;
    let refreshes = 0;
    let tree;
    const effects = [];
    const pending = [];
    const intervals = [];
    const listeners = {};
    const jsx = (type, props) => ({ type, props });
    const router = { refresh: () => refreshes++ };
    const react = {
        useState(initial) {
            const index = stateIndex++;
            if (!(index in values)) values[index] = initial;
            return [values[index], (value) => { values[index] = value; }];
        },
        useRef(initial) { const index = refIndex++; refs[index] ??= { current: initial }; return refs[index]; },
        useTransition: () => [false, (callback) => pending.push(callback())],
        useEffect: (callback) => { if (!effects.length) effects.push(callback()); },
    };
    const previousWindow = global.window;
    global.window = { setInterval: (fn) => { intervals.push(fn); return intervals.length; }, clearInterval() {},
        addEventListener: (name, fn) => { listeners[name] = fn; }, removeEventListener: (name) => { delete listeners[name]; } };
    const component = load('src/features/focus/components/focus-console.tsx', {
        react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'next/link': { default: 'link' },
        'next/navigation': { useRouter: () => router }, '../time': time,
        '../server/actions': { startFocus: actions.startFocus ?? (async () => ({ status: 'success' })),
            transitionFocus: actions.transitionFocus ?? (async () => ({ status: 'success' })) },
    });
    function render(next = props) { props = next; stateIndex = refIndex = 0; tree = component.FocusConsole(props); }
    function find(node, predicate) {
        if (!node || typeof node !== 'object') return null;
        if (predicate(node)) return node;
        for (const child of [node.props?.children].flat(Infinity)) { const found = find(child, predicate); if (found) return found; }
        return null;
    }
    render();
    return { render, find: (predicate) => find(tree, predicate), flush: () => Promise.all(pending.splice(0)),
        refreshes: () => refreshes, intervals, listeners,
        close() { effects.forEach((cleanup) => cleanup?.()); global.window = previousWindow; } };
}

const taskId = '10000000-0000-0000-0000-000000000001';
const task = { id: taskId, title: 'Write proposal', status: 'todo' };
const session = { id: '30000000-0000-0000-0000-000000000001', taskId, label: task.title, kind: 'work',
    status: 'paused', plannedSeconds: 1500, elapsedSeconds: 120, runningSince: null, startedAt: '2026-10-01T12:00:00Z', version: 4 };

test('task deep link preselects source and interrupted starts retry the same session ID', async () => {
    const calls = [];
    const h = harness({ sessions: [], tasks: [task], initialTaskId: taskId }, { startFocus: async (draft) => {
        calls.push(draft); if (calls.length === 1) throw new Error('network interrupted'); return { status: 'success' };
    } });
    try {
        assert.ok(h.find((node) => node.type === 'select' && node.props.value === taskId));
        h.find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
        await h.flush(); h.render();
        assert.match(h.find((node) => node.props?.role === 'status').props.children, /Connection interrupted/);
        h.find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
        await h.flush();
        assert.equal(calls[0].id, calls[1].id);
        assert.equal(calls[0].taskId, taskId);
        assert.equal(calls[0].label, task.title);
        assert.equal(calls[0].minutes, 25);
    } finally { h.close(); }
});

test('reload restores paused timer, transitions carry version, and discard needs confirmation', async () => {
    const calls = [];
    const h = harness({ sessions: [session], tasks: [task] }, { transitionFocus: async (...args) => { calls.push(args); return { status: 'success' }; } });
    try {
        assert.equal(h.find((node) => node.props?.role === 'timer').props.children, '23:00');
        h.find((node) => node.type === 'button' && node.props.children === 'Resume').props.onClick();
        await h.flush();
        assert.deepEqual(calls[0], [session.id, 'resume', 4]);
        h.find((node) => node.type === 'button' && node.props.children === 'Discard').props.onClick();
        assert.equal(calls.length, 1);
        h.render();
        h.find((node) => node.type === 'button' && node.props.children === 'Confirm discard').props.onClick();
        await h.flush();
        assert.deepEqual(calls[1], [session.id, 'cancel', 4]);
        h.listeners.focus();
        h.intervals[1]();
        assert.equal(h.refreshes(), 4);
    } finally { h.close(); }
});

test('expired timer waits for explicit finish and cannot resume beyond target', async () => {
    const calls = [];
    const h = harness({ sessions: [{ ...session, elapsedSeconds: 1500 }], tasks: [task] }, {
        transitionFocus: async (...args) => { calls.push(args); return { status: 'success' }; },
    });
    try {
        assert.equal(h.find((node) => node.props?.role === 'timer').props.children, '0:00');
        assert.equal(h.find((node) => node.type === 'button' && node.props.children === 'Resume'), null);
        assert.equal(calls.length, 0);
        h.find((node) => node.type === 'button' && Array.isArray(node.props.children) && node.props.children[0] === 'Finish & save ').props.onClick();
        await h.flush();
        assert.deepEqual(calls[0], [session.id, 'finish', 4]);
    } finally { h.close(); }
});

test('discard confirmation is bound to its original session when another tab changes the active session', () => {
    const h = harness({ sessions: [session], tasks: [task] });
    try {
        h.find((node) => node.type === 'button' && node.props.children === 'Discard').props.onClick();
        h.render();
        assert.ok(h.find((node) => node.type === 'button' && node.props.children === 'Confirm discard'));
        h.render({ sessions: [{ ...session, id: '30000000-0000-0000-0000-000000000002' }], tasks: [task] });
        assert.equal(h.find((node) => node.type === 'button' && node.props.children === 'Confirm discard'), null);
    } finally { h.close(); }
});
