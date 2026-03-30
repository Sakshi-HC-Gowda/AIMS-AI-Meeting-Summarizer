import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function InlineAlert({ tone, message }) {
  if (!message) {
    return null;
  }

  const config = {
    neutral: {
      wrapper: "border-slate-200 bg-slate-50 text-slate-700",
      icon: Info,
    },
    success: {
      wrapper: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    },
    error: {
      wrapper: "border-rose-200 bg-rose-50 text-rose-700",
      icon: AlertCircle,
    },
  };

  const selected = config[tone] || config.neutral;
  const Icon = selected.icon;

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${selected.wrapper}`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
}
