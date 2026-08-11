'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { updateActiveAssistantVoices } from '../server/actions';
import type {
    ActiveVoicesActionState,
    ProfileDetails,
} from '../types';

type VoiceOption = {
    id: string;
    name: string;
};

type ActiveVoicesFormProps = {
    activeVoiceIds: ProfileDetails['activeVoiceIds'];
    voiceOptions: VoiceOption[];
};

const initialActiveVoicesActionState: ActiveVoicesActionState = {
    message: '',
    status: 'idle',
};

export function ActiveVoicesForm({
    activeVoiceIds,
    voiceOptions,
}: ActiveVoicesFormProps) {
    const router = useRouter();
    const availableVoiceIdSet = new Set(voiceOptions.map((voice) => voice.id));
    const savedVoiceIds =
        activeVoiceIds?.filter((voiceId) => availableVoiceIdSet.has(voiceId)) ?? [];
    const initialVoiceIds = savedVoiceIds.length
        ? savedVoiceIds
        : voiceOptions.map((voice) => voice.id);
    const [selectedVoiceIds, setSelectedVoiceIds] = useState(
        () => new Set(initialVoiceIds)
    );
    const [state, formAction, isPending] = useActionState(
        updateActiveAssistantVoices,
        initialActiveVoicesActionState
    );
    const areAllVoicesSelected = voiceOptions.every((voice) =>
        selectedVoiceIds.has(voice.id)
    );

    useEffect(() => {
        if (state.status === 'success') {
            router.refresh();
        }
    }, [router, state.status]);

    function toggleVoice(voiceId: string) {
        setSelectedVoiceIds((current) => {
            const next = new Set(current);

            if (next.has(voiceId)) {
                next.delete(voiceId);
            } else {
                next.add(voiceId);
            }

            return next;
        });
    }

    function toggleAllVoices() {
        setSelectedVoiceIds(
            areAllVoicesSelected
                ? new Set()
                : new Set(voiceOptions.map((voice) => voice.id))
        );
    }

    return (
        <form action={formAction} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-vt-border pb-4">
                <p className="font-mono text-sm text-vt-text-dim">
                    {selectedVoiceIds.size} active
                </p>
                <button
                    className="font-mono text-xs font-black uppercase text-vt-green transition hover:text-vt-text disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isPending}
                    onClick={toggleAllVoices}
                    type="button"
                >
                    {areAllVoicesSelected ? 'Unselect all' : 'Select all'}
                </button>
            </div>

            <fieldset className="grid max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2" disabled={isPending}>
                <legend className="sr-only">Active assistant voices</legend>
                {voiceOptions.map((voice) => {
                    const isSelected = selectedVoiceIds.has(voice.id);

                    return (
                        <label
                            className={`flex min-w-0 items-center gap-3 rounded-md border px-3 py-2 transition ${
                                isSelected
                                    ? 'border-vt-green/50 bg-vt-green-surface text-vt-text'
                                    : 'border-vt-border bg-vt-background text-vt-text-dim hover:border-vt-amber/40'
                            }`}
                            key={voice.id}
                        >
                            <input
                                checked={isSelected}
                                className="h-4 w-4 shrink-0 accent-vt-primary"
                                name="voiceIds"
                                onChange={() => toggleVoice(voice.id)}
                                type="checkbox"
                                value={voice.id}
                            />
                            <span className="truncate font-mono text-sm font-bold uppercase">
                                {voice.name}
                            </span>
                        </label>
                    );
                })}
            </fieldset>

            {state.status !== 'idle' ? (
                <p
                    aria-live="polite"
                    className={`font-mono text-sm ${
                        state.status === 'success'
                            ? 'text-vt-green'
                            : 'text-vt-red'
                    }`}
                >
                    {state.message}
                </p>
            ) : null}

            <div className="flex justify-end border-t border-vt-border pt-4">
                <button
                    className="rounded-md bg-vt-primary px-4 py-2 font-mono text-sm font-black uppercase text-vt-ink transition hover:bg-vt-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isPending || selectedVoiceIds.size === 0}
                    type="submit"
                >
                    {isPending ? 'Saving...' : 'Save voices'}
                </button>
            </div>
        </form>
    );
}
