import { ArrowRight, Clock3, FileText, Sparkles } from "lucide-react";
import SectionCard from "../components/SectionCard";

export default function DashboardPage({ recentItems, processedMeeting, onNavigate }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Recent Sources</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{recentItems.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Latest Status</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {processedMeeting ? "Processed" : "Pending"}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Output Sections</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {processedMeeting
              ? processedMeeting.decisions.length + processedMeeting.action_items.length + 1
              : 0}
          </p>
        </div>
      </div>

      <SectionCard
        title="Recent Workspace Activity"
        subtitle="Track uploaded sources and their processing state."
        icon={Clock3}
        actions={
          <button
            type="button"
            onClick={() => onNavigate("upload")}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            New Upload
            <ArrowRight size={16} />
          </button>
        }
      >
        <div className="space-y-3">
          {recentItems.length ? (
            recentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-2 text-slate-700 shadow-sm">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.type}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    item.status === "Processed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No sources uploaded yet. Start from Upload Source.</p>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Product Workflow"
        subtitle="The backend pipeline is surfaced through dedicated pages, not a wizard."
        icon={Sparkles}
      >
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
          Input flows into transcription, preprocessing, information extraction, summarization,
          editing, and export. Use the left navigation to move through the workspace naturally.
        </div>
      </SectionCard>
    </div>
  );
}
