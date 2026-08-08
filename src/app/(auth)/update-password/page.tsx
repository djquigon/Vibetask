import Link from 'next/link';

import { AuthPanel } from '../_components/auth-panel';
import { updatePassword } from '../actions';

type UpdatePasswordPageProps = {
    searchParams: Promise<{
        error?: string;
    }>;
};

export default async function UpdatePasswordPage({
    searchParams,
}: UpdatePasswordPageProps) {
    const { error } = await searchParams;

    return (
        <AuthPanel
            title="Choose a new password"
            description="Set a new password, then return to your command center."
            primaryAction="Update password"
            mode="update-password"
            action={updatePassword}
            error={error}
            footer={
                <Link className="font-bold text-[#ff9a56]" href="/login">
                    Back to login
                </Link>
            }
        />
    );
}
