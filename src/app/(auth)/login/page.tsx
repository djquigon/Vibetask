import Link from "next/link";
import { AuthPanel } from "../_components/auth-panel";

export default function LoginPage() {
  return (
    <AuthPanel
      title="Log in"
      description="Return to your command center."
      primaryAction="Continue"
      footer={
        <>
          New to Vibetask?{" "}
          <Link className="font-bold text-[#ff9a56]" href="/signup">
            Create an account
          </Link>
        </>
      }
    />
  );
}
