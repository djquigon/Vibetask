import Link from "next/link";

export function Hero() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-84px)] w-full max-w-7xl items-center gap-12 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="max-w-3xl">
        <p className="mb-5 font-mono text-sm font-bold uppercase tracking-[0.18em] text-[#50d678]">
          AI productivity command center
        </p>
        <h1 className="text-5xl font-black leading-[0.95] tracking-normal text-[#fff0c8] sm:text-6xl lg:text-7xl">
          Vibetask plans the day while you stay in motion.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#d8c79f]">
          A retro-futuristic workspace for tasks, projects, notes, focus
          sessions, streaks, and an assistant that can help turn intent into a
          usable plan.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-md bg-[#ff7b39] px-5 py-3 text-center font-bold text-[#08110f] transition hover:bg-[#ff9a56]"
          >
            Create account
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-[#f5bf76]/35 px-5 py-3 text-center font-bold text-[#f8e8c0] transition hover:border-[#f5bf76]/70"
          >
            View dashboard
          </Link>
        </div>
      </div>
      <div className="rounded-lg border border-[#f5bf76]/25 bg-[#0b1815] p-4 shadow-2xl shadow-black/30">
        <div className="rounded-md border border-[#25392f] bg-[#101d19] p-4">
          <div className="mb-4 flex items-center justify-between border-b border-[#2e3b32] pb-3 font-mono text-sm">
            <span className="text-[#ff7b39]">TODAY&apos;S PLAN</span>
            <span className="text-[#50d678]">VOICE READY</span>
          </div>
          {[
            ["09:00", "Deep work", "Build landing page"],
            ["10:30", "Standup", "Team sync"],
            ["11:30", "Project", "ElevenLabs voice pass"],
            ["02:00", "Notes", "Organize research"],
          ].map(([time, type, title]) => (
            <div
              key={`${time}-${title}`}
              className="grid grid-cols-[64px_96px_1fr] gap-3 border-b border-[#24342d] py-3 font-mono text-sm last:border-0"
            >
              <span className="text-[#f5bf76]">{time}</span>
              <span className="text-[#50d678]">{type}</span>
              <span className="text-[#fff0c8]">{title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}