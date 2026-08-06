import 'server-only';

import { FishAudioClient } from 'fish-audio';
import { serverEnv } from '@/lib/env/server';

if (!serverEnv.fishAudioApiKey) {
    throw new Error(
        'FISH_API_KEY is required to create the Fish Audio server client.'
    );
}

export const fishAudio = new FishAudioClient({
    apiKey: serverEnv.fishAudioApiKey,
});
