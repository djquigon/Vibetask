import Link from "next/link";
import { AuthPanel } from "../_components/auth-panel";

export default function ResetPasswordPage() {
  return (
    <AuthPanel
      title="Reset password"
      description="Get a fresh link and jump back into your plan."
      primaryAction="Send reset link"
      footer={
        <Link className="font-bold text-[#ff9a56]" href="/login">
          Back to login
        </Link>
      }
    />
  );
}
