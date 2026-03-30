import { FileAudio, FileText, Files } from "lucide-react";
import SectionCard from "./SectionCard";
import InputMethodTabs from "./InputMethodTabs";

export default function InputStep({
  inputMethods,
  inputMethod,
  inputs,
  setInputMethod,
  setInputs,
  handleTxtUpload,
}) {
  return (
    <SectionCard
      title="Step 1: Input"
      subtitle="Choose how you want to feed meeting content into AIMS."
      icon={Files}
    >
      <div className="space-y-6">
        <InputMethodTabs
          methods={inputMethods}
          activeMethod={inputMethod}
          onChange={setInputMethod}
        />

        {inputMethod === "audio" ? (
          <label className="block rounded-3xl border border-dashed border-slate-300 bg-white/80 p-6">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <FileAudio size={18} />
              Upload audio file
            </span>
            <input
              type="file"
              accept=".mp3,.wav,.m4a"
              className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slateblue file:px-4 file:py-2 file:font-medium file:text-white"
              onChange={(event) =>
                setInputs((current) => ({ ...current, audioFile: event.target.files?.[0] || null }))
              }
            />
            <p className="mt-4 text-sm text-slate-500">
              {inputs.audioFile ? `Selected: ${inputs.audioFile.name}` : "No audio file selected."}
            </p>
          </label>
        ) : null}

        {inputMethod === "text" ? (
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <FileText size={18} />
              Paste transcript text
            </label>
            <textarea
              rows={14}
              value={inputs.pastedText}
              onChange={(event) =>
                setInputs((current) => ({ ...current, pastedText: event.target.value }))
              }
              placeholder="Paste your meeting transcript here..."
              className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-800 outline-none transition focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
            />
            <p className="mt-3 text-sm text-slate-500">
              {inputs.pastedText.trim()
                ? `${inputs.pastedText.trim().split(/\s+/).length} words ready for processing`
                : "No transcript text entered yet."}
            </p>
          </div>
        ) : null}

        {inputMethod === "txt" ? (
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6">
            <label className="block rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <FileText size={18} />
                Upload TXT file
              </span>
              <input
                type="file"
                accept=".txt"
                className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slateblue file:px-4 file:py-2 file:font-medium file:text-white"
                onChange={(event) => handleTxtUpload(event.target.files?.[0] || null)}
              />
            </label>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-700">
                {inputs.txtFile ? `Selected: ${inputs.txtFile.name}` : "No TXT file selected."}
              </p>
              <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap text-sm text-slate-600">
                {inputs.txtPreview || "TXT preview will appear here after upload."}
              </pre>
            </div>
          </div>
        ) : null}

        {inputMethod === "pdf" ? (
          <label className="block rounded-3xl border border-dashed border-slate-300 bg-white/80 p-6">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Files size={18} />
              Upload PDF transcript
            </span>
            <input
              type="file"
              accept=".pdf"
              className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slateblue file:px-4 file:py-2 file:font-medium file:text-white"
              onChange={(event) =>
                setInputs((current) => ({ ...current, pdfFile: event.target.files?.[0] || null }))
              }
            />
            <p className="mt-4 text-sm text-slate-500">
              {inputs.pdfFile
                ? `Selected: ${inputs.pdfFile.name} (${Math.round(inputs.pdfFile.size / 1024)} KB)`
                : "No PDF file selected."}
            </p>
          </label>
        ) : null}
      </div>
    </SectionCard>
  );
}
