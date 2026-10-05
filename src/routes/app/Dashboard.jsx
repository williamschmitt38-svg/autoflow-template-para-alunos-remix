import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useEmpresa } from '@/lib/empresa';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import { Users, Wrench, DollarSign, FileText, Car, Clock, CheckCircle2, TrendingUp, Sparkles, Calendar } from 'lucide-react';
import { fmtCurrency, fmtDate } from '@/lib/format';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area,
} from 'recharts';
import Badge, { statusBadge } from '@/components/common/Badge';

const Card = ({ children, className = '', title, eyebrow }) => (
  <div className={`rounded-xl border p-5 premium-card-hover ${className}`} style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)', boxShadow: 'var(--shadow-soft)' }}>
    {title && (
      <div className="flex items-center justify-between mb-4">
        <div>
          {eyebrow && <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--brand)' }}>{eyebrow}</div>}
          <div className="text-[13px] font-bold" style={{ color: 'var(--ink)' }}>{title}</div>
        </div>
      </div>
    )}
    {children}
  </div>
);

const statusCor = (k) => ({ aberta:'#3B6FA0', em_andamento:'#1C3F5E', aguardando_peca:'#D4A24C', concluida:'#10B981', cancelada:'#E11D48' }[k] || '#717171');
const statusLabel = (k) => ({ aberta:'Abertas', em_andamento:'Em andamento', aguardando_peca:'Aguard. peça', concluida:'Concluídas', cancelada:'Canceladas' }[k] || k);

