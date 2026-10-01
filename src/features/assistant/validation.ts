import type { AssistantChatMessage, AssistantChatRequest, AssistantVoiceRequest } from './types';

export class InvalidAssistantRequest extends Error {}

function record(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new InvalidAssistantRequest('Request body must be an object.');
    }
    return value as Record<string, unknown>;
}

function text(value: unknown, field: string, limit: number): string {
    if (typeof value !== 'string' || !value.trim()) {
        throw new InvalidAssistantRequest(`${field} must be nonempty text.`);
    }
    const result = value.trim();
    if (result.length > limit) {
        throw new InvalidAssistantRequest(`${field} must be ${limit} characters or fewer.`);
    }
    return result;
}

export function parseChatRequest(value: unknown): AssistantChatRequest {
    const body = record(value);
    const message = text(body.message, 'Message', 4000);
    if (body.history !== undefined && (!Array.isArray(body.history) || body.history.length > 12)) {
        throw new InvalidAssistantRequest('History must contain at most 12 messages.');
    }
    const history = ((body.history ?? []) as unknown[]).map((value): AssistantChatMessage => {
        const item = record(value);
        if (item.role !== 'user' && item.role !== 'assistant') {
            throw new InvalidAssistantRequest('History roles must be user or assistant.');
        }
        return { role: item.role, content: text(item.content, 'History message', 4000) };
    });
    return { message, history };
}

export function parseVoiceRequest(value: unknown, allowedVoiceIds: ReadonlySet<string>): AssistantVoiceRequest {
    const body = record(value);
    const result = { text: text(body.text, 'Text', 4000), voiceId: text(body.voiceId, 'Voice ID', 100) };
    if (!allowedVoiceIds.has(result.voiceId)) {
        throw new InvalidAssistantRequest('Choose an available voice.');
    }
    return result;
}

// Bound the raw body before parsing as well as validating individual fields.
export async function readAssistantBody(request: Request): Promise<unknown> {
    const reader = request.body?.getReader();
    if (!reader) throw new InvalidAssistantRequest('Request body is required.');
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > 256 * 1024) {
                await reader.cancel();
                throw new InvalidAssistantRequest('Request body is too large.');
            }
            chunks.push(value);
        }
        const bytes = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
        try { return JSON.parse(new TextDecoder().decode(bytes)); }
        catch { throw new InvalidAssistantRequest('Request body must be valid JSON.'); }
    } finally { reader.releaseLock(); }
}
