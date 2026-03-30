import { Save, SquarePen } from "lucide-react";
import SectionCard from "./SectionCard";

export default function EditorPage({
  editableMeeting,
  updateMetadata,
  updateDecision,
  addDecision,
  removeDecision,
  updateActionItem,
  addActionItem,
  removeActionItem,
  setEditableMeeting,
  onSave,
}) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Editor"
        subtitle="Refine the generated output before export or sharing."
        icon={SquarePen}
        actions={
          <button
            type="button"
            onClick={onSave}
            disabled={!editableMeeting}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            Save Changes
          </button>
        }
      >
        {editableMeeting ? (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Meeting Metadata</p>
                <div className="mt-4 grid gap-4">
                  {["title", "date", "time", "venue", "organizer", "recorder"].map((field) => (
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

              <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Meeting Summary</p>
                <textarea
                  rows={20}
                  value={editableMeeting.summary || ""}
                  onChange={(event) => setEditableMeeting((current) => ({ ...current, summary: event.target.value }))}
                  className="mt-4 w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                />
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Key Decisions</p>
                  <button
                    type="button"
                    onClick={addDecision}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {editableMeeting.decisions.length ? (
                    editableMeeting.decisions.map((decision, index) => (
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
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No decisions yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Action Items</p>
                  <button
                    type="button"
                    onClick={addActionItem}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  {editableMeeting.action_items.length ? (
                    editableMeeting.action_items.map((item, index) => (
                      <div key={`action-${index}`} className="rounded-2xl border border-slate-200 p-4">
                        <textarea
                          rows={3}
                          value={item.task}
                          onChange={(event) => updateActionItem(index, "task", event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                        />
                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          <input
                            type="text"
                            placeholder="Owner"
                            value={item.responsible}
                            onChange={(event) => updateActionItem(index, "responsible", event.target.value)}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                          />
                          <input
                            type="text"
                            placeholder="Deadline"
                            value={item.deadline}
                            onChange={(event) => updateActionItem(index, "deadline", event.target.value)}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                          />
                          <input
                            type="text"
                            placeholder="Status"
                            value={item.status}
                            onChange={(event) => updateActionItem(index, "status", event.target.value)}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeActionItem(index)}
                          className="mt-3 text-sm font-medium text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No action items yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Generate content first to unlock the editor.</p>
        )}
      </SectionCard>
    </div>
  );
}
