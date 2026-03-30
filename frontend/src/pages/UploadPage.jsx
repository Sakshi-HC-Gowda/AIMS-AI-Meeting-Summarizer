import { FileAudio, FileText, Files, UploadCloud } from "lucide-react";
import SectionCard from "../components/SectionCard";
import InputMethodTabs from "../components/InputMethodTabs";

export default function UploadPage({
  inputMethods,
  inputMethod,
  setInputMethod,
  inputs,
  setInputs,
  handleTxtUpload,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <SectionCard
        title="Upload Source"
        subtitle="Bring meeting content into the workspace from files or pasted text."
        icon={UploadCloud}
      >
        <div className="space-y-6">
          <InputMethodTabs
            methods={inputMethods}
            activeMethod={inputMethod}
            onChange={setInputMethod}
          />

          {inputMethod === "audio" ? (
            <label className="block rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="rounded-3xl bg-white p-4 text-slate-700 shadow-sm">
                  <FileAudio size={28} />
                </div>
                <p className="mt-4 text-lg font-medium text-slate-900">Upload audio recording</p>
                <p className="mt-2 text-sm text-slate-500">Supports MP3, WAV, and M4A.</p>
              </div>
              <input
                type="file"
                accept=".mp3,.wav,.m4a"
                className="mt-6 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:font-medium file:text-white"
                onChange={(event) =>
                  setInputs((current) => ({ ...current, audioFile: event.target.files?.[0] || null }))
                }
              />
            </label>
          ) : null}

          {inputMethod === "text" ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <FileText size={18} />
                Paste transcript
              </label>
              <textarea
                rows={16}
                value={inputs.pastedText}
                onChange={(event) =>
                  setInputs((current) => ({ ...current, pastedText: event.target.value }))
                }
                placeholder="Paste the transcript or meeting notes here."
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-800 outline-none focus:border-slateblue focus:ring-4 focus:ring-slateblue/10"
              />
            </div>
          ) : null}

          {inputMethod === "txt" ? (
            <label className="block rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="rounded-3xl bg-white p-4 text-slate-700 shadow-sm">
                  <FileText size={28} />
                </div>
                <p className="mt-4 text-lg font-medium text-slate-900">Upload text document</p>
                <p className="mt-2 text-sm text-slate-500">Plain text transcripts and notes.</p>
              </div>
              <input
                type="file"
                accept=".txt"
                className="mt-6 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:font-medium file:text-white"
                onChange={(event) => handleTxtUpload(event.target.files?.[0] || null)}
              />
            </label>
          ) : null}

          {inputMethod === "pdf" ? (
            <label className="block rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="rounded-3xl bg-white p-4 text-slate-700 shadow-sm">
                  <Files size={28} />
                </div>
                <p className="mt-4 text-lg font-medium text-slate-900">Upload PDF transcript</p>
                <p className="mt-2 text-sm text-slate-500">PDF meeting minutes, transcripts, or notes.</p>
              </div>
              <input
                type="file"
                accept=".pdf"
                className="mt-6 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:font-medium file:text-white"
                onChange={(event) =>
                  setInputs((current) => ({ ...current, pdfFile: event.target.files?.[0] || null }))
                }
              />
            </label>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        title="Source Preview"
        subtitle="Review the selected file or entered text before processing."
        icon={Files}
      >
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          {inputMethod === "audio" ? (
            <p className="text-sm text-slate-600">
              {inputs.audioFile ? `Selected file: ${inputs.audioFile.name}` : "No audio file selected."}
            </p>
          ) : null}

          {inputMethod === "text" ? (
            <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {inputs.pastedText || "No pasted transcript yet."}
            </pre>
          ) : null}

          {inputMethod === "txt" ? (
            <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {inputs.txtPreview || "TXT preview will appear here after upload."}
            </pre>
          ) : null}

          {inputMethod === "pdf" ? (
            <p className="text-sm text-slate-600">
              {inputs.pdfFile
                ? `Selected PDF: ${inputs.pdfFile.name} (${Math.round(inputs.pdfFile.size / 1024)} KB)`
                : "No PDF selected."}
            </p>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}
