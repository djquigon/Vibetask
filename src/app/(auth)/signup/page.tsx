import Link from 'next/link';

import { AuthPanel } from '../_components/auth-panel';
import { signUp } from '../actions';

type SignupPageProps = {
    searchParams: Promise<{
        error?: string;
        message?: string;
        next?: string;
    }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
    const { error, message, next } = await searchParams;

    return (
        <AuthPanel
            title="Create account"
            description="Start building a better daily operating system."
            primaryAction="Sign up"
            mode="signup"
            action={signUp}
            error={error}
            message={message}
            next={next}
            footer={
                <>
                    Already have an account?{' '}
                    <Link className="font-bold text-vt-orange-hover" href="/login">
                        Log in
                    </Link>
                </>
            }
        />
    );
}
