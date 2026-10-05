export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-end justify-between mb-6 pb-4 border-b" style={{ borderColor: 'var(--line-soft)' }}>
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--ink)' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

