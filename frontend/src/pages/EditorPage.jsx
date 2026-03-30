import { Save } from "lucide-react";
import SectionCard from "../components/SectionCard";

export default function EditorPage({
  editableMeeting,
  setEditableMeeting,
  updateMetadata,
  saveEditorDraft,
}) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Editor"
        subtitle="Refine the generated meeting minutes in a document-style editor."
        icon={Save}
        actions={
          <button
            type="button"
            onClick={saveEditorDraft}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            <Save size={16} />
            Save Changes
          </button>
        }
      >
        {editableMeeting ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8">
            <div className="grid gap-4 md:grid-cols-2">
              {["title", "date", "time", "venue", "organizer", "recorder"].map((field) => (
                <label key={field} className="text-sm text-slate-600">
                  <span className="mb-2 block capitalize">{field}</span>
                  <input
                    type="text"
                    value={editableMeeting.metadata?.[field] || ""}
                    onChange={(event) => updateMetadata(field, event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                  />
                </label>
              ))}
            </div>

            <div className="mt-8 space-y-6">
              <label className="block text-sm text-slate-600">
                <span className="mb-2 block font-medium text-slate-700">Summary</span>
                <textarea
                  rows={10}
                  value={editableMeeting.summary || ""}
                  onChange={(event) =>
                    setEditableMeeting((current) => ({ ...current, summary: event.target.value }))
                  }
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                />
              </label>

              <label className="block text-sm text-slate-600">
                <span className="mb-2 block font-medium text-slate-700">Key Points</span>
                <textarea
                  rows={8}
                  value={editableMeeting.decisions.join("\n")}
                  onChange={(event) =>
                    setEditableMeeting((current) => ({
                      ...current,
                      decisions: event.target.value.split("\n").filter((item) => item.trim()),
                    }))
                  }
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                />
              </label>

              <label className="block text-sm text-slate-600">
                <span className="mb-2 block font-medium text-slate-700">Action Items</span>
                <textarea
                  rows={10}
                  value={editableMeeting.action_items.map((item) => item.task).join("\n")}
                  onChange={(event) =>
                    setEditableMeeting((current) => ({
                      ...current,
                      action_items: event.target.value
                        .split("\n")
                        .filter((item) => item.trim())
                        .map((item) => ({
                          task: item,
                          responsible: "",
                          deadline: "",
                          status: "Pending",
                        })),
                    }))
                  }
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                />
              </label>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Generate output first to start editing.</p>
        )}
      </SectionCard>
    </div>
  );
}
