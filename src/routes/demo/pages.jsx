import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import KpiCard from '@/components/common/KpiCard';
import Badge, { statusBadge } from '@/components/common/Badge';
import { fmtCurrency, fmtDate } from '@/lib/format';
import {
  demoEmpresa, demoClientes, demoVeiculos, demoOrcamentos, demoOrdens, demoLancamentos,
  demoFaturamentoMensal, demoOsPorStatus, demoEquipe, demoAIInsights, demoDashboardStats,
  demoAtividade, demoProximasAcoes,
} from '@/lib/demo-data';
import {
  Users, Wrench, DollarSign, FileText, Sparkles, Lock, Car, TrendingUp, TrendingDown, Clock,
  CheckCircle2, AlertCircle, MessageSquare, Calendar, ArrowRight, FileQuestion, Wallet, Receipt, Percent, Trophy
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CtaBanner = () => (
  <div className="rounded-lg border p-4 mb-5 flex items-center justify-between flex-wrap gap-3" style={{ backgroundColor: 'var(--brand-subtle)', borderColor: 'var(--brand-line)' }}>
    <div className="flex items-center gap-3">
      <Sparkles className="w-5 h-5" style={{ color: 'var(--brand)' }} />
      <div>
        <div className="text-[13px] font-bold" style={{ color: 'var(--brand)' }}>Você está em modo demonstração</div>
        <div className="text-[11px]" style={{ color: 'var(--ink-2)' }}>Crie sua conta gratuita e use com os seus dados reais — 14 dias grátis.</div>
      </div>
    </div>
    <Link to="/login" className="px-4 py-2 rounded text-[13px] font-bold text-white" style={{ backgroundColor: 'var(--brand)' }}>Criar conta grátis</Link>
  </div>
);

const Disabled = ({ label }) => (
  <button title="Disponível após criar conta" className="px-3 py-1.5 rounded text-[12px] font-bold flex items-center gap-1.5 opacity-60 cursor-not-allowed" style={{ backgroundColor: 'var(--surface-sunken)', color: 'var(--ink-muted)' }}>
    <Lock className="w-3 h-3" /> {label}
  </button>
);

const Card = ({ children, className = '', title, eyebrow }) => (
  <div className={`rounded-xl border p-5 premium-card-hover ${className}`} style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)', boxShadow: 'var(--shadow-soft)' }}>
    {title && (
      <div className="mb-4">
        {eyebrow && <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--brand)' }}>{eyebrow}</div>}
        <div className="text-[13px] font-bold" style={{ color: 'var(--ink)' }}>{title}</div>
      </div>
    )}
    {children}
  </div>
);

