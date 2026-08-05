import type { ReactNode } from "react";
import { AssistantRail } from "./assistant-rail";
import { SideNav } from "./side-nav";
import { VoiceDock } from "./voice-dock";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#07110f] p-3 text-[#f8e8c0]">
      <div className="grid min-h-[calc(100vh-24px)] gap-3 rounded-lg border border-[#7c4c2d] bg-[#0b1512] p-3 shadow-2xl shadow-black/40 lg:grid-cols-[220px_minmax(0,1fr)_340px]">
        <SideNav />
        <section className="min-w-0 rounded-md border border-[#25392f] bg-[#101d19] p-4">
          {children}
        </section>
        <aside className="flex min-w-0 flex-col gap-3">
          <AssistantRail />
          <VoiceDock />
        </aside>
      </div>
    </main>
  );
}
