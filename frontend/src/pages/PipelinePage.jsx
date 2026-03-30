import { Sparkles } from "lucide-react";
import PipelineStages from "../components/PipelineStages";
import SectionCard from "../components/SectionCard";

export default function PipelinePage({
  stages,
  loading,
  hasReadyInput,
  runAims,
  pipelineLogs,
  selectedSourceLabel,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard
        title="Processing Pipeline"
        subtitle="Surface the backend workflow in a clear operational view."
        icon={Sparkles}
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Current Source</p>
          <p className="mt-3 text-lg font-medium text-slate-900">{selectedSourceLabel}</p>
          <p className="mt-3 text-sm text-slate-500">
            This page reflects transcription, preprocessing, information extraction, and summarization while the backend processes your source.
          </p>
          <button
            type="button"
            onClick={runAims}
            disabled={loading || !hasReadyInput}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate Minutes"}
          </button>
        </div>
      </SectionCard>

      <div className="space-y-6">
        <SectionCard
          title="Pipeline Stages"
          subtitle="Operational visibility into the AI workflow."
          icon={Sparkles}
        >
          <PipelineStages stages={stages} />
        </SectionCard>

        <SectionCard
          title="Processing Activity"
          subtitle="Status messages from the current workspace session."
          icon={Sparkles}
        >
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="space-y-3">
              {pipelineLogs.length ? (
                pipelineLogs.map((log, index) => (
                  <div key={`${log}-${index}`} className="text-sm text-slate-600">
                    {log}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No pipeline activity yet.</p>
              )}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
