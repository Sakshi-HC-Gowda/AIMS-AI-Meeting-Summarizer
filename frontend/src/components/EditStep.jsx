import { PencilLine } from "lucide-react";
import SectionCard from "./SectionCard";

export default function EditStep({
  editableMeeting,
  emptyMetadata,
  updateMetadata,
  setEditableMeeting,
  updateDecision,
  addDecision,
  removeDecision,
  updateActionItem,
  addActionItem,
  removeActionItem,
}) {
  return (
    <SectionCard
      title="Step 4: Edit"
      subtitle="Refine every important field before export or email."
      icon={PencilLine}
    >
      {editableMeeting ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Meeting Info</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {Object.keys(emptyMetadata).map((field) => (
                <label key={field} className="text-sm text-slate-600">
                  <span className="mb-2 block capitalize">{field}</span>
                  <input
                    type="text"
                    value={editableMeeting.metadata?.[field] || ""}
                    onChange={(event) => updateMetadata(field, event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/85 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Summary</h3>
            <textarea
              rows={10}
              value={editableMeeting.summary || ""}
              onChange={(event) =>
                setEditableMeeting((current) => ({ ...current, summary: event.target.value }))
              }
              className="mt-4 w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/85 p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Key Decisions</h3>
              <button
                type="button"
                onClick={addDecision}
                className="rounded-full bg-slateblue px-4 py-2 text-sm font-medium text-white"
              >
                Add Decision
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {editableMeeting.decisions.map((decision, index) => (
                <div key={`decision-${index}`} className="rounded-2xl border border-slate-200 p-4">
                  <textarea
                    rows={3}
                    value={decision}
                    onChange={(event) => updateDecision(index, event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                  />
                  <button
                    type="button"
                    onClick={() => removeDecision(index)}
                    className="mt-3 text-sm font-medium text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {!editableMeeting.decisions.length ? (
                <p className="text-sm text-slate-500">No decisions yet. Add one to continue editing.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/85 p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Action Items</h3>
              <button
                type="button"
                onClick={addActionItem}
                className="rounded-full bg-slateblue px-4 py-2 text-sm font-medium text-white"
              >
                Add Action Item
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {editableMeeting.action_items.map((item, index) => (
                <div key={`action-${index}`} className="rounded-2xl border border-slate-200 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-sm text-slate-600 md:col-span-2">
                      <span className="mb-2 block">Task</span>
                      <textarea
                        rows={3}
                        value={item.task}
                        onChange={(event) => updateActionItem(index, "task", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                      />
                    </label>
                    <label className="text-sm text-slate-600">
                      <span className="mb-2 block">Responsible</span>
                      <input
                        type="text"
                        value={item.responsible}
                        onChange={(event) => updateActionItem(index, "responsible", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                      />
                    </label>
                    <label className="text-sm text-slate-600">
                      <span className="mb-2 block">Deadline</span>
                      <input
                        type="text"
                        value={item.deadline}
                        onChange={(event) => updateActionItem(index, "deadline", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                      />
                    </label>
                    <label className="text-sm text-slate-600">
                      <span className="mb-2 block">Status</span>
                      <input
                        type="text"
                        value={item.status}
                        onChange={(event) => updateActionItem(index, "status", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeActionItem(index)}
                    className="mt-3 text-sm font-medium text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {!editableMeeting.action_items.length ? (
                <p className="text-sm text-slate-500">No action items yet. Add one to continue editing.</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Run AIMS first, then this editing workspace will become available.</p>
      )}
    </SectionCard>
  );
}
