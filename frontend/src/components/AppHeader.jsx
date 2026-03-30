import { Bell, Search } from "lucide-react";

export default function AppHeader({ title, subtitle, action }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 px-6 py-5 backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>

        <div className="flex items-center gap-3">
          {action}
          <label className="hidden min-w-[240px] items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 xl:flex">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search workspace"
              className="w-full border-0 bg-transparent outline-none"
            />
          </label>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600"
          >
            <Bell size={18} />
          </button>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              SG
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-900">Workspace User</p>
              <p className="text-xs text-slate-500">Product Editor</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
