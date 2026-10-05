import { useState } from 'react';
import { Search } from 'lucide-react';

/** Tabela leve com busca cliente-side */
export default function DataTable({ rows, columns, searchKeys = [], emptyLabel = 'Nenhum registro.' }) {
  const [q, setQ] = useState('');
  const filtered = !q.trim() ? rows : rows.filter(r =>
    searchKeys.some(k => String(r[k] ?? '').toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
      {searchKeys.length > 0 && (
        <div className="p-3 border-b" style={{ borderColor: 'var(--line-soft)' }}>
          <div className="relative max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-faint)' }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar..."
              className="w-full pl-9 pr-3 py-2 text-[13px] rounded border focus:outline-none"
              style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--line)' }} />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-sunken)' }}>
              {columns.map((c, i) => (
                <th key={i} className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-muted)' }}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-[13px]" style={{ color: 'var(--ink-faint)' }}>{emptyLabel}</td></tr>
            )}
            {filtered.map((row, idx) => (
              <tr key={row.id || idx} className="border-t" style={{ borderColor: 'var(--line-soft)' }}>
                {columns.map((c, i) => (
                  <td key={i} className="px-4 py-2.5" style={{ color: 'var(--ink)' }}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

