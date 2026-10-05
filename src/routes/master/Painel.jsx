import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import { Building2, TrendingUp, DollarSign, UserPlus, Activity } from 'lucide-react';
import { fmtCurrency } from '@/lib/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MasterPainel() {
  const { data, isLoading } = useQuery({
    queryKey: ['master-painel'],
    queryFn: async () => {
      const { data: empresas } = await supabase.from('empresa').select('*');
      const total = empresas?.length || 0;
      const ativas = (empresas || []).filter(e => e.status === 'ativo').length;
      const trial  = (empresas || []).filter(e => e.status === 'trial').length;
      const susp   = (empresas || []).filter(e => e.status_cobranca === 'suspenso' || e.status_cobranca === 'cancelado').length;
      const mrr    = (empresas || []).filter(e => e.status_cobranca === 'ativo').reduce((s, e) => s + Number(e.valor || 0), 0);
      const churn  = total > 0 ? Math.round((susp / total) * 100) : 0;

      // cadastros por mes
      const map = {};
      (empresas || []).forEach(e => {
        const k = (e.created_at || '').slice(0, 7);
        if (!k) return;
        map[k] = (map[k] || 0) + 1;
      });
      const cadastros = Object.entries(map).map(([mes, total]) => ({ mes, total })).sort((a, b) => a.mes.localeCompare(b.mes));

      return { total, ativas, trial, susp, mrr, churn, cadastros };
    },
  });

  if (isLoading) return <div className="text-[13px]">Carregando…</div>;

  return (
    <div>
      <PageHeader title="Painel Master" subtitle="Visão geral do app" />
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Mensalidades cadastradas" value={fmtCurrency(data?.mrr || 0)} icon={DollarSign} accent="hsl(0 70% 35%)" />
        <KpiCard label="Empresas ativas" value={data?.ativas || 0} icon={Building2} accent="hsl(0 70% 35%)" />
        <KpiCard label="Em trial" value={data?.trial || 0} icon={Activity} accent="hsl(0 70% 35%)" />
        <KpiCard label="Suspensas/canceladas" value={`${data?.churn || 0}%`} icon={TrendingUp} accent="hsl(0 70% 35%)" />
      </div>
      <div className="rounded-lg border p-5" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
        <div className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ink-muted)' }}>Novos cadastros por mês</div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={data?.cadastros || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
              <XAxis dataKey="mes" stroke="var(--ink-muted)" fontSize={12} />
              <YAxis stroke="var(--ink-muted)" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="hsl(0 70% 35%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

