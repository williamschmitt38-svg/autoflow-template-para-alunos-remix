import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';

/**
 * FormDialog generico — modal com campos configuráveis.
 * fields: [{ name, label, type, required, options, placeholder, rows }]
 *   type: text | email | tel | number | date | textarea | select
 */
export default function FormDialog({ open, onClose, title, fields, initial = {}, onSubmit, submitLabel = 'Salvar', busy }) {
  const [form, setForm] = useState(initial);

  useEffect(() => { if (open) setForm(initial || {}); /* eslint-disable-next-line */ }, [open]);

  if (!open) return null;

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const clean = {};
    fields.forEach(f => {
      let v = form[f.name];
      if (v === '' || v === undefined) v = null;
      if (v !== null && f.type === 'number') v = Number(v);
      clean[f.name] = v;
    });
    onSubmit(clean);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="rounded-lg w-full max-w-lg max-h-[90vh] overflow-auto" style={{ backgroundColor: 'var(--surface-raised)' }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--line-soft)' }}>
          <h3 className="text-lg font-black">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/5"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          {fields.map(f => (
            <div key={f.name}>
              <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-muted)' }}>
                {f.label}{f.required && ' *'}
              </label>
              {f.type === 'select' ? (
                <select required={f.required} value={form[f.name] ?? ''} onChange={e => set(f.name, e.target.value)}
                  className="w-full rounded border px-3 py-2 text-[13px]" style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--line)' }}>
                  <option value="">Selecione…</option>
                  {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea required={f.required} rows={f.rows || 3} value={form[f.name] ?? ''} onChange={e => set(f.name, e.target.value)}
                  placeholder={f.placeholder} className="w-full rounded border px-3 py-2 text-[13px]"
                  style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--line)' }} />
              ) : (
                <input type={f.type || 'text'} required={f.required} value={form[f.name] ?? ''} onChange={e => set(f.name, e.target.value)}
                  placeholder={f.placeholder} className="w-full rounded border px-3 py-2 text-[13px]"
                  style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--line)' }} />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded text-[13px] border" style={{ borderColor: 'var(--line)' }}>Cancelar</button>
            <button type="submit" disabled={busy} className="px-4 py-2 rounded text-[13px] font-bold text-white flex items-center gap-2 disabled:opacity-60" style={{ backgroundColor: 'var(--brand)' }}>
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

