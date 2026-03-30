import { FileText } from "lucide-react";
import SectionCard from "./SectionCard";
import StatCard from "./StatCard";

export default function ResultsStep({ editableMeeting, summaryPoints }) {
  return (
    <SectionCard
      title="Step 3: Results"
      subtitle="Review the generated summary, decisions, and action items before editing."
      icon={FileText}
    >
      {editableMeeting ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Summary Points" value={summaryPoints.length} hint="Bullets or lines in the generated summary" />
            <StatCard label="Key Decisions" value={editableMeeting.decisions.length} hint="Items extracted from the meeting" />
            <StatCard label="Action Items" value={editableMeeting.action_items.length} hint="Tasks ready for follow-up" />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white/85 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Summary</h3>
              <div className="mt-4 space-y-3">
                {summaryPoints.length ? (
                  summaryPoints.map((point, index) => (
                    <div key={`${point}-${index}`} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                      {point}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No summary generated yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/85 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Key Decisions</h3>
              <div className="mt-4 space-y-3">
                {editableMeeting.decisions.length ? (
                  editableMeeting.decisions.map((decision, index) => (
                    <div key={`${decision}-${index}`} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                      {decision}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No decisions detected yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/85 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Action Items</h3>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {editableMeeting.action_items.length ? (
                editableMeeting.action_items.map((item, index) => (
                  <div key={`${item.task}-${index}`} className="rounded-2xl border border-slate-200 p-4">
                    <p className="font-medium text-slate-800">{item.task}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        Owner: {item.responsible || "Not assigned"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        Deadline: {item.deadline || "Not set"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        Status: {item.status || "Pending"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No action items detected yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Run AIMS in Step 2 to populate results.</p>
      )}
    </SectionCard>
  );
}
