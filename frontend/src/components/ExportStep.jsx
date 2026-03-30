import { Download, Mail, Send } from "lucide-react";
import SectionCard from "./SectionCard";

export default function ExportStep({
  editableMeeting,
  transcript,
  emailForm,
  setEmailForm,
  handleDownload,
  handleSendEmail,
  resetEmailBody,
}) {
  return (
    <SectionCard
      title="Step 5: Export"
      subtitle="Download files or send the final version by email."
      icon={Download}
    >
      {editableMeeting ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/85 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Downloads</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleDownload("pdf")}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("docx")}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700"
                >
                  <Download size={16} />
                  Download DOCX
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/85 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Transcript Snapshot</h3>
              <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap text-sm text-slate-600">
                {transcript || "Processed transcript will appear here."}
              </pre>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/85 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slateblue/10 p-2 text-slateblue">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Email Delivery</h3>
                <p className="mt-1 text-sm text-slate-600">Send the finalized minutes directly from the backend.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-sm text-slate-600">
                <span className="mb-2 block">Recipients</span>
                <input
                  type="text"
                  value={emailForm.recipients}
                  onChange={(event) =>
                    setEmailForm((current) => ({ ...current, recipients: event.target.value }))
                  }
                  placeholder="name@example.com, team@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                />
              </label>

              <label className="block text-sm text-slate-600">
                <span className="mb-2 block">Subject</span>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(event) =>
                    setEmailForm((current) => ({ ...current, subject: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                />
              </label>

              <label className="block text-sm text-slate-600">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span>Email Body</span>
                  <button
                    type="button"
                    onClick={resetEmailBody}
                    className="text-xs font-medium text-slateblue"
                  >
                    Refresh from edits
                  </button>
                </div>
                <textarea
                  rows={12}
                  value={emailForm.body}
                  onChange={(event) =>
                    setEmailForm((current) => ({ ...current, body: event.target.value }))
                  }
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                />
              </label>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={emailForm.attachPdf}
                    onChange={(event) =>
                      setEmailForm((current) => ({ ...current, attachPdf: event.target.checked }))
                    }
                  />
                  Attach PDF
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={emailForm.attachDocx}
                    onChange={(event) =>
                      setEmailForm((current) => ({ ...current, attachDocx: event.target.checked }))
                    }
                  />
                  Attach DOCX
                </label>
              </div>

              <button
                type="button"
                onClick={handleSendEmail}
                className="inline-flex items-center gap-2 rounded-full bg-slateblue px-5 py-3 text-sm font-medium text-white"
              >
                <Send size={16} />
                Send Email
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Finalize meeting data in earlier steps before exporting.</p>
      )}
    </SectionCard>
  );
}
