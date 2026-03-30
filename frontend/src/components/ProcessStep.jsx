import { LoaderCircle, Sparkles } from "lucide-react";
import SectionCard from "./SectionCard";

export default function ProcessStep({ getSelectedSourceLabel, hasReadyInput, loading, runAims }) {
  return (
    <SectionCard
      title="Step 2: Process"
      subtitle="Review your selected source, then trigger the backend workflow."
      icon={Sparkles}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white/85 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Current Source</p>
          <p className="mt-3 text-lg font-semibold text-ink">{getSelectedSourceLabel()}</p>
          <p className="mt-3 text-sm text-slate-600">
            AIMS will preserve the current backend logic: Whisper for speech-to-text and BART for summarization.
          </p>
        </div>

        <div className="rounded-3xl bg-ink p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Process Control</p>
          <p className="mt-3 text-2xl font-semibold">Run AIMS</p>
          <p className="mt-3 text-sm text-slate-200">
            This step sends the selected input to the Flask API and stores the returned meeting data for later review and export.
          </p>
          <button
            type="button"
            onClick={runAims}
            disabled={loading || !hasReadyInput()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-ink transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <LoaderCircle className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {loading ? "Processing..." : "Run AIMS"}
          </button>
        </div>
      </div>
    </SectionCard>
  );
}
