import Link from 'next/link';

import { AuthPanel } from '../_components/auth-panel';
import { requestPasswordReset } from '../actions';

type ResetPasswordPageProps = {
    searchParams: Promise<{
        error?: string;
        message?: string;
    }>;
};

export default async function ResetPasswordPage({
    searchParams,
}: ResetPasswordPageProps) {
    const { error, message } = await searchParams;

    return (
        <AuthPanel
            title="Reset password"
            description="Get a fresh link and jump back into your plan."
            primaryAction="Send reset link"
            mode="reset-password"
            action={requestPasswordReset}
            error={error}
            message={message}
            footer={
                <Link className="font-bold text-vt-primary-hover" href="/login">
                    Back to login
                </Link>
            }
        />
    );
}