// ====================== DASHBOARD ======================
export function DemoDashboard() {
  const s = demoDashboardStats;
  return (
    <div>
      <CtaBanner />
      <PageHeader title={`Olá, ${demoEmpresa.nome}`} subtitle="Resumo da oficina hoje (dados fictícios)" />

      {/* KPIs cinematográficos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard variant="cinematic" tone="brand"   label="OS abertas"           value={s.os_abertas}                hint="Aguardando início" icon={Wrench}       className="delay-1" />
        <KpiCard variant="cinematic" tone="violet"  label="Veículos em atend."   value={s.veiculos_em_atendimento}   hint="Na oficina hoje"   icon={Car}          className="delay-2" />
        <KpiCard variant="cinematic" tone="gold"    label="Orçamentos pendentes" value={s.orcamentos_pendentes}      hint="Para follow-up"    icon={FileText}     className="delay-3" />
        <KpiCard variant="cinematic" tone="emerald" label="Concluídas hoje"      value={s.os_concluidas_hoje}        hint="Entregues"         icon={CheckCircle2} className="delay-4" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard tone="emerald" label="Faturamento (mês)" value={fmtCurrency(s.faturamento)}    icon={DollarSign} delta={{ value: 12, direction: 'up' }} className="animate-float-up delay-5" />
        <KpiCard tone="gold"    label="Ticket médio"      value={fmtCurrency(s.ticket)}         icon={TrendingUp} className="animate-float-up delay-6" />
        <KpiCard tone="brand"   label="A receber"         value={fmtCurrency(s.contas_receber)} icon={Wallet}     className="animate-float-up delay-7" />
        <KpiCard tone="violet"  label="Taxa aprovação"    value={`${s.taxa_aprovacao}%`}        icon={Percent}    className="animate-float-up delay-8" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card title="Faturamento — últimos 6 meses" eyebrow="Receita" className="lg:col-span-2">
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={demoFaturamentoMensal}>
                <defs>
                  <linearGradient id="demoFat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#3B6FA0" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#1C3F5E" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
                <XAxis dataKey="mes" stroke="var(--ink-muted)" fontSize={12} />
                <YAxis stroke="var(--ink-muted)" fontSize={12} />
                <Tooltip formatter={(v) => fmtCurrency(v)} contentStyle={{ borderRadius: 8, border: '1px solid var(--line-soft)' }} />
                <Area type="monotone" dataKey="valor" stroke="#1C3F5E" strokeWidth={2.5} fill="url(#demoFat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="OS por status" eyebrow="Operação">
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={demoOsPorStatus} dataKey="valor" nameKey="status" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {demoOsPorStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Últimas atividades" eyebrow="Linha do tempo" className="lg:col-span-2">
          <div className="space-y-2">
            {demoAtividade.map(a => (
              <div key={a.id} className="flex items-start gap-3 text-[13px] py-2 border-b last:border-0" style={{ borderColor: 'var(--line-soft)' }}>
                <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: 'var(--brand)' }} />
                <div className="flex-1">
                  <div style={{ color: 'var(--ink)' }}>{a.texto}</div>
                  <div className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>{fmtDate(a.quando)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Próximas ações" eyebrow="Agenda">
          <div className="space-y-2">
            {demoProximasAcoes.map(p => (
              <div key={p.id} className="p-3 rounded-lg text-[12.5px] border" style={{ backgroundColor: 'var(--brand-subtle)', borderColor: 'var(--brand-line)' }}>
                <div style={{ color: 'var(--ink)' }}>{p.texto}</div>
                <div className="text-[11px] mt-1 flex items-center gap-1 font-semibold" style={{ color: 'var(--brand)' }}>
                  <Calendar className="w-3 h-3" /> {p.quando}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card title="Sugestões da IA" eyebrow="Growth">
          <div className="grid md:grid-cols-2 gap-3">
            {demoAIInsights.slice(0, 2).map(ai => (
              <div key={ai.id} className="p-3 rounded-lg border flex items-start gap-3" style={{ backgroundColor: 'var(--accent-violet-bg)', borderColor: 'var(--accent-violet)' }}>
                <Sparkles className="w-4 h-4 mt-0.5" style={{ color: 'var(--accent-violet-fg)' }} />
                <div className="min-w-0">
                  <div className="text-[13px] font-bold" style={{ color: 'var(--accent-violet-fg)' }}>{ai.titulo}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: 'var(--ink-2)' }}>{ai.descricao}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ====================== CLIENTES ======================
export function DemoClientes() {
  return (
    <div>
      <CtaBanner />
      <PageHeader title="Clientes" subtitle={`${demoClientes.length} clientes cadastrados`} actions={<Disabled label="Novo cliente" />} />
      <DataTable rows={demoClientes} searchKeys={['nome', 'telefone', 'email']}
        columns={[
          { header: 'Nome', key: 'nome' },
          { header: 'Telefone', key: 'telefone' },
          { header: 'E-mail', key: 'email' },
          { header: 'Tags', render: r => (
            <div className="flex gap-1 flex-wrap">
              {r.tags?.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: 'var(--brand-subtle)', color: 'var(--brand)' }}>{t}</span>)}
            </div>
          )},
          { header: 'Status', render: r => <Badge tone={statusBadge(r.status)}>{r.status}</Badge> },
        ]} />
    </div>
  );
}

// ====================== VEICULOS (cards) ======================
export function DemoVeiculos() {
  const today = new Date('2026-05-23');
  const diasParaRevisao = (d) => Math.ceil((new Date(d) - today) / 86400000);
  return (
    <div>
      <CtaBanner />
      <PageHeader title="Veículos" subtitle={`${demoVeiculos.length} veículos cadastrados`} actions={<Disabled label="Novo veículo" />} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoVeiculos.map(v => {
          const dias = diasParaRevisao(v.proxima_revisao);
          const alerta = dias <= 30;
          return (
            <div key={v.id} className="rounded-lg border p-5" style={{ backgroundColor: 'var(--surface-raised)', borderColor: alerta ? 'var(--status-red-fg)' : 'var(--line-soft)' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-[15px]" style={{ color: 'var(--ink)' }}>{v.marca} {v.modelo}</div>
                  <div className="text-[12px]" style={{ color: 'var(--ink-muted)' }}>{v.cliente_nome}</div>
                </div>
                <div className="px-2 py-1 rounded text-[11px] font-mono font-bold" style={{ backgroundColor: 'var(--surface-sunken)', color: 'var(--ink)' }}>{v.placa}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] mb-3" style={{ color: 'var(--ink-muted)' }}>
                <div><div className="font-semibold" style={{ color: 'var(--ink-2)' }}>Ano</div>{v.ano}</div>
                <div><div className="font-semibold" style={{ color: 'var(--ink-2)' }}>Cor</div>{v.cor}</div>
                <div><div className="font-semibold" style={{ color: 'var(--ink-2)' }}>KM</div>{v.quilometragem.toLocaleString('pt-BR')}</div>
              </div>
              {alerta && (
                <div className="flex items-center gap-2 px-2.5 py-2 rounded text-[12px]" style={{ backgroundColor: 'var(--status-red-bg)', color: 'var(--status-red-fg)' }}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  Revisão em {dias} dia{dias===1?'':'s'} ({fmtDate(v.proxima_revisao)})
                </div>
              )}
              {!alerta && (
                <div className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>Próxima revisão: {fmtDate(v.proxima_revisao)}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ====================== ORÇAMENTOS ======================
export function DemoOrcamentos() {
  return (
    <div>
      <CtaBanner />
      <PageHeader title="Orçamentos" subtitle={`${demoOrcamentos.length} orçamentos`} actions={<Disabled label="Novo orçamento" />} />
      <DataTable rows={demoOrcamentos} searchKeys={['numero', 'cliente_nome']}
        columns={[
          { header: 'Nº', key: 'numero' },
          { header: 'Cliente', key: 'cliente_nome' },
          { header: 'Veículo', key: 'veiculo_desc' },
          { header: 'Itens', render: r => `${r.itens?.length ?? 0}` },
          { header: 'Data', render: r => fmtDate(r.data) },
          { header: 'Total', render: r => <span className="font-semibold">{fmtCurrency(r.total)}</span> },
          { header: 'Status', render: r => <Badge tone={statusBadge(r.status)}>{r.status}</Badge> },
        ]} />
    </div>
  );
}

// ====================== ORDENS (Kanban) ======================
const COLUNAS = [
  { key: 'aberta',          label: 'Abertas',          color: '#1A4B7A' },
  { key: 'em_andamento',    label: 'Em andamento',     color: '#1C3F5E' },
  { key: 'aguardando_peca', label: 'Aguardando peça',  color: '#8A5A0A' },
  { key: 'concluida',       label: 'Concluídas',       color: '#1A6B3A' },
];

const prioCor = (p) => p === 'alta' ? 'var(--status-red-fg)' : p === 'baixa' ? 'var(--ink-muted)' : 'var(--brand)';

export function DemoOrdens() {
  return (
    <div>
      <CtaBanner />
      <PageHeader title="Ordens de Serviço" subtitle={`${demoOrdens.length} OS no total`} actions={<Disabled label="Nova OS" />} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUNAS.map(col => {
          const ordens = demoOrdens.filter(o => o.status === col.key);
          return (
            <div key={col.key} className="rounded-lg p-3" style={{ backgroundColor: 'var(--surface-sunken)' }}>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <div className="text-[12px] font-bold" style={{ color: 'var(--ink)' }}>{col.label}</div>
                </div>
                <div className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--ink-muted)' }}>{ordens.length}</div>
              </div>
              <div className="space-y-2">
                {ordens.map(os => (
                  <div key={os.id} className="rounded p-3 border" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-bold text-[12px]" style={{ color: 'var(--brand)' }}>{os.numero}</div>
                      <div className="text-[10px] font-bold uppercase" style={{ color: prioCor(os.prioridade) }}>{os.prioridade}</div>
                    </div>
                    <div className="text-[12.5px] font-semibold mb-0.5" style={{ color: 'var(--ink)' }}>{os.cliente_nome}</div>
                    <div className="text-[11px] mb-2" style={{ color: 'var(--ink-muted)' }}>{os.veiculo_desc}</div>
                    <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--ink-muted)' }}>
                      <span>{os.tecnico}</span>
                      <span>{os.itens?.length ?? 0} itens</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: 'var(--line-soft)' }}>
                      <span className="text-[12px] font-bold" style={{ color: 'var(--ink)' }}>{fmtCurrency(os.total)}</span>
                      <Badge tone={statusBadge(os.pagamento_status)}>{os.pagamento_status}</Badge>
                    </div>
                  </div>
                ))}
                {ordens.length === 0 && <div className="text-[11px] text-center py-4" style={{ color: 'var(--ink-faint)' }}>Sem OS</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ====================== FINANCEIRO ======================
export function DemoFinanceiro() {
  const ent = demoLancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0);
  const sai = demoLancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0);
  const saldo = ent - sai;

  // 30d fluxo sintético a partir do faturamento semanal
  const semanas = [7200, 8400, 6800, 6240];
  const fluxo30 = Array.from({ length: 30 }, (_, i) => {
    const w = Math.floor(i / 7);
    const base = (semanas[w] || semanas[semanas.length - 1]) / 7;
    const entrada = Math.round(base * (0.7 + Math.random() * 0.6));
    const saida   = Math.round(entrada * (0.45 + Math.random() * 0.25));
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    return { dia: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), entrada, saida };
  });

  // donut categorias
  const catMap = {};
  demoLancamentos.filter(l => l.tipo === 'entrada').forEach(l => { catMap[l.categoria] = (catMap[l.categoria] || 0) + l.valor; });
  const CAT_COLORS = ['#1C3F5E','#10B981','#D4A24C','#7C3AED','#E11D48'];
  const porCategoria = Object.entries(catMap).map(([name, value], i) => ({ name, value, color: CAT_COLORS[i % CAT_COLORS.length] }));

  return (
    <div>
      <CtaBanner />
      <PageHeader title="Financeiro" subtitle="Entradas, saídas e fluxo de caixa" actions={<Disabled label="Novo lançamento" />} />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard variant="cinematic" tone="emerald" label="Entradas (período)" value={fmtCurrency(ent)}   hint="Confirmadas"      icon={TrendingUp}   className="delay-1" />
        <KpiCard variant="cinematic" tone="rose"    label="Saídas (período)"   value={fmtCurrency(sai)}   hint="Despesas"         icon={TrendingDown} className="delay-2" />
        <KpiCard variant="cinematic" tone="brand"   label="Saldo"              value={fmtCurrency(saldo)} hint="Resultado líquido" icon={DollarSign}  className="delay-3" />
        <KpiCard variant="cinematic" tone="gold"    label="A receber"          value={fmtCurrency(6820)}  hint="Aguardando"       icon={Wallet}       className="delay-4" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-5">
        <Card title="Fluxo de caixa — últimos 30 dias" eyebrow="Caixa" className="lg:col-span-2">
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={fluxo30}>
                <defs>
                  <linearGradient id="dFinEnt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient id="dFinSai" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E11D48" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#E11D48" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
                <XAxis dataKey="dia" stroke="var(--ink-muted)" fontSize={11} interval={4} />
                <YAxis stroke="var(--ink-muted)" fontSize={11} />
                <Tooltip formatter={(v) => fmtCurrency(v)} contentStyle={{ borderRadius: 8, border: '1px solid var(--line-soft)' }} />
                <Area type="monotone" dataKey="entrada" stroke="#10B981" strokeWidth={2} fill="url(#dFinEnt)" name="Entradas" />
                <Area type="monotone" dataKey="saida"   stroke="#E11D48" strokeWidth={2} fill="url(#dFinSai)" name="Saídas" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Entradas por categoria" eyebrow="Mix">
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={porCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {porCategoria.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <DataTable rows={demoLancamentos} searchKeys={['descricao', 'categoria']}
        columns={[
          { header: 'Data', render: r => fmtDate(r.data) },
          { header: 'Descrição', key: 'descricao' },
          { header: 'Categoria', key: 'categoria' },
          { header: 'Forma', key: 'forma' },
          { header: 'Tipo', render: r => <Badge tone={statusBadge(r.tipo)}>{r.tipo}</Badge> },
          { header: 'Valor', render: r => <span className="font-semibold" style={{ color: r.tipo === 'entrada' ? 'var(--accent-emerald-fg)' : 'var(--accent-rose-fg)' }}>{r.tipo==='entrada'?'+':'-'} {fmtCurrency(r.valor)}</span> },
        ]} />
    </div>
  );
}

// ====================== RELATÓRIOS ======================
export function DemoRelatorios() {
  // Top dias sintéticos a partir das atividades semanais
  const melhoresDias = [
    { label: 'Sex 22/05', valor: 6240 },
    { label: 'Qua 20/05', valor: 5820 },
    { label: 'Sex 15/05', valor: 5460 },
    { label: 'Sáb 17/05', valor: 5120 },
    { label: 'Ter 19/05', valor: 4780 },
    { label: 'Qui 14/05', valor: 4350 },
    { label: 'Seg 18/05', valor: 3980 },
  ];
  const taxa = [
    { name: 'Aprovados', value: 2, color: '#10B981' },
    { name: 'Pendentes', value: 1, color: '#D4A24C' },
    { name: 'Recusados', value: 1, color: '#E11D48' },
  ];

  return (
    <div>
      <CtaBanner />
      <PageHeader title="Relatórios" subtitle="Análises de performance da oficina" />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard variant="cinematic" tone="emerald" label="Faturamento 6 meses" value={fmtCurrency(150530)} hint="Acumulado"          icon={TrendingUp}   className="delay-1" />
        <KpiCard variant="cinematic" tone="brand"   label="OS concluídas"        value={24}                  hint="Últimos 30 dias"    icon={CheckCircle2} className="delay-2" />
        <KpiCard variant="cinematic" tone="gold"    label="Ticket médio"         value={fmtCurrency(1190)}   hint="Por OS"             icon={Receipt}      className="delay-3" />
        <KpiCard variant="cinematic" tone="violet"  label="Taxa aprovação"       value="74%"                 hint="Orçamentos"         icon={Percent}      className="delay-4" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card title="Faturamento últimos 6 meses" eyebrow="Receita" className="lg:col-span-2">
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={demoFaturamentoMensal}>
                <defs>
                  <linearGradient id="dRel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#3B6FA0" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#1C3F5E" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
                <XAxis dataKey="mes" fontSize={12} stroke="var(--ink-muted)" />
                <YAxis fontSize={12} stroke="var(--ink-muted)" />
                <Tooltip formatter={(v) => fmtCurrency(v)} contentStyle={{ borderRadius: 8, border: '1px solid var(--line-soft)' }} />
                <Area type="monotone" dataKey="valor" stroke="#1C3F5E" strokeWidth={2.5} fill="url(#dRel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Melhores dias (90d)" eyebrow="Ranking">
          <div className="space-y-2" style={{ maxHeight: 280, overflowY: 'auto' }}>
            {melhoresDias.map((d, i) => {
              const pct = Math.round((d.valor / melhoresDias[0].valor) * 100);
              return (
                <div key={d.label} className="relative rounded-lg border p-2.5 overflow-hidden" style={{ borderColor: 'var(--line-soft)', backgroundColor: 'var(--surface-sunken)' }}>
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
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="OS por status (mês atual)" eyebrow="Operação">
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={demoOsPorStatus} dataKey="valor" nameKey="status" cx="50%" cy="50%" outerRadius={100} paddingAngle={3}>
                  {demoOsPorStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Taxa de aprovação de orçamentos" eyebrow="Conversão">
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={taxa} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                  {taxa.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Equipe — últimos acessos" eyebrow="Time" className="lg:col-span-2">
          <div className="space-y-2">
            {demoEquipe.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 text-[13px] border-b last:border-0" style={{ borderColor: 'var(--line-soft)' }}>
                <div>
                  <div className="font-semibold" style={{ color: 'var(--ink)' }}>{e.nome}</div>
                  <div className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>{e.email} · {e.role}</div>
                </div>
                <Badge tone="green">ativo</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ====================== AI GROWTH (4 cards) ======================
const aiIcons = { users: Users, wrench: Wrench, file: FileText, car: Car };
const ctaIcons = { users: MessageSquare, wrench: AlertCircle, file: FileQuestion, car: Calendar };

export function DemoAIGrowth() {
  return (
    <div>
      <CtaBanner />
      <PageHeader title="AI Growth" subtitle="Oportunidades detectadas pela IA" />
      <div className="grid md:grid-cols-2 gap-4">
        {demoAIInsights.map(ai => {
          const Icon = aiIcons[ai.icon] || Sparkles;
          const Cta  = ctaIcons[ai.icon] || ArrowRight;
          return (
            <div key={ai.id} className="rounded-lg border p-5" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--brand-subtle)' }}>
                  <Icon className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                </div>
                <div className="text-3xl font-black" style={{ color: 'var(--brand)' }}>{ai.count}</div>
              </div>
              <div className="font-bold text-[14px] mb-1" style={{ color: 'var(--ink)' }}>{ai.title}</div>
              <p className="text-[12.5px] mb-4" style={{ color: 'var(--ink-muted)' }}>{ai.desc}</p>
              <button className="w-full flex items-center justify-center gap-2 py-2 rounded text-[12px] font-bold opacity-60 cursor-not-allowed" style={{ backgroundColor: 'var(--surface-sunken)', color: 'var(--ink-muted)' }}>
                <Lock className="w-3 h-3" /> <Cta className="w-3.5 h-3.5" /> {ai.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