export default function Dashboard() {
  const { empresaId, empresa } = useEmpresa();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
      const seisMesesAtras = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1).toISOString().slice(0, 10);
      const hoje = new Date().toISOString().slice(0,10);
      const em30 = new Date(Date.now()+30*86400000).toISOString().slice(0,10);

      const [clientes, veiculos, todasOs, orcPend, lancsMes, lancsHist, osRecentes, revisoes, clientesInat] = await Promise.all([
        supabase.from('cliente').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId).eq('status', 'ativo'),
        supabase.from('veiculo').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId),
        supabase.from('ordem_servico').select('status,total,data_abertura,data_conclusao').eq('empresa_id', empresaId),
        supabase.from('orcamento').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId).eq('status', 'pendente'),
        supabase.from('lancamento').select('valor,tipo').eq('empresa_id', empresaId).eq('status', 'confirmado').gte('data', inicioMes),
        supabase.from('lancamento').select('valor,tipo,data').eq('empresa_id', empresaId).eq('status', 'confirmado').gte('data', seisMesesAtras),
        supabase.from('ordem_servico').select('*').eq('empresa_id', empresaId).order('data_abertura', { ascending: false }).limit(6),
        supabase.from('veiculo').select('id,marca,modelo,placa,proxima_revisao').eq('empresa_id', empresaId).gte('proxima_revisao', hoje).lte('proxima_revisao', em30),
        supabase.from('cliente').select('id').eq('empresa_id', empresaId).eq('status', 'inativo'),
      ]);

      const allOs = todasOs.data || [];
      const porStatus = ['aberta','em_andamento','aguardando_peca','concluida'].map(k => ({
        status: statusLabel(k), valor: allOs.filter(o => o.status === k).length, color: statusCor(k),
      }));
      const osConcluidasMes = allOs.filter(o => o.status === 'concluida' && o.data_conclusao && o.data_conclusao >= inicioMes).length;
      const concluidas = allOs.filter(o => o.status === 'concluida');
      const ticketMedio = concluidas.length ? concluidas.reduce((s,o) => s + Number(o.total||0), 0) / concluidas.length : 0;

      const fatMes = (lancsMes.data || []).filter(l => l.tipo === 'entrada').reduce((s, l) => s + Number(l.valor), 0);
      const histMap = {};
      (lancsHist.data || []).filter(l => l.tipo === 'entrada').forEach(l => {
        const k = l.data.slice(0, 7);
        histMap[k] = (histMap[k] || 0) + Number(l.valor);
      });
      const meses = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
        const k = d.toISOString().slice(0, 7);
        meses.push({ mes: d.toLocaleDateString('pt-BR', { month: 'short' }), valor: histMap[k] || 0 });
      }
      return {
        clientesAtivos: clientes.count || 0,
        veiculosCount: veiculos.count || 0,
        osAbertas: allOs.filter(o => o.status === 'aberta').length,
        osAndamento: allOs.filter(o => o.status === 'em_andamento').length,
        osAguardando: allOs.filter(o => o.status === 'aguardando_peca').length,
        osConcluidasMes,
        orcamentosPendentes: orcPend.count || 0,
        faturamentoMes: fatMes,
        ticketMedio,
        historico: meses,
        porStatus,
        osRecentes: osRecentes.data || [],
        revisoesProximas: revisoes.data || [],
        clientesInativos: (clientesInat.data || []).length,
      };
    },
  });

  if (isLoading) return <div className="text-[13px]" style={{ color: 'var(--ink-muted)' }}>Carregando…</div>;

  return (
    <div>
      <PageHeader title={`Olá, ${empresa?.nome || ''}`} subtitle="Resumo da sua oficina hoje" />

      {/* KPIs cinematográficos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard variant="cinematic" tone="brand"   label="OS abertas"        value={data?.osAbertas ?? 0}        hint="Aguardando início" icon={Wrench}      className="delay-1" />
        <KpiCard variant="cinematic" tone="violet"  label="Em andamento"      value={data?.osAndamento ?? 0}      hint="Em execução"       icon={Clock}       className="delay-2" />
        <KpiCard variant="cinematic" tone="gold"    label="Aguardando peça"   value={data?.osAguardando ?? 0}     hint="Fila técnica"      icon={FileText}    className="delay-3" />
        <KpiCard variant="cinematic" tone="emerald" label="Concluídas no mês" value={data?.osConcluidasMes ?? 0}  hint="Entregues"         icon={CheckCircle2} className="delay-4" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard tone="emerald" label="Faturamento (mês)"    value={fmtCurrency(data?.faturamentoMes || 0)} icon={DollarSign}   className="animate-float-up delay-5" />
        <KpiCard tone="gold"    label="Ticket médio"         value={fmtCurrency(data?.ticketMedio || 0)}    icon={TrendingUp}   className="animate-float-up delay-6" />
        <KpiCard tone="brand"   label="Clientes ativos"      value={data?.clientesAtivos ?? 0}              icon={Users}        className="animate-float-up delay-7" />
        <KpiCard tone="violet"  label="Veículos cadastrados" value={data?.veiculosCount ?? 0}               icon={Car}          className="animate-float-up delay-8" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card title="Faturamento — últimos 6 meses" eyebrow="Receita" className="lg:col-span-2">
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={data?.historico || []}>
                <defs>
                  <linearGradient id="dashFat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#3B6FA0" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#1C3F5E" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
                <XAxis dataKey="mes" stroke="var(--ink-muted)" fontSize={12} />
                <YAxis stroke="var(--ink-muted)" fontSize={12} />
                <Tooltip formatter={(v) => fmtCurrency(v)} contentStyle={{ borderRadius: 8, border: '1px solid var(--line-soft)' }} />
                <Area type="monotone" dataKey="valor" stroke="#1C3F5E" strokeWidth={2.5} fill="url(#dashFat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="OS por status" eyebrow="Operação">
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data?.porStatus || []} dataKey="valor" nameKey="status" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {(data?.porStatus || []).map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Ordens de Serviço recentes" eyebrow="Atividade" className="lg:col-span-2">
          <div className="space-y-2">
            {(data?.osRecentes || []).map(os => (
              <div key={os.id} className="flex items-center justify-between text-[13px] py-2 border-b last:border-0" style={{ borderColor: 'var(--line-soft)' }}>
                <div>
                  <div className="font-semibold" style={{ color: 'var(--ink)' }}>{os.numero || os.id.slice(0, 8)}</div>
                  <div className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>{os.cliente_nome} · {fmtDate(os.data_abertura)}</div>
                </div>
                <Badge tone={statusBadge(os.status)}>{os.status}</Badge>
              </div>
            ))}
            {(data?.osRecentes || []).length === 0 && (
              <div className="text-[12px]" style={{ color: 'var(--ink-faint)' }}>Sem OS por enquanto.</div>
            )}
          </div>
        </Card>
        <Card title="Sugestões da IA" eyebrow="Growth">
          <div className="space-y-2.5">
            {(data?.clientesInativos ?? 0) > 0 && (
              <div className="p-3 rounded-lg text-[12.5px] border" style={{ backgroundColor: 'var(--brand-subtle)', borderColor: 'var(--brand-line)' }}>
                <div className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--brand)' }}><Sparkles className="w-3.5 h-3.5" /> {data.clientesInativos} clientes inativos</div>
                <div className="mt-0.5" style={{ color: 'var(--ink-2)' }}>Considere uma campanha de retorno por WhatsApp.</div>
              </div>
            )}
            {(data?.revisoesProximas || []).length > 0 && (
              <div className="p-3 rounded-lg text-[12.5px] border" style={{ backgroundColor: 'var(--accent-gold-bg)', borderColor: 'var(--accent-gold)' }}>
                <div className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--accent-gold-fg)' }}><Calendar className="w-3.5 h-3.5" /> {data.revisoesProximas.length} revisões em 30 dias</div>
                <div className="mt-0.5" style={{ color: 'var(--ink-2)' }}>Antecipe contato e agende já.</div>
              </div>
            )}
            {(data?.orcamentosPendentes ?? 0) > 0 && (
              <div className="p-3 rounded-lg text-[12.5px] border" style={{ backgroundColor: 'var(--accent-violet-bg)', borderColor: 'var(--accent-violet)' }}>
                <div className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--accent-violet-fg)' }}><FileText className="w-3.5 h-3.5" /> {data.orcamentosPendentes} orçamentos pendentes</div>
                <div className="mt-0.5" style={{ color: 'var(--ink-2)' }}>Faça follow-up dos que estão sem resposta.</div>
              </div>
            )}
            {(data?.clientesInativos ?? 0) === 0 && (data?.revisoesProximas || []).length === 0 && (data?.orcamentosPendentes ?? 0) === 0 && (
              <div className="text-[12px]" style={{ color: 'var(--ink-faint)' }}>Tudo em dia por aqui ✨</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

