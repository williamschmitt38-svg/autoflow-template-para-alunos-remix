import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import SuperAdminGuard from '@/components/common/SuperAdminGuard';
import PageHeader from '@/components/common/PageHeader';
import Badge, { statusBadge } from '@/components/common/Badge';
import { fmtCurrency, fmtDate } from '@/lib/format';
import { Plus, Search } from 'lucide-react';

export default function MasterPanelReal() {
  useDocumentTitle('Painel Master');
  return <SuperAdminGuard><Content /></SuperAdminGuard>;
}

function Content() {
  const nav = useNavigate();
  const [search, setSearch] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [fPlano, setFPlano] = useState('');

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['empresas-master'],
    queryFn: async () => (await supabase.from('empresa').select('*').order('created_at', { ascending: false })).data || [],
  });

  const planos = useMemo(() => Array.from(new Set(rows.map((r) => r.plano).filter(Boolean))), [rows]);

  const filtered = useMemo(() => rows.filter((r) => {
    if (fStatus && r.status !== fStatus) return false;
    if (fPlano && r.plano !== fPlano) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!(r.nome?.toLowerCase().includes(s) || r.owner_email?.toLowerCase().includes(s) || r.endereco?.toLowerCase().includes(s))) return false;
    }
    return true;
  }), [rows, fStatus, fPlano, search]);

  return (
    <div>
      <PageHeader title="Painel Master" subtitle={`${rows.length} oficinas cadastradas`} actions={
        <button onClick={() => nav('/master/nova-empresa')} className="flex items-center gap-2 px-4 py-2 rounded text-[13px] font-bold text-white" style={{ backgroundColor: 'hsl(0 70% 35%)' }}>
          <Plus className="w-4 h-4" /> Nova oficina
        </button>
      } />

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded border flex-1 min-w-[240px]" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line)' }}>
          <Search className="w-4 h-4" style={{ color: 'var(--ink-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar oficina, e-mail ou endereço…" className="flex-1 text-[13px] bg-transparent outline-none" />
        </div>
        <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="px-3 py-2 rounded border text-[12px]" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line)' }}>
          <option value="">Todos status</option><option value="ativa">Ativas</option><option value="trial">Trial</option><option value="inativa">Inativas</option>
        </select>
        <select value={fPlano} onChange={(e) => setFPlano(e.target.value)} className="px-3 py-2 rounded border text-[12px]" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line)' }}>
          <option value="">Todos planos</option>
          {planos.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {isLoading ? <div className="text-[13px]">Carregando…</div> : (
        <div className="rounded-lg border overflow-x-auto" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
          <table className="w-full text-[12.5px] min-w-[1000px]">
            <thead style={{ backgroundColor: 'var(--surface-sunken)' }}>
              <tr>
                {['Oficina', 'Cidade', 'Plano', 'Status', 'Cobrança', 'Valor', 'Início', 'Owner'].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--ink-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const cidade = (r.endereco || '').split(',').slice(-1)[0]?.trim() || '—';
                return (
                  <tr key={r.id} className="border-t hover:bg-black/5 cursor-pointer" style={{ borderColor: 'var(--line-soft)' }} onClick={() => nav('/master/empresas')}>
                    <td className="px-3 py-2.5 font-semibold">{r.nome}</td>
                    <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{cidade}</td>
                    <td className="px-3 py-2.5"><Badge tone="blue">{r.plano}</Badge></td>
                    <td className="px-3 py-2.5"><Badge tone={statusBadge(r.status)}>{r.status}</Badge></td>
                    <td className="px-3 py-2.5"><Badge tone={statusBadge(r.status_cobranca)}>{r.status_cobranca}</Badge></td>
                    <td className="px-3 py-2.5 font-semibold">{fmtCurrency(r.valor || 0)}</td>
                    <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{fmtDate(r.data_inicio || r.created_at)}</td>
                    <td className="px-3 py-2.5 text-[11px]" style={{ color: 'var(--ink-muted)' }}>{r.owner_email}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-[12px]" style={{ color: 'var(--ink-muted)' }}>Nenhuma oficina encontrada.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

