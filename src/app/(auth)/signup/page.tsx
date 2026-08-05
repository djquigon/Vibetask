import Link from "next/link";
import { AuthPanel } from "../_components/auth-panel";

export default function SignupPage() {
  return (
    <AuthPanel
      title="Create account"
      description="Start building a better daily operating system."
      primaryAction="Sign up"
      footer={
        <>
          Already have an account?{" "}
          <Link className="font-bold text-[#ff9a56]" href="/login">
            Log in
          </Link>
        </>
      }
    />
  );
}
