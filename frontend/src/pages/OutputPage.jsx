import { FileText } from "lucide-react";
import SectionCard from "../components/SectionCard";

export default function OutputPage({ editableMeeting, summaryPoints }) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="AI Output"
        subtitle="Generated meeting minutes in a clean, structured layout."
        icon={FileText}
      >
        {editableMeeting ? (
          <article className="rounded-[2rem] border border-slate-200 bg-white p-8">
            <header className="border-b border-slate-200 pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Meeting Title</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-900">
                {editableMeeting.metadata?.title || "Untitled Meeting"}
              </h3>
            </header>

            <div className="mt-8 space-y-8">
              <section>
                <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Summary</h4>
                <div className="mt-4 space-y-3">
                  {summaryPoints.length ? (
                    summaryPoints.map((point, index) => (
                      <p key={`${point}-${index}`} className="text-base leading-8 text-slate-700">
                        {point}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No summary available yet.</p>
                  )}
                </div>
              </section>

              <section>
                <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Key Points</h4>
                <div className="mt-4 space-y-3">
                  {editableMeeting.decisions.length ? (
                    editableMeeting.decisions.map((decision, index) => (
                      <div key={`${decision}-${index}`} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                        {decision}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No key points extracted yet.</p>
                  )}
                </div>
              </section>

              <section>
                <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Action Items</h4>
                <div className="mt-4 space-y-4">
                  {editableMeeting.action_items.length ? (
                    editableMeeting.action_items.map((item, index) => (
                      <div key={`${item.task}-${index}`} className="rounded-2xl border border-slate-200 px-4 py-4">
                        <p className="font-medium text-slate-900">{item.task}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            Owner: {item.responsible || "Not assigned"}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            Deadline: {item.deadline || "Not set"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No action items extracted yet.</p>
                  )}
                </div>
              </section>
            </div>
          </article>
        ) : (
          <p className="text-sm text-slate-500">Generate meeting minutes from the Processing Pipeline page first.</p>
        )}
      </SectionCard>
    </div>
  );
}
