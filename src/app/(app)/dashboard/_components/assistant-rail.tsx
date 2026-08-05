export function AssistantRail() {
  return (
    <section className="rounded-md border border-[#25392f] bg-[#0d1b17] p-4">
      <div className="mb-4 flex items-center justify-between border-b border-[#25392f] pb-3">
        <h2 className="font-mono text-lg font-black uppercase text-[#ff7b39]">
          AI Assistant
        </h2>
        <span className="font-mono text-sm text-[#50d678]">ONLINE</span>
      </div>
      <div className="rounded-md border border-[#f5bf76]/20 bg-[#08110f] p-4">
        <p className="text-sm leading-6 text-[#f8e8c0]">
          Good morning. Want me to build a focused plan from your open tasks,
          meetings, and available energy?
        </p>
      </div>
      <div className="mt-4 rounded-md border border-[#50d678]/30 bg-[#0f2b1a] p-4">
        <p className="text-sm leading-6 text-[#dfffdc]">
          I have 4 hours free this morning. Help me plan my day.
        </p>
      </div>
      <div className="mt-4 rounded-md border border-[#f5bf76]/20 bg-[#08110f] p-4">
        <p className="text-sm leading-6 text-[#f8e8c0]">
          Perfect. I created a focused plan with deep work first, then project
          follow-up, then a short review block.
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="rounded-md bg-[#50d678] px-3 py-2 text-sm font-bold text-[#08110f]">
          Add to calendar
        </button>
        <button className="rounded-md bg-[#ff7b39] px-3 py-2 text-sm font-bold text-[#08110f]">
          Modify plan
        </button>
      </div>
    </section>
  );
}
