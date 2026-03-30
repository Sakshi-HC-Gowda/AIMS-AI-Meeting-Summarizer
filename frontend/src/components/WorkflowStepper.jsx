import { Check } from "lucide-react";

export default function WorkflowStepper({ steps, activeStep, onStepChange }) {
  return (
    <div className="glass-panel rounded-3xl border border-white/70 p-4 shadow-panel">
      <div className="grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isComplete = index < activeStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(index)}
              className={`rounded-2xl border p-4 text-left transition ${
                isActive
                  ? "border-slateblue bg-slateblue text-white"
                  : isComplete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white/80 text-slate-700 hover:border-slateblue/40"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : isComplete
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {isComplete ? <Check size={16} /> : index + 1}
                </span>
                <step.icon size={18} />
              </div>
              <p className="text-xs uppercase tracking-[0.24em] opacity-75">{step.eyebrow}</p>
              <p className="mt-1 text-sm font-semibold">{step.title}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
