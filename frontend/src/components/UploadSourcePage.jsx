import { FileAudio, FileText, Files, UploadCloud } from "lucide-react";
import SectionCard from "./SectionCard";
import InputMethodTabs from "./InputMethodTabs";
import RecordingStep from "./RecordingStep";

export default function UploadSourcePage({
  inputMethods,
  inputMethod,
  inputs,
  setInputMethod,
  setInputs,
  handleTxtUpload,
}) {
  const handleTranscriptReady = (transcriptText) => {
    setInputs((current) => ({ ...current, pastedText: transcriptText }));
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Source Intake"
        subtitle="Record meetings, upload recordings, documents, or paste transcript text directly."
        icon={UploadCloud}
      >
        <div className="space-y-6">
          <InputMethodTabs methods={inputMethods} activeMethod={inputMethod} onChange={setInputMethod} />

          {inputMethod === "record" ? (
            <RecordingStep onTranscriptReady={handleTranscriptReady} />
          ) : null}

          {inputMethod === "audio" ? (
            <label className="block rounded-3xl border border-dashed border-slate-300 bg-white/90 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <FileAudio size={24} />
              </div>
              <p className="mt-4 text-base font-medium text-slate-900">Drop audio here or browse files</p>
              <p className="mt-2 text-sm text-slate-500">Supports MP3, WAV, and M4A meeting recordings.</p>
              <input
                type="file"
                accept=".mp3,.wav,.m4a"
                className="mt-5 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:font-medium file:text-white"
                onChange={(event) => setInputs((current) => ({ ...current, audioFile: event.target.files?.[0] || null }))}
              />
              <p className="mt-4 text-sm text-slate-500">{inputs.audioFile ? inputs.audioFile.name : "No audio file selected."}</p>
            </label>
          ) : null}

          {inputMethod === "text" ? (
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <FileText size={18} />
                Pasted transcript
              </div>
              <textarea
                rows={16}
                value={inputs.pastedText}
                onChange={(event) => setInputs((current) => ({ ...current, pastedText: event.target.value }))}
                placeholder="Paste transcript text, speaker notes, or a raw meeting log."
                className="mt-4 w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-800 outline-none transition focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
              />
              <p className="mt-3 text-sm text-slate-500">
                {inputs.pastedText.trim()
                  ? `${inputs.pastedText.trim().split(/\s+/).length} words captured for processing`
                  : "No text entered yet."}
              </p>
            </div>
          ) : null}

          {inputMethod === "txt" ? (
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
              <label className="block rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FileText size={18} />
                  Upload text document
                </div>
                <input
                  type="file"
                  accept=".txt"
                  className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:font-medium file:text-white"
                  onChange={(event) => handleTxtUpload(event.target.files?.[0] || null)}
                />
              </label>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-900">{inputs.txtFile ? inputs.txtFile.name : "No TXT file selected."}</p>
                <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-sm text-slate-600">
                  {inputs.txtPreview || "Document preview will appear here after upload."}
                </pre>
              </div>
            </div>
          ) : null}

          {inputMethod === "pdf" ? (
            <label className="block rounded-3xl border border-dashed border-slate-300 bg-white/90 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Files size={24} />
              </div>
              <p className="mt-4 text-base font-medium text-slate-900">Upload a PDF transcript or scanned notes</p>
              <p className="mt-2 text-sm text-slate-500">AIMS will extract the text before summarization.</p>
              <input
                type="file"
                accept=".pdf"
                className="mt-5 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:font-medium file:text-white"
                onChange={(event) => setInputs((current) => ({ ...current, pdfFile: event.target.files?.[0] || null }))}
              />
              <p className="mt-4 text-sm text-slate-500">
                {inputs.pdfFile ? `${inputs.pdfFile.name} (${Math.round(inputs.pdfFile.size / 1024)} KB)` : "No PDF selected."}
              </p>
            </label>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}
