'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { updateProfileDetails } from '../server/actions';
import type { ProfileDetails, ProfileDetailsActionState } from '../types';

type ProfileDetailsFormProps = {
    profile: ProfileDetails;
};

const initialProfileDetailsActionState: ProfileDetailsActionState = {
    message: '',
    status: 'idle',
};

export function ProfileDetailsForm({ profile }: ProfileDetailsFormProps) {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(
        updateProfileDetails,
        initialProfileDetailsActionState
    );
    const initial = profile.displayName?.trim().charAt(0).toUpperCase() ?? '?';

    useEffect(() => {
        if (state.status === 'success') {
            router.refresh();
        }
    }, [router, state.status]);

    return (
        <form action={formAction} className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
                <div
                    aria-label="Current profile picture"
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-vt-border-strong bg-vt-background bg-cover bg-center font-mono text-2xl font-black text-vt-gold"
                    role="img"
                    style={
                        profile.avatarUrl
                            ? { backgroundImage: `url(${profile.avatarUrl})` }
                            : undefined
                    }
                >
                    {profile.avatarUrl ? null : initial}
                </div>

                <div className="min-w-0 flex-1">
                    <label
                        className="block font-mono text-sm font-black uppercase text-vt-amber"
                        htmlFor="profile-avatar"
                    >
                        Profile picture
                    </label>
                    <input
                        accept="image/jpeg,image/png,image/webp"
                        className="mt-2 block w-full min-w-0 text-sm text-vt-text file:mr-3 file:rounded-md file:border-0 file:bg-vt-primary file:px-3 file:py-2 file:font-mono file:text-xs file:font-black file:uppercase file:text-vt-ink hover:file:bg-vt-primary-hover"
                        disabled={isPending}
                        id="profile-avatar"
                        name="avatar"
                        type="file"
                    />
                    {profile.hasAvatar ? (
                        <label className="mt-3 flex w-fit items-center gap-2 font-mono text-xs text-vt-text">
                            <input
                                className="h-4 w-4 accent-vt-primary"
                                disabled={isPending}
                                name="removeAvatar"
                                type="checkbox"
                            />
                            Remove current picture
                        </label>
                    ) : null}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <label className="block min-w-0">
                    <span className="font-mono text-sm font-black uppercase text-vt-amber">
                        Display name
                    </span>
                    <input
                        className="mt-2 h-11 w-full rounded-md border border-vt-border bg-vt-background px-3 text-sm text-vt-text outline-none transition placeholder:text-vt-text-faint focus:border-vt-green"
                        defaultValue={profile.displayName ?? ''}
                        disabled={isPending}
                        maxLength={80}
                        name="displayName"
                        type="text"
                    />
                </label>

                <label className="block min-w-0">
                    <span className="font-mono text-sm font-black uppercase text-vt-amber">
                        Email
                    </span>
                    <input
                        className="mt-2 h-11 w-full cursor-default rounded-md border border-vt-border bg-vt-surface-raised px-3 text-sm text-vt-text-dim outline-none"
                        readOnly
                        type="email"
                        value={profile.email ?? ''}
                    />
                </label>
            </div>

            <label className="block">
                <span className="font-mono text-sm font-black uppercase text-vt-amber">
                    Assistant context
                </span>
                <textarea
                    className="mt-2 min-h-36 w-full resize-y rounded-md border border-vt-border bg-vt-background p-3 text-sm leading-6 text-vt-text outline-none placeholder:text-vt-text-faint focus:border-vt-green"
                    defaultValue={profile.assistantContext ?? ''}
                    disabled={isPending}
                    maxLength={2000}
                    name="assistantContext"
                />
            </label>

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
                    disabled={isPending}
                    type="submit"
                >
                    {isPending ? 'Saving...' : 'Save changes'}
                </button>
            </div>
        </form>
    );
}
