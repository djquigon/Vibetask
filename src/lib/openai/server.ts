// src/lib/openai/server.ts
import 'server-only';

import OpenAI from 'openai';
import { serverEnv } from '@/lib/env/server';

if (!serverEnv.openAiApiKey) {
    throw new Error(
        'OPENAI_API_KEY is required to create the OpenAI server client.'
    );
}

export const openai = new OpenAI({
    apiKey: serverEnv.openAiApiKey,
});
