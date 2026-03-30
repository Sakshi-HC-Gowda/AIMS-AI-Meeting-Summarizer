export default function AppSidebar({ items, activePage, onSelect }) {
  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white md:sticky md:top-0 md:flex md:flex-col">
      <div className="border-b border-slate-200 px-6 py-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">AIMS</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Meeting Workspace</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          AI-powered meeting minutes for audio, documents, and transcripts.
        </p>
      </div>

      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {items.map((item) => {
            const isActive = item.id === activePage;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  isActive
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className={`mt-1 text-xs ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200 px-6 py-5">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">System</p>
          <p className="mt-2 text-sm font-medium text-slate-900">Whisper + BART</p>
          <p className="mt-1 text-sm text-slate-500">Production workflow across transcription, extraction, and export.</p>
        </div>
      </div>
    </aside>
  );
}
