// src/lib/env/server.ts
import 'server-only';

export const serverEnv = {
    openAiApiKey: process.env.OPENAI_API_KEY,
    openAiModel: process.env.OPENAI_MODEL ?? 'gpt-5',
    elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
};
