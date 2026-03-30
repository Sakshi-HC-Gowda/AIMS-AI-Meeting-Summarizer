import { FileCode2, LoaderCircle, Sparkles } from "lucide-react";
import PipelineStages from "./PipelineStages";
import SectionCard from "./SectionCard";

export default function ProcessingPipelinePage({
  currentSourceLabel,
  loading,
  pipelineStages,
  pipelineProgress,
  runAims,
  canProcess,
  statusText,
}) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Processing Pipeline"
        subtitle="Monitor transcription, cleaning, extraction, and summarization in one place."
        icon={FileCode2}
      >
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Selected Source</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{currentSourceLabel}</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                The backend keeps the original Whisper and BART logic while this page presents each processing phase clearly.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-950 p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Execution</p>
              <p className="mt-3 text-2xl font-semibold">Generate Minutes</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Start the backend workflow to transcribe, clean, extract key information, and produce structured minutes.
              </p>
              <button
                type="button"
                onClick={runAims}
                disabled={loading || !canProcess}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <LoaderCircle size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? "Generating..." : "Generate Minutes"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Live Status</p>
                <p className="mt-2 text-sm text-slate-500">{statusText}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-slate-900">{pipelineProgress}%</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Progress</p>
              </div>
            </div>

            <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900 transition-all duration-500"
                style={{ width: `${pipelineProgress}%` }}
              />
            </div>

            <PipelineStages stages={pipelineStages} />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
