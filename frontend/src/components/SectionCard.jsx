export default function SectionCard({ title, subtitle, icon: Icon, children, actions }) {
  return (
    <section className="glass-panel rounded-3xl border border-white/70 p-6 shadow-panel">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            {Icon ? (
              <div className="rounded-2xl bg-slateblue/10 p-2 text-slateblue">
                <Icon size={20} />
              </div>
            ) : null}
            <h2 className="text-xl font-semibold text-ink">{title}</h2>
          </div>
          {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
