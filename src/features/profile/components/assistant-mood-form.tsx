'use client';

import { useActionState } from 'react';

import { ASSISTANT_MOOD_OPTIONS, type AssistantMood } from '@/features/assistant/moods';
import { updateAssistantMood } from '../server/actions';
import type { AssistantMoodActionState } from '../types';

const initialState: AssistantMoodActionState = {
    message: '',
    status: 'idle',
};

type AssistantMoodFormProps = {
    assistantMood: AssistantMood;
};

export function AssistantMoodForm({ assistantMood }: AssistantMoodFormProps) {
    const [state, formAction, isPending] = useActionState(
        updateAssistantMood,
        initialState
    );

    return (
        <form action={formAction} className="flex flex-wrap items-end gap-3">
            <label className="min-w-48 flex-1 font-mono text-sm font-black uppercase text-vt-primary">
                <span>Mood</span>
                <select
                    className="mt-2 h-11 w-full rounded-md border border-vt-border bg-vt-background px-3 text-sm text-vt-text outline-none transition focus:border-vt-green"
                    defaultValue={assistantMood}
                    disabled={isPending}
                    name="assistantMood"
                >
                    {ASSISTANT_MOOD_OPTIONS.map((mood) => (
                        <option key={mood.id} value={mood.id}>
                            {mood.name}
                        </option>
                    ))}
                </select>
            </label>

            <button
                className="h-11 rounded-md bg-vt-primary px-4 font-mono text-sm font-black uppercase text-vt-ink transition hover:bg-vt-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
                type="submit"
            >
                {isPending ? 'Saving...' : 'Save mood'}
            </button>

            {state.status !== 'idle' ? (
                <p
                    className={`basis-full font-mono text-sm ${
                        state.status === 'success'
                            ? 'text-vt-green'
                            : 'text-vt-red'
                    }`}
                >
                    {state.message}
                </p>
            ) : null}
        </form>
    );
}
