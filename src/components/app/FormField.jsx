const baseInput = "w-full rounded border px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]";
const baseStyle = { backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--line)' };

export function FormField({ label, required, error, hint, children }) {
  return (
    <div className="mb-3">
      {label && (
        <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-muted)' }}>
          {label}{required && <span style={{ color: 'var(--status-red-fg)' }}> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <div className="text-[11px] mt-1" style={{ color: 'var(--ink-muted)' }}>{hint}</div>}
      {error && <div className="text-[11px] mt-1" style={{ color: 'var(--status-red-fg)' }}>{error}</div>}
    </div>
  );
}

export function Input({ label, required, error, hint, ...props }) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <input {...props} className={baseInput} style={baseStyle} />
    </FormField>
  );
}

export function NumberInput(props) { return <Input type="number" step="any" {...props} />; }
export function DateInput(props) { return <Input type="date" {...props} />; }

export function Textarea({ label, required, error, hint, rows = 3, ...props }) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <textarea rows={rows} {...props} className={baseInput} style={baseStyle} />
    </FormField>
  );
}

export function Select({ label, required, error, hint, options = [], placeholder = 'Selecione…', ...props }) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <select {...props} className={baseInput} style={baseStyle}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </FormField>
  );
}

export default FormField;

