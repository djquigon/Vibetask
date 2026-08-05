"use client";

export function VoiceDock() {
  return (
    <section className="rounded-md border border-[#25392f] bg-[#0d1b17] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-bold uppercase text-[#50d678]">
            Voice mode
          </p>
          <p className="mt-1 text-sm text-[#d8c79f]">Press to talk</p>
        </div>
        <button
          className="h-16 w-16 rounded-full border-4 border-[#ffb14f] bg-[#ff674d] font-mono text-2xl font-black text-[#08110f]"
          type="button"
          aria-label="Start voice prompt"
        >
          MIC
        </button>
      </div>
    </section>
  );
}
