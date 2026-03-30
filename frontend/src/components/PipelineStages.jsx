import { CheckCircle2, Circle, LoaderCircle } from "lucide-react";

export default function PipelineStages({ stages }) {
  return (
    <div className="space-y-4">
      {stages.map((stage, index) => {
        const isLast = index === stages.length - 1;
        const icon =
          stage.status === "completed" ? (
            <CheckCircle2 size={18} />
          ) : stage.status === "running" ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <Circle size={18} />
          );

        const tone =
          stage.status === "completed"
            ? "text-emerald-600"
            : stage.status === "running"
              ? "text-slateblue"
              : "text-slate-300";

        return (
          <div key={stage.id} className="flex gap-4">
            <div className="flex w-6 flex-col items-center">
              <div className={tone}>{icon}</div>
              {!isLast ? <div className="mt-2 h-full w-px bg-slate-200" /> : null}
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium text-slate-900">{stage.label}</p>
              <p className="mt-1 text-sm text-slate-500">{stage.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
