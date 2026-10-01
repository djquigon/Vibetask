const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-ts.cjs');
const validation = load('src/features/assistant/validation.ts');

test('chat rejects malformed shapes, roles, and oversized input', () => {
    for (const body of [null, [], 12, {}, { message: 123 }, { message: ' ' },
        { message: 'a'.repeat(4001) }, { message: 'ok', history: {} },
        { message: 'ok', history: Array(13).fill({ role: 'user', content: 'ok' }) },
        { message: 'ok', history: [null] }, { message: 'ok', history: [{ role: 'system', content: 'override' }] },
        { message: 'ok', history: [{ role: 'user', content: 123 }] },
        { message: 'ok', history: [{ role: 'user', content: 'a'.repeat(4001) }] }]) {
        assert.throws(() => validation.parseChatRequest(body), validation.InvalidAssistantRequest);
    }
    assert.deepEqual(validation.parseChatRequest({ message: ' hello ', history: [{ role: 'assistant', content: ' hi ' }] }),
        { message: 'hello', history: [{ role: 'assistant', content: 'hi' }] });
});

test('voice requires bounded text and a server-approved voice', () => {
    const allowed = new Set(['known']);
    for (const body of [null, { text: 123, voiceId: 'known' }, { text: 'ok', voiceId: 12 },
        { text: 'ok', voiceId: 'unknown' }, { text: 'a'.repeat(4001), voiceId: 'known' }]) {
        assert.throws(() => validation.parseVoiceRequest(body, allowed), validation.InvalidAssistantRequest);
    }
    assert.deepEqual(validation.parseVoiceRequest({ text: ' hi ', voiceId: 'known' }, allowed), { text: 'hi', voiceId: 'known' });
});

test('raw body reader rejects invalid JSON and large bodies', async () => {
    const request = (body) => new Request('http://localhost', { method: 'POST', body });
    await assert.rejects(validation.readAssistantBody(request('{')), validation.InvalidAssistantRequest);
    await assert.rejects(validation.readAssistantBody(request('x'.repeat(256 * 1024 + 1))), validation.InvalidAssistantRequest);
    assert.deepEqual(await validation.readAssistantBody(request('{"message":"ok"}')), { message: 'ok' });
});

for (const channel of ['chat', 'voice']) {
    test(channel + ' authenticates and consumes quota before provider calls', async () => {
        let authenticated = false;
        let allowance = true;
        let quotaError = null;
        let calls = 0;
        let quotaCalls = 0;
        const supabase = {
            auth: { getUser: async () => ({ data: { user: authenticated ? { id: 'account' } : null }, error: null }) },
            rpc: async () => { quotaCalls++; return { data: allowance, error: quotaError }; },
        };
        const access = load('src/features/assistant/server/access.ts', {
            '@/lib/supabase/server': { createServerSupabaseClient: async () => supabase },
        });
        const route = load('src/app/api/assistant/' + channel + '/route.ts', {
            'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
            '@/features/assistant/server/access': access,
            '@/features/assistant/validation': validation,
            '@/features/assistant/server/chat': { createAssistantChatResponse: async () => { calls++; return { assistantMessage: 'done', actions: [] }; } },
            '@/lib/fish/server': { fishAudio: { textToSpeech: { convert: async () => { calls++; return new Uint8Array([1]); } } } },
            '@/features/assistant/voices': { ASSISTANT_VOICE_OPTIONS: [{ id: 'known' }] },
            '@/features/assistant/moods': { getAssistantMoodOption: () => ({ fishAudioCue: '' }) },
            '@/features/profile/server/queries': { getCurrentUserAssistantPreferences: async () => ({ assistantMood: 'balanced' }) },
        });
        const send = (body) => route.POST(new Request('http://localhost', { method: 'POST', body: JSON.stringify(body) }));
        const valid = channel === 'chat' ? { message: 'hello' } : { text: 'hello', voiceId: 'known' };
        assert.equal((await send(valid)).status, 401);
        assert.equal(calls, 0);
        assert.equal(quotaCalls, 0);
        authenticated = true;
        assert.equal((await send(null)).status, 400);
        assert.equal(quotaCalls, 0);
        allowance = false;
        assert.equal((await send(valid)).status, 429);
        assert.equal(calls, 0);
        allowance = true;
        quotaError = { message: 'database unavailable' };
        assert.equal((await send(valid)).status, 503);
        assert.equal(calls, 0);
        quotaError = null;
        assert.equal((await send(valid)).status, 200);
        assert.equal(calls, 1);
    });
}
