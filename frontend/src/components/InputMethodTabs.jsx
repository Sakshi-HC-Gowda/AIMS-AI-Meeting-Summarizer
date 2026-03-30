export default function InputMethodTabs({ methods, activeMethod, onChange }) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-2">
      {methods.map((method) => {
        const isActive = method.id === activeMethod;
        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onChange(method.id)}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-white text-slateblue shadow-sm"
                : "text-slate-600 hover:bg-white/70"
            }`}
          >
            <method.icon size={16} />
            {method.label}
          </button>
        );
      })}
    </div>
  );
}
