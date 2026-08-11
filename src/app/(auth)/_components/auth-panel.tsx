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
        <main className="flex min-h-screen items-center justify-center bg-vt-background-deep px-6 py-12 text-vt-text">
            <section className="w-full max-w-md rounded-lg border border-vt-amber/25 bg-vt-surface p-6 shadow-2xl shadow-black/30">
                <Link
                    href="/"
                    className="font-mono text-2xl font-black uppercase text-vt-orange"
                >
                    Vibetask
                </Link>
                <h1 className="mt-8 text-3xl font-black text-vt-text-strong">
                    {title}
                </h1>
                <p className="mt-2 text-sm leading-6 text-vt-text-muted">
                    {description}
                </p>
                {error ? (
                    <p
                        className="mt-4 border border-vt-red-bright/50 bg-vt-red-bright/10 px-3 py-2 text-sm text-vt-red-text"
                        role="alert"
                    >
                        {error}
                    </p>
                ) : null}
                {message ? (
                    <p
                        aria-live="polite"
                        className="mt-4 border border-vt-green/40 bg-vt-green/10 px-3 py-2 text-sm text-vt-green-text"
                    >
                        {message}
                    </p>
                ) : null}
                <form className="mt-6 space-y-4" action={action}>
                    {next ? <input name="next" type="hidden" value={next} /> : null}
                    {mode === 'signup' ? (
                        <label className="block">
                            <span className="text-sm font-bold text-vt-amber">
                                Display name
                            </span>
                            <input
                                autoComplete="name"
                                className="mt-2 w-full rounded-md border border-vt-amber/25 bg-vt-background px-3 py-3 text-vt-text-strong outline-none transition placeholder:text-vt-text-faint focus:border-vt-green"
                                name="name"
                                placeholder="How should we address you?"
                                type="text"
                            />
                        </label>
                    ) : null}
                    {needsEmail ? (
                        <label className="block">
                            <span className="text-sm font-bold text-vt-amber">
                                Email
                            </span>
                            <input
                                autoComplete="email"
                                className="mt-2 w-full rounded-md border border-vt-amber/25 bg-vt-background px-3 py-3 text-vt-text-strong outline-none transition placeholder:text-vt-text-faint focus:border-vt-green"
                                name="email"
                                placeholder="you@example.com"
                                required
                                type="email"
                            />
                        </label>
                    ) : null}
                    {needsPassword ? (
                        <label className="block">
                            <span className="text-sm font-bold text-vt-amber">
                                {isNewPassword ? 'New password' : 'Password'}
                            </span>
                            <input
                                autoComplete={
                                    isNewPassword ? 'new-password' : 'current-password'
                                }
                                className="mt-2 w-full rounded-md border border-vt-amber/25 bg-vt-background px-3 py-3 text-vt-text-strong outline-none transition placeholder:text-vt-text-faint focus:border-vt-green"
                                name="password"
                                placeholder="Password"
                                required
                                type="password"
                            />
                        </label>
                    ) : null}
                    {mode === 'update-password' ? (
                        <label className="block">
                            <span className="text-sm font-bold text-vt-amber">
                                Confirm new password
                            </span>
                            <input
                                autoComplete="new-password"
                                className="mt-2 w-full rounded-md border border-vt-amber/25 bg-vt-background px-3 py-3 text-vt-text-strong outline-none transition placeholder:text-vt-text-faint focus:border-vt-green"
                                name="passwordConfirmation"
                                placeholder="Repeat your new password"
                                required
                                type="password"
                            />
                        </label>
                    ) : null}
                    <button
                        className="w-full rounded-md bg-vt-orange px-4 py-3 font-bold text-vt-ink transition hover:bg-vt-orange-hover"
                        type="submit"
                    >
                        {primaryAction}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-vt-text-muted">
                    {footer}
                </p>
            </section>
        </main>
    );
}
