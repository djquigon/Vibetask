import Link from 'next/link';
import type { ReactNode } from 'react';

type AuthPanelMode = 'login' | 'signup' | 'reset-password' | 'update-password';

type AuthPanelProps = {
    title: string;
    description: string;
    primaryAction: string;
    mode: AuthPanelMode;
    action: (formData: FormData) => void | Promise<void>;
    footer: ReactNode;
    error?: string;
    message?: string;
    next?: string;
};

export function AuthPanel({
    title,
    description,
    primaryAction,
    mode,
    action,
    footer,
    error,
    message,
    next,
}: AuthPanelProps) {
    const needsEmail = mode !== 'update-password';
    const needsPassword = mode !== 'reset-password';
    const isNewPassword = mode === 'signup' || mode === 'update-password';

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#07110f] px-6 py-12 text-[#f8e8c0]">
            <section className="w-full max-w-md rounded-lg border border-[#f5bf76]/25 bg-[#0d1b17] p-6 shadow-2xl shadow-black/30">
                <Link
                    href="/"
                    className="font-mono text-2xl font-black uppercase text-[#ff7b39]"
                >
                    Vibetask
                </Link>
                <h1 className="mt-8 text-3xl font-black text-[#fff0c8]">
                    {title}
                </h1>
                <p className="mt-2 text-sm leading-6 text-[#d8c79f]">
                    {description}
                </p>
                {error ? (
                    <p
                        className="mt-4 border border-[#f06475]/50 bg-[#f06475]/10 px-3 py-2 text-sm text-[#ffd1d8]"
                        role="alert"
                    >
                        {error}
                    </p>
                ) : null}
                {message ? (
                    <p
                        aria-live="polite"
                        className="mt-4 border border-[#50d678]/40 bg-[#50d678]/10 px-3 py-2 text-sm text-[#c9f8d5]"
                    >
                        {message}
                    </p>
                ) : null}
                <form className="mt-6 space-y-4" action={action}>
                    {next ? <input name="next" type="hidden" value={next} /> : null}
                    {mode === 'signup' ? (
                        <label className="block">
                            <span className="text-sm font-bold text-[#f5bf76]">
                                Display name
                            </span>
                            <input
                                autoComplete="name"
                                className="mt-2 w-full rounded-md border border-[#f5bf76]/25 bg-[#08110f] px-3 py-3 text-[#fff0c8] outline-none transition placeholder:text-[#796b52] focus:border-[#50d678]"
                                name="name"
                                placeholder="How should we address you?"
                                type="text"
                            />
                        </label>
                    ) : null}
                    {needsEmail ? (
                        <label className="block">
                            <span className="text-sm font-bold text-[#f5bf76]">
                                Email
                            </span>
                            <input
                                autoComplete="email"
                                className="mt-2 w-full rounded-md border border-[#f5bf76]/25 bg-[#08110f] px-3 py-3 text-[#fff0c8] outline-none transition placeholder:text-[#796b52] focus:border-[#50d678]"
                                name="email"
                                placeholder="you@example.com"
                                required
                                type="email"
                            />
                        </label>
                    ) : null}
                    {needsPassword ? (
                        <label className="block">
                            <span className="text-sm font-bold text-[#f5bf76]">
                                {isNewPassword ? 'New password' : 'Password'}
                            </span>
                            <input
                                autoComplete={
                                    isNewPassword ? 'new-password' : 'current-password'
                                }
                                className="mt-2 w-full rounded-md border border-[#f5bf76]/25 bg-[#08110f] px-3 py-3 text-[#fff0c8] outline-none transition placeholder:text-[#796b52] focus:border-[#50d678]"
                                name="password"
                                placeholder="Password"
                                required
                                type="password"
                            />
                        </label>
                    ) : null}
                    {mode === 'update-password' ? (
                        <label className="block">
                            <span className="text-sm font-bold text-[#f5bf76]">
                                Confirm new password
                            </span>
                            <input
                                autoComplete="new-password"
                                className="mt-2 w-full rounded-md border border-[#f5bf76]/25 bg-[#08110f] px-3 py-3 text-[#fff0c8] outline-none transition placeholder:text-[#796b52] focus:border-[#50d678]"
                                name="passwordConfirmation"
                                placeholder="Repeat your new password"
                                required
                                type="password"
                            />
                        </label>
                    ) : null}
                    <button
                        className="w-full rounded-md bg-[#ff7b39] px-4 py-3 font-bold text-[#08110f] transition hover:bg-[#ff9a56]"
                        type="submit"
                    >
                        {primaryAction}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-[#d8c79f]">
                    {footer}
                </p>
            </section>
        </main>
    );
}
