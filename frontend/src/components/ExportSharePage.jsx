import { Download, Mail, RefreshCcw, Share2 } from "lucide-react";
import SectionCard from "./SectionCard";

export default function ExportSharePage({
  editableMeeting,
  transcript,
  emailForm,
  setEmailForm,
  handleDownload,
  handleSendEmail,
  resetEmailBody,
}) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Export & Share"
        subtitle="Prepare final exports, review the preview, and send minutes by email."
        icon={Share2}
      >
        {editableMeeting ? (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Export Options</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleDownload("pdf")}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white"
                  >
                    <Download size={16} />
                    Export PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload("docx")}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    <Download size={16} />
                    Export DOCX
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Preview</p>
                <div className="mt-4 max-h-[34rem] space-y-4 overflow-auto rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{editableMeeting.metadata?.title || "Untitled Meeting"}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {editableMeeting.metadata?.date || "No date"} · {editableMeeting.metadata?.venue || "No venue"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Summary</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{editableMeeting.summary || "No summary yet."}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Transcript Preview</p>
                    <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{transcript || "Transcript will appear after processing."}</pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Email Delivery</p>
                    <p className="mt-1 text-sm text-slate-500">Send the finalized minutes without leaving the workspace.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetEmailBody}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                >
                  <RefreshCcw size={14} />
                  Refresh body
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <input
                  type="text"
                  value={emailForm.recipients}
                  onChange={(event) => setEmailForm((current) => ({ ...current, recipients: event.target.value }))}
                  placeholder="Recipients: name@example.com, team@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                />
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(event) => setEmailForm((current) => ({ ...current, subject: event.target.value }))}
                  placeholder="Email subject"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                />
                <textarea
                  rows={16}
                  value={emailForm.body}
                  onChange={(event) => setEmailForm((current) => ({ ...current, body: event.target.value }))}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
                />
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={emailForm.attachPdf}
                      onChange={(event) => setEmailForm((current) => ({ ...current, attachPdf: event.target.checked }))}
                    />
                    Attach PDF
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={emailForm.attachDocx}
                      onChange={(event) => setEmailForm((current) => ({ ...current, attachDocx: event.target.checked }))}
                    />
                    Attach DOCX
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white"
                >
                  <Mail size={16} />
                  Send Email
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Generate and edit meeting output before exporting or sharing.</p>
        )}
      </SectionCard>
    </div>
  );
}
