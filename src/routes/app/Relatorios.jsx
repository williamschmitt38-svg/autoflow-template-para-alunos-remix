import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useEmpresa } from '@/lib/empresa';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import { fmtCurrency } from '@/lib/format';
import { TrendingUp, CheckCircle2, Receipt, Percent, Printer, Trophy } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CORES = ['#1C3F5E', '#3B6FA0', '#10B981', '#D4A24C', '#7C3AED', '#E11D48', '#0EA5E9'];
const DOW = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

const Card = ({ title, eyebrow, children, className = '' }) => (
  <div className={`rounded-xl border p-5 premium-card-hover ${className}`} style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)', boxShadow: 'var(--shadow-soft)' }}>
    <div className="mb-4">
      {eyebrow && <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--brand)' }}>{eyebrow}</div>}
      <div className="text-[13px] font-bold" style={{ color: 'var(--ink)' }}>{title}</div>
    </div>
    <div style={{ width: '100%', height: 250 }}>{children}</div>
  </div>
);

export default function Relatorios() {
  useDocumentTitle('Relatórios');
  const { empresaId } = useEmpresa();
  const [periodo, setPeriodo] = useState('mes');

  const { data, isLoading } = useQuery({
    queryKey: ['relatorios', empresaId, periodo],
    enabled: !!empresaId,
    queryFn: async () => {
      const [os, lancs, orcs, veics] = await Promise.all([
        supabase.from('ordem_servico').select('*').eq('empresa_id', empresaId),
        supabase.from('lancamento').select('*').eq('empresa_id', empresaId).eq('status', 'confirmado'),
        supabase.from('orcamento').select('status,total,data').eq('empresa_id', empresaId),
        supabase.from('veiculo').select('marca,modelo').eq('empresa_id', empresaId),
      ]);

      const entradas = (lancs.data || []).filter((l) => l.tipo === 'entrada');

      // Faturamento 12m
      const fat = {};
      entradas.forEach((l) => { const k = l.data?.slice(0, 7); if (k) fat[k] = (fat[k] || 0) + Number(l.valor || 0); });
      const fat12 = Object.entries(fat).sort().slice(-12).map(([mes, valor]) => ({ mes, valor }));

      // Ranking dos melhores dias (últimos 90d, top 7)
      const d90 = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
      const diaMap = {};
      entradas.filter((l) => l.data && l.data >= d90).forEach((l) => {
        diaMap[l.data] = (diaMap[l.data] || 0) + Number(l.valor || 0);
      });
      const melhoresDias = Object.entries(diaMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([data, valor]) => {
          const d = new Date(data + 'T00:00');
          return { data, label: `${DOW[d.getDay()]} ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`, valor };
        });

      // OS por tecnico
      const tec = {};
      (os.data || []).forEach((o) => { const t = o.tecnico || 'Sem técnico'; tec[t] = (tec[t] || 0) + 1; });
      const tecArr = Object.entries(tec).map(([tecnico, count]) => ({ tecnico, count }));

      // Top 5 servicos
      const serv = {};
      (os.data || []).forEach((o) => (o.itens || []).forEach((it) => { serv[it.descricao] = (serv[it.descricao] || 0) + Number(it.quantidade || 0); }));
      const topServ = Object.entries(serv).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([nome, qtd]) => ({ nome, qtd }));

      // Taxa aprovacao
      const aprov = (orcs.data || []).filter((o) => o.status === 'aprovado').length;
      const pend  = (orcs.data || []).filter((o) => o.status === 'pendente').length;
      const recu  = (orcs.data || []).filter((o) => o.status === 'recusado').length;
      const total = aprov + pend + recu;
      const aprovacao = total ? Math.round((aprov / total) * 100) : 0;
      const taxaArr = [
        { name: 'Aprovados', value: aprov, color: '#10B981' },
        { name: 'Pendentes', value: pend,  color: '#D4A24C' },
        { name: 'Recusados', value: recu,  color: '#E11D48' },
      ];

      // Marcas
      const marca = {};
      (veics.data || []).forEach((v) => { marca[v.marca] = (marca[v.marca] || 0) + 1; });
      const tipos = Object.entries(marca).map(([name, value]) => ({ name, value }));

      // KPIs 30d
      const d30 = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const fat30 = entradas.filter((l) => l.data >= d30).reduce((s, l) => s + Number(l.valor || 0), 0);
      const os30  = (os.data || []).filter((o) => o.status === 'concluida' && o.data_abertura >= d30);
      const ticket = os30.length ? os30.reduce((s, o) => s + Number(o.total || 0), 0) / os30.length : 0;

      return { fat12, melhoresDias, tecArr, topServ, taxaArr, tipos, fat30, os30: os30.length, ticket, aprovacao };
    },
  });

  if (isLoading) return <div className="text-[13px]">Carregando…</div>;

  return (
    <div>
      <PageHeader title="Relatórios" subtitle="Análise da performance da oficina" actions={
        <div className="flex gap-2">
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="px-3 py-2 rounded-lg border text-[12px]" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line)' }}>
            <option value="mes">Mês</option><option value="trimestre">Trimestre</option><option value="ano">Ano</option>
          </select>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold text-white shadow-md hover:shadow-lg transition" style={{ background: 'var(--grad-brand)' }}>
            <Printer className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      } />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard variant="cinematic" tone="emerald" label="Faturamento 30d"  value={fmtCurrency(data?.fat30 || 0)} hint="Entradas confirmadas" icon={TrendingUp}    className="delay-1" />
        <KpiCard variant="cinematic" tone="brand"   label="OS concluídas 30d" value={data?.os30 || 0}              hint="Entregues no período"  icon={CheckCircle2}  className="delay-2" />
        <KpiCard variant="cinematic" tone="gold"    label="Ticket médio"      value={fmtCurrency(data?.ticket || 0)} hint="Por OS concluída"    icon={Receipt}       className="delay-3" />
        <KpiCard variant="cinematic" tone="violet"  label="Taxa aprovação"    value={`${data?.aprovacao || 0}%`}     hint="Orçamentos aprovados" icon={Percent}      className="delay-4" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card title="Faturamento — últimos 12 meses" eyebrow="Receita" className="lg:col-span-2">
          <ResponsiveContainer>
            <AreaChart data={data?.fat12 || []}>
              <defs>
                <linearGradient id="rel12" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#3B6FA0" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#1C3F5E" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
              <XAxis dataKey="mes" stroke="var(--ink-muted)" fontSize={11} />
              <YAxis stroke="var(--ink-muted)" fontSize={11} />
              <Tooltip formatter={(v) => fmtCurrency(v)} contentStyle={{ borderRadius: 8, border: '1px solid var(--line-soft)' }} />
              <Area type="monotone" dataKey="valor" stroke="#1C3F5E" strokeWidth={2.5} fill="url(#rel12)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Melhores dias (90d)" eyebrow="Ranking">
          {(!data?.melhoresDias || data.melhoresDias.length === 0) ? (
            <div className="h-full flex items-center justify-center text-[12px]" style={{ color: 'var(--ink-faint)' }}>Sem dados.</div>
          ) : (
            <div className="space-y-2 h-full overflow-auto">
              {data.melhoresDias.map((d, i) => {
                const max = data.melhoresDias[0].valor || 1;
                const pct = Math.round((d.valor / max) * 100);
                return (
                  <div key={d.data} className="relative rounded-lg border p-2.5 overflow-hidden" style={{ borderColor: 'var(--line-soft)', backgroundColor: 'var(--surface-sunken)' }}>
                    <div className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, background: i === 0 ? 'linear-gradient(90deg, #D4A24C30, transparent)' : 'linear-gradient(90deg, #1C3F5E20, transparent)' }} />
                    <div className="relative flex items-center justify-between text-[12.5px]">
                      <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--ink)' }}>
                        {i === 0 && <Trophy className="w-3.5 h-3.5" style={{ color: '#D4A24C' }} />}
                        <span className="text-[10px] font-black w-5" style={{ color: 'var(--ink-muted)' }}>#{i + 1}</span>
                        {d.label}
                      </div>
                      <div className="font-black" style={{ color: 'var(--brand)' }}>{fmtCurrency(d.valor)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="OS por técnico" eyebrow="Equipe">
          <ResponsiveContainer>
            <BarChart data={data?.tecArr || []}>
              <defs>
                <linearGradient id="relTec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#3B6FA0" />
                  <stop offset="100%" stopColor="#1C3F5E" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
              <XAxis dataKey="tecnico" stroke="var(--ink-muted)" fontSize={11} />
              <YAxis stroke="var(--ink-muted)" fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="url(#relTec)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top 5 serviços" eyebrow="Demanda">
          <ResponsiveContainer>
            <BarChart data={data?.topServ || []} layout="vertical">
              <defs>
                <linearGradient id="relServ" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#1C3F5E" />
                  <stop offset="100%" stopColor="#3B6FA0" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
              <XAxis type="number" stroke="var(--ink-muted)" fontSize={11} allowDecimals={false} />
              <YAxis dataKey="nome" type="category" stroke="var(--ink-muted)" fontSize={11} width={130} />
              <Tooltip />
              <Bar dataKey="qtd" fill="url(#relServ)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Taxa de aprovação de orçamentos" eyebrow="Conversão">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data?.taxaArr || []} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {(data?.taxaArr || []).map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Distribuição por marca" eyebrow="Frota">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data?.tipos || []} dataKey="value" nameKey="name" outerRadius={100} label>
                {(data?.tipos || []).map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <style>{`@media print { .no-print, button, select { display: none !important; } }`}</style>
    </div>
  );
}

