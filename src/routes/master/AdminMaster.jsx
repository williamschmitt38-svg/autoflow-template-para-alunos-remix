import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import SuperAdminGuard from '@/components/common/SuperAdminGuard';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import Badge from '@/components/common/Badge';
import { fmtCurrency, fmtDate } from '@/lib/format';
import { Building2, TrendingUp, DollarSign, Activity, Users, Percent, MapPin } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminMaster() {
  useDocumentTitle('Admin Master');
  return (
    <SuperAdminGuard>
      <AdminContent />
    </SuperAdminGuard>
  );
}

function AdminContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-master'],
    queryFn: async () => {
      const { data: empresas } = await supabase.from('empresa').select('*');
      const list = empresas || [];
      const total = list.length;
      const ativas = list.filter((e) => e.status === 'ativo').length;
      const trial = list.filter((e) => e.status === 'trial').length;
      const susp = list.filter((e) => ['suspenso', 'cancelado'].includes(e.status_cobranca)).length;
      const mrr = list.filter((e) => e.status_cobranca === 'ativo').reduce((s, e) => s + Number(e.valor || 0), 0);
      const arr = mrr * 12;
      const churn = total ? Math.round((susp / total) * 100) : 0;

      const map = {};
      list.forEach((e) => {
        const k = (e.created_at || '').slice(0, 7);
        if (k) map[k] = (map[k] || 0) + Number(e.valor || 0);
      });
      const mrrTrend = Object.entries(map).sort().slice(-12).map(([mes, valor]) => ({ mes, valor }));

      const porPlano = {};
      list.forEach((e) => { porPlano[e.plano] = (porPlano[e.plano] || 0) + 1; });
      const planoArr = Object.entries(porPlano).map(([plano, count]) => ({ plano, count }));

      // Top performers — usando faturamento (valor mensal proxy)
      const top = [...list].sort((a, b) => Number(b.valor || 0) - Number(a.valor || 0)).slice(0, 5);

      // Cidades extraidas do endereco (heuristica simples)
      const cidades = {};
      list.forEach((e) => {
        const c = (e.endereco || '').split(',').slice(-1)[0]?.trim() || 'Sem cidade';
        cidades[c] = (cidades[c] || 0) + 1;
      });
      const cidadesArr = Object.entries(cidades).map(([nome, count]) => ({ nome, count })).sort((a, b) => b.count - a.count);

      return { list, total, ativas, trial, susp, mrr, arr, churn, mrrTrend, planoArr, top, cidadesArr };
    },
  });

  if (isLoading) return <div className="text-[13px]">Carregando…</div>;

  return (
    <div>
      <PageHeader title="Admin Master" subtitle="Visão global do AutoFlow AI" />

      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <KpiCard label="Mensalidades cadastradas" value={fmtCurrency(data?.mrr || 0)} icon={DollarSign} accent="hsl(0 70% 35%)" />
        <KpiCard label="Projeção anual de planos" value={fmtCurrency(data?.arr || 0)} icon={TrendingUp} accent="hsl(0 70% 35%)" />
        <KpiCard label="Total oficinas" value={data?.total || 0} icon={Building2} accent="hsl(0 70% 35%)" />
        <KpiCard label="Ativas" value={data?.ativas || 0} icon={Activity} accent="hsl(0 70% 35%)" />
        <KpiCard label="Trial" value={data?.trial || 0} icon={Users} accent="hsl(0 70% 35%)" />
        <KpiCard label="Suspensas/canceladas" value={`${data?.churn || 0}%`} icon={Percent} accent="hsl(0 70% 35%)" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-5">
        <Card title="Valores de planos por mês de cadastro">
          <ResponsiveContainer>
            <LineChart data={data?.mrrTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
              <XAxis dataKey="mes" stroke="var(--ink-muted)" fontSize={11} />
              <YAxis stroke="var(--ink-muted)" fontSize={11} />
              <Tooltip formatter={(v) => fmtCurrency(v)} />
              <Line type="monotone" dataKey="valor" stroke="hsl(0 70% 35%)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Oficinas por plano">
          <ResponsiveContainer>
            <BarChart data={data?.planoArr || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
              <XAxis dataKey="plano" stroke="var(--ink-muted)" fontSize={11} />
              <YAxis stroke="var(--ink-muted)" fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(0 70% 35%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Top 5 performers (por valor)">
          <div className="space-y-2">
            {(data?.top || []).map((e, i) => (
              <div key={e.id} className="flex items-center gap-3 p-2.5 rounded" style={{ backgroundColor: 'var(--surface-sunken)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-white text-[12px]" style={{ backgroundColor: 'hsl(0 70% 35%)' }}>{i + 1}</div>
                <div className="flex-1">
                  <div className="font-semibold text-[13px]">{e.nome}</div>
                  <div className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>{e.plano} • {e.owner_email}</div>
                </div>
                <div className="font-bold text-[13px]">{fmtCurrency(e.valor)}</div>
              </div>
            ))}
            {!data?.top?.length && <div className="text-[12px]" style={{ color: 'var(--ink-muted)' }}>Sem oficinas ainda.</div>}
          </div>
        </Card>

        <Card title="Distribuição por cidade">
          <div className="space-y-2">
            {(data?.cidadesArr || []).map((c) => (
              <div key={c.nome} className="flex items-center gap-3 p-2.5 rounded" style={{ backgroundColor: 'var(--surface-sunken)' }}>
                <MapPin className="w-4 h-4" style={{ color: 'hsl(0 70% 35%)' }} />
                <div className="flex-1 font-semibold text-[13px]">{c.nome}</div>
                <Badge tone="red">{c.count} oficina{c.count > 1 ? 's' : ''}</Badge>
              </div>
            ))}
            {!data?.cidadesArr?.length && <div className="text-[12px]" style={{ color: 'var(--ink-muted)' }}>Sem dados geográficos.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}

const Card = ({ title, children }) => (
  <div className="rounded-lg border p-5" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
    <div className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ink-muted)' }}>{title}</div>
    <div style={{ width: '100%', minHeight: 220 }}>{children}</div>
  </div>
);

