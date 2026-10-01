const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-ts.cjs');

function harness(windowValue) {
    const states = [];
    const cleanups = [];
    let hookIndex = 0;
    const jsx = (type, props) => ({ type, props });
    const react = {
        useState: (initial) => {
            const index = hookIndex++;
            states[index] = index === 1 ? 'Help me plan' : initial;
            return [states[index], (value) => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
        },
        useRef: (value) => ({ current: value }),
        useEffect: (callback) => { const cleanup = callback(); if (cleanup) cleanups.push(cleanup); },
    };
    const component = load('src/app/(app)/dashboard/_components/assistant-chat.tsx', {
        react,
        'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
        'next/image': { default: () => null },
        '@/features/assistant/assets/backgrounds/character-bg.png': { default: { src: 'background.png' } },
        '@/features/profile/hooks/use-current-user': { useCurrentUser: () => ({ displayName: 'User' }) },
        '@/features/tasks/components/task-form': { TaskForm: () => null },
        '@/features/projects/components/project-form': { ProjectForm: () => null },
    });
    const previousWindow = global.window;
    global.window = windowValue;
    const tree = component.AssistantChat({ mode: 'voice', onModeChange() {}, onVoiceChange() {}, selectedVoiceId: 'known', voiceOptions: [{ id: 'known', name: 'Known' }] });
    function find(node, predicate) {
        if (!node || typeof node !== 'object') return null;
        if (predicate(node)) return node;
        for (const child of [node.props?.children].flat(Infinity)) {
            const found = find(child, predicate);
            if (found) return found;
        }
        return null;
    }
    return { states, find: (predicate) => find(tree, predicate), close: () => { cleanups.forEach((fn) => fn()); global.window = previousWindow; } };
}

test('voice generation failure preserves the successful text answer and task draft', async () => {
    const h = harness({});
    const previousFetch = global.fetch;
    let requests = 0;
    global.fetch = async () => {
        requests++;
        if (requests === 1) return Response.json({ assistantMessage: 'Your plan is ready.', actions: [{ id: 'draft', type: 'create_task' }] });
        throw new Error('Voice service unavailable');
    };
    try {
        await h.find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
        assert.equal(h.states[0].at(-1).content, 'Your plan is ready.');
        assert.equal(h.states[0].at(-1).actions[0].id, 'draft');
        assert.match(h.states[4], /response is shown above/);
        assert.equal(h.states[2], false);
    } finally { global.fetch = previousFetch; h.close(); }
});

test('unsupported microphone reports a usable fallback', () => {
    const h = harness({});
    try {
        h.find((node) => node.props?.['aria-label'] === 'Press to talk').props.onClick();
        assert.match(h.states[4], /unavailable in this browser/);
        assert.equal(h.states[5], false);
    } finally { h.close(); }
});

test('microphone denial stops recording without restart and unmount aborts recognition', () => {
    let instance;
    let starts = 0;
    let aborts = 0;
    class Recognition {
        constructor() {
            instance = { start() { starts++; }, stop() {}, abort() { aborts++; } };
            return instance;
        }
    }
    const h = harness({ SpeechRecognition: Recognition });
    try {
        h.find((node) => node.props?.['aria-label'] === 'Press to talk').props.onClick();
        assert.equal(h.states[5], true);
        instance.onerror({ error: 'not-allowed' });
        instance.onend();
        assert.equal(h.states[5], false);
        assert.match(h.states[4], /denied/);
        assert.equal(starts, 1);
    } finally { h.close(); }
    assert.equal(aborts, 1);
});
