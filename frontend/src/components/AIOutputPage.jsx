import { ClipboardList, FileText } from "lucide-react";
import SectionCard from "./SectionCard";

export default function AIOutputPage({ editableMeeting, summaryPoints }) {
  const title = editableMeeting?.metadata?.title || "Untitled Meeting";

  return (
    <div className="space-y-6">
      <SectionCard
        title="AI Output"
        subtitle="Review the generated meeting minutes in a clean, structured layout."
        icon={FileText}
      >
        {editableMeeting ? (
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Meeting Title</p>
                <h3 className="mt-3 text-3xl font-semibold text-slate-950">{title}</h3>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Date: {editableMeeting.metadata?.date || "Not set"}
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Time: {editableMeeting.metadata?.time || "Not set"}
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Venue: {editableMeeting.metadata?.venue || "Not set"}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/90 p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Summary</p>
                <div className="mt-4 space-y-4">
                  {summaryPoints.length ? (
                    summaryPoints.map((point, index) => (
                      <p key={`${point}-${index}`} className="text-sm leading-7 text-slate-700">
                        {point}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No summary has been generated yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <SectionCard
                title="Key Points"
                subtitle="Highlights extracted from the generated summary."
                icon={ClipboardList}
              >
                <div className="space-y-3">
                  {summaryPoints.length ? (
                    summaryPoints.map((point, index) => (
                      <div key={`${point}-${index}`} className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-700">
                        {point}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No key points available.</p>
                  )}
                </div>
              </SectionCard>

              <SectionCard
                title="Action Items"
                subtitle="Tasks identified from the meeting output."
                icon={ClipboardList}
              >
                <div className="space-y-3">
                  {editableMeeting.action_items.length ? (
                    editableMeeting.action_items.map((item, index) => (
                      <div key={`${item.task}-${index}`} className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                        <p className="text-sm font-medium text-slate-900">{item.task}</p>
                        <p className="mt-2 text-sm text-slate-500">
                          {item.responsible || "Unassigned"} {item.deadline ? `· ${item.deadline}` : ""}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No action items available.</p>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Generate meeting minutes from the Processing Pipeline page to view AI output here.</p>
        )}
      </SectionCard>
    </div>
  );
}
