import Link from 'next/link';

import { AuthPanel } from '../_components/auth-panel';
import { login } from '../actions';

type LoginPageProps = {
    searchParams: Promise<{
        error?: string;
        message?: string;
        next?: string;
    }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const { error, message, next } = await searchParams;

    return (
        <AuthPanel
            title="Log in"
            description="Return to your command center."
            primaryAction="Continue"
            mode="login"
            action={login}
            error={error}
            message={message}
            next={next}
            footer={
                <>
                    <Link className="font-bold text-[#ff9a56]" href="/reset-password">
                        Forgot your password?
                    </Link>{' '}
                    | New to Vibetask?{' '}
                    <Link className="font-bold text-[#ff9a56]" href="/signup">
                        Create an account
                    </Link>
                </>
            }
        />
    );
}
