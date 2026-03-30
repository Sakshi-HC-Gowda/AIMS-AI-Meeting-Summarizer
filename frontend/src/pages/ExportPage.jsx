import { Download, Mail } from "lucide-react";
import SectionCard from "../components/SectionCard";

export default function ExportPage({
  editableMeeting,
  transcript,
  emailForm,
  setEmailForm,
  handleDownload,
  handleSendEmail,
  resetEmailBody,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard
        title="Export & Share"
        subtitle="Download or deliver the final version through the backend."
        icon={Download}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleDownload("pdf")}
              disabled={!editableMeeting}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={16} />
              Export PDF
            </button>
            <button
              type="button"
              onClick={() => handleDownload("docx")}
              disabled={!editableMeeting}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={16} />
              Export DOCX
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Preview</p>
            <pre className="mt-4 max-h-[34rem] overflow-auto whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {transcript || "Processed transcript and generated output preview will appear here."}
            </pre>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Share by Email"
        subtitle="Send the final meeting minutes without leaving the workspace."
        icon={Mail}
      >
        <div className="space-y-4">
          <label className="block text-sm text-slate-600">
            <span className="mb-2 block">Recipients</span>
            <input
              type="text"
              value={emailForm.recipients}
              onChange={(event) =>
                setEmailForm((current) => ({ ...current, recipients: event.target.value }))
              }
              placeholder="team@example.com, project@example.com"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
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
                Refresh from output
              </button>
            </div>
            <textarea
              rows={12}
              value={emailForm.body}
              onChange={(event) =>
                setEmailForm((current) => ({ ...current, body: event.target.value }))
              }
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
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
            disabled={!editableMeeting}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Mail size={16} />
            Send Email
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
