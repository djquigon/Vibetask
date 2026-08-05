import Link from "next/link";
import type { ReactNode } from "react";

type AuthPanelProps = {
  title: string;
  description: string;
  primaryAction: string;
  footer: ReactNode;
};

export function AuthPanel({
  title,
  description,
  primaryAction,
  footer,
}: AuthPanelProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07110f] px-6 py-12 text-[#f8e8c0]">
      <section className="w-full max-w-md rounded-lg border border-[#f5bf76]/25 bg-[#0d1b17] p-6 shadow-2xl shadow-black/30">
        <Link
          href="/"
          className="font-mono text-2xl font-black uppercase text-[#ff7b39]"
        >
          Vibetask
        </Link>
        <h1 className="mt-8 text-3xl font-black text-[#fff0c8]">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#d8c79f]">{description}</p>
        <form className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-[#f5bf76]">Email</span>
            <input
              className="mt-2 w-full rounded-md border border-[#f5bf76]/25 bg-[#08110f] px-3 py-3 text-[#fff0c8] outline-none transition placeholder:text-[#796b52] focus:border-[#50d678]"
              placeholder="you@example.com"
              type="email"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-[#f5bf76]">Password</span>
            <input
              className="mt-2 w-full rounded-md border border-[#f5bf76]/25 bg-[#08110f] px-3 py-3 text-[#fff0c8] outline-none transition placeholder:text-[#796b52] focus:border-[#50d678]"
              placeholder="Password"
              type="password"
            />
          </label>
          <button
            className="w-full rounded-md bg-[#ff7b39] px-4 py-3 font-bold text-[#08110f] transition hover:bg-[#ff9a56]"
            type="button"
          >
            {primaryAction}
          </button>
          <button
            className="w-full rounded-md border border-[#f5bf76]/25 px-4 py-3 font-bold text-[#f8e8c0] transition hover:border-[#f5bf76]/60"
            type="button"
          >
            Continue with Google
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[#d8c79f]">{footer}</p>
      </section>
    </main>
  );
}
