import { TrendingUp, TrendingDown } from 'lucide-react';

const TONE_ACCENT = {
  brand:   'var(--brand)',
  emerald: 'var(--accent-emerald)',
  gold:    'var(--accent-gold)',
  violet:  'var(--accent-violet)',
  rose:    'var(--accent-rose)',
  deep:    'var(--brand-deep)',
};

/**
 * KpiCard premium.
 * Props:
 *  - label, value, hint, icon
 *  - tone: 'brand' | 'emerald' | 'gold' | 'violet' | 'rose' | 'deep'
 *  - variant: 'default' | 'cinematic'
 *  - delta: { value: number, label?: string, direction?: 'up'|'down' }
 *  - accent: legacy color string (still respected on default)
 *  - className: extra classes (used for stagger, e.g. 'delay-2')
 */
export default function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'brand',
  variant = 'default',
  delta,
  accent,
  className = '',
}) {
  const accentColor = accent || TONE_ACCENT[tone] || TONE_ACCENT.brand;

  if (variant === 'cinematic') {
    const isDown = delta?.direction === 'down';
    return (
      <div className={`cinematic-tile tone-${tone} p-5 animate-float-up ${className}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/70">{label}</div>
          {Icon && (
            <div className="w-9 h-9 rounded-full flex items-center justify-center ring-1 ring-white/30 bg-white/10 backdrop-blur-sm">
              <Icon className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <div className="text-[28px] md:text-[30px] font-black text-white mt-3 leading-none tracking-tight">{value}</div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="text-[11.5px] text-white/70 truncate">{hint || '\u00A0'}</div>
          {delta && (
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold"
              style={{
                backgroundColor: isDown ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.20)',
                color: '#fff',
              }}
            >
              {isDown ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {typeof delta.value === 'number' ? `${delta.value > 0 ? '+' : ''}${delta.value}%` : delta.value}
              {delta.label && <span className="opacity-80 font-medium ml-0.5">{delta.label}</span>}
            </div>
          )}
        </div>
        {/* shimmer bottom line */}
        <div className="absolute left-0 right-0 bottom-0 h-px shimmer-line" />
      </div>
    );
  }

  // DEFAULT premium-light variant (additive polish, fully back-compat)
  return (
    <div
      className={`relative overflow-hidden rounded-lg p-5 border premium-card-hover ${className}`}
      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)', boxShadow: 'var(--shadow-soft)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}66)` }} />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-muted)' }}>{label}</div>
          <div className="text-[24px] font-black mt-1.5 tracking-tight" style={{ color: 'var(--ink)' }}>{value}</div>
          {hint && <div className="text-[12px] mt-1" style={{ color: 'var(--ink-faint)' }}>{hint}</div>}
          {delta && (
            <div
              className="inline-flex items-center gap-1 mt-2 px-1.5 py-0.5 rounded text-[10.5px] font-bold"
              style={{
                backgroundColor: delta.direction === 'down' ? 'var(--accent-rose-bg)' : 'var(--accent-emerald-bg)',
                color: delta.direction === 'down' ? 'var(--accent-rose-fg)' : 'var(--accent-emerald-fg)',
              }}
            >
              {delta.direction === 'down' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {typeof delta.value === 'number' ? `${delta.value > 0 ? '+' : ''}${delta.value}%` : delta.value}
              {delta.label && <span className="opacity-80 font-medium ml-0.5">{delta.label}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}10)` }}>
            <Icon className="w-4 h-4" style={{ color: accentColor }} />
          </div>
        )}
      </div>
    </div>
  );
}

