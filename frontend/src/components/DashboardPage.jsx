import { Clock3, FileText, Sparkles, UploadCloud } from "lucide-react";
import SectionCard from "./SectionCard";
import StatCard from "./StatCard";

export default function DashboardPage({
  metrics,
  recentItems,
  currentSourceLabel,
  onQuickUpload,
  onQuickProcess,
  canProcess,
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard label="Files In Workspace" value={metrics.totalFiles} hint="Uploaded or pasted sources" />
        <StatCard label="Processed" value={metrics.processedFiles} hint="Completed meeting outputs" />
        <StatCard label="Pending" value={metrics.pendingFiles} hint="Sources waiting for generation" />
        <StatCard label="Action Items" value={metrics.actionItems} hint="Open tasks in the latest output" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Recent Activity"
          subtitle="Track the latest inputs and generated minutes."
          icon={Clock3}
        >
          <div className="space-y-3">
            {recentItems.length ? (
              recentItems.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      item.status === "Processed"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No files yet. Upload a source to start generating minutes.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Workspace Actions"
          subtitle="Move quickly between source upload and generation."
          icon={Sparkles}
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-sm font-medium text-slate-900">Current source</p>
              <p className="mt-2 text-sm text-slate-500">{currentSourceLabel}</p>
            </div>

            <button
              type="button"
              onClick={onQuickUpload}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <UploadCloud size={16} />
              New Upload
            </button>

            <button
              type="button"
              onClick={onQuickProcess}
              disabled={!canProcess}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileText size={16} />
              Open Processing Pipeline
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
