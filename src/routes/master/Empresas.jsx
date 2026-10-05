import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import Badge, { statusBadge } from '@/components/common/Badge';
import { Pause, Play, Ban, LogIn, Search } from 'lucide-react';
import { fmtCurrency, fmtDate } from '@/lib/format';
import { toast } from 'sonner';

export default function MasterEmpresas() {
  const qc = useQueryClient();
  const [filtro, setFiltro] = useState('todas');

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['master-empresas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('empresa').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const update = async (id, patch, msg) => {
    const { error } = await supabase.from('empresa').update(patch).eq('id', id);
    if (error) toast.error(error.message); else { toast.success(msg); qc.invalidateQueries({ queryKey: ['master-empresas'] }); }
  };

  const loginAs = async (emp) => {
    sessionStorage.setItem('autoflow-empresa',emp.id);window.location.assign('/app/dashboard');
  };

  const filtered = filtro === 'todas' ? rows : rows.filter(r => r.status === filtro || r.status_cobranca === filtro);

  return (
    <div>
      <PageHeader title="Empresas" subtitle="Gerencie todas as empresas do app" />

      <div className="flex gap-2 mb-4">
        {['todas', 'ativo', 'trial', 'suspenso', 'inativo'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className="px-3 py-1.5 rounded text-[12px] font-bold capitalize"
            style={{ backgroundColor: filtro === f ? 'var(--brand-master)' : 'var(--surface-raised)', color: filtro === f ? '#fff' : 'var(--ink)', border: '1px solid var(--line-soft)' }}>
            {f}
          </button>
        ))}
      </div>

      {isLoading ? <div className="text-[13px]">Carregando…</div> : (
        <DataTable rows={filtered} searchKeys={['nome', 'owner_email', 'cnpj']}
          columns={[
            { header: 'Empresa', render: r => (
              <div>
                <div className="font-semibold">{r.nome}</div>
                <div className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>{r.owner_email}</div>
              </div>
            )},
            { header: 'Plano', render: r => <Badge tone="blue">{r.plano}</Badge> },
            { header: 'Status', render: r => <Badge tone={statusBadge(r.status_cobranca)}>{r.status_cobranca}</Badge> },
            { header: 'Valor', render: r => fmtCurrency(r.valor) },
            { header: 'Criada', render: r => fmtDate(r.created_at) },
            { header: 'Ações', render: r => (
              <div className="flex gap-1 justify-end">
                {r.status_cobranca !== 'suspenso' ? (
                  <button onClick={() => update(r.id, { status_cobranca: 'suspenso', status: 'inativo' }, 'Suspensa')} title="Suspender" className="p-1.5 rounded hover:bg-black/5">
                    <Pause className="w-3.5 h-3.5" style={{ color: 'var(--status-amber-fg)' }} />
                  </button>
                ) : (
                  <button onClick={() => update(r.id, { status_cobranca: 'ativo', status: 'ativo' }, 'Reativada')} title="Reativar" className="p-1.5 rounded hover:bg-black/5">
                    <Play className="w-3.5 h-3.5" style={{ color: 'var(--status-green-fg)' }} />
                  </button>
                )}
                <button onClick={() => {
                  if (!confirm(`Cancelar definitivamente ${r.nome}?`)) return;
                  update(r.id, { status: 'inativo', status_cobranca: 'cancelado' }, 'Cancelada');
                }} title="Cancelar" className="p-1.5 rounded hover:bg-red-50">
                  <Ban className="w-3.5 h-3.5" style={{ color: 'var(--status-red-fg)' }} />
                </button>
                <button onClick={() => loginAs(r)} title="Gerenciar oficina" className="p-1.5 rounded hover:bg-black/5">
                  <LogIn className="w-3.5 h-3.5" style={{ color: 'var(--brand-master)' }} />
                </button>
              </div>
            )},
          ]} />
      )}
    </div>
  );
}

