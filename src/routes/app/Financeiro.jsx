import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useEmpresa } from '@/lib/empresa';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import Badge, { statusBadge } from '@/components/common/Badge';
import Modal from '@/components/app/Modal';
import { Input, Textarea, Select, NumberInput, DateInput } from '@/components/app/FormField';
import { fmtCurrency, fmtDate } from '@/lib/format';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, DollarSign, Wallet, Receipt } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { toast } from 'sonner';

const CATEGORIAS = {
  entrada: ['Serviço/OS', 'Orçamento', 'Peças', 'Revisão', 'Balcão', 'Outros'],
  saida: ['Peças/Material', 'Aluguel', 'Pessoal/Salário', 'Comissão', 'Utilitários', 'Impostos', 'Equipamento', 'Treinamento', 'Outros'],
};
const FORMAS = ['PIX', 'Dinheiro', 'Cartão crédito', 'Cartão débito', 'Transferência', 'Boleto', 'A definir'];

const CAT_COLORS = ['#1C3F5E','#3B6FA0','#10B981','#D4A24C','#7C3AED','#E11D48','#0EA5E9','#8B5A2B'];

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

export default function Financeiro() {
  useDocumentTitle('Financeiro');
  const { empresaId } = useEmpresa();
  const qc = useQueryClient();
  const [tab, setTab] = useState('todos');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['lancamento', empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase.from('lancamento').select('*').eq('empresa_id', empresaId).order('data', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const kpis = useMemo(() => {
    const now = new Date();
    const m = now.toISOString().slice(0, 7);
    const inMonth = rows.filter((r) => r.tipo === 'entrada' && r.status === 'confirmado' && r.data?.startsWith(m));
    const ent = inMonth.reduce((s, r) => s + Number(r.valor || 0), 0);
    const sai = rows.filter((r) => r.tipo === 'saida' && r.status === 'confirmado' && r.data?.startsWith(m)).reduce((s, r) => s + Number(r.valor || 0), 0);
    const rec = rows.filter((r) => r.tipo === 'entrada' && r.status === 'pendente').reduce((s, r) => s + Number(r.valor || 0), 0);
    const lucro = ent - sai;
    const ticket = inMonth.length ? ent / inMonth.length : 0;
    return { ent, sai, rec, lucro, ticket };
  }, [rows]);

  // Fluxo de caixa últimos 30 dias (linha + área)
  const fluxo30 = useMemo(() => {
    const days = [];
    const map = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      map[k] = { dia: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), data: k, entrada: 0, saida: 0 };
      days.push(k);
    }
    rows.forEach((r) => {
      if (r.status !== 'confirmado' || !r.data || !map[r.data]) return;
      map[r.data][r.tipo] += Number(r.valor || 0);
    });
    return days.map((k) => ({ ...map[k], saldo: map[k].entrada - map[k].saida }));
  }, [rows]);

  // Donut por categoria (entradas do mês)
  const porCategoria = useMemo(() => {
    const m = new Date().toISOString().slice(0, 7);
    const map = {};
    rows.filter((r) => r.tipo === 'entrada' && r.status === 'confirmado' && r.data?.startsWith(m)).forEach((r) => {
      const k = r.categoria || 'Outros';
      map[k] = (map[k] || 0) + Number(r.valor || 0);
    });
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: CAT_COLORS[i % CAT_COLORS.length] }));
  }, [rows]);

  const filtered = useMemo(() => {
    if (tab === 'todos') return rows;
    if (tab === 'receber') return rows.filter((r) => r.tipo === 'entrada' && r.status === 'pendente');
    return rows.filter((r) => r.tipo === tab);
  }, [rows, tab]);

  const open = (row) => {
    setEditing(row || 'new');
    setForm(row && row !== 'new' ? row : { tipo: 'entrada', status: 'confirmado', data: new Date().toISOString().slice(0, 10) });
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        descricao: form.descricao, tipo: form.tipo, valor: Number(form.valor),
        data: form.data, status: form.status || 'pendente',
        categoria: form.categoria || null, forma: form.forma || null,
      };
      if (editing && editing !== 'new') {
        const { error } = await supabase.from('lancamento').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Lançamento atualizado.');
      } else {
        const { error } = await supabase.from('lancamento').insert({ ...payload, empresa_id: empresaId });
        if (error) throw error;
        toast.success('Lançamento criado.');
      }
      qc.invalidateQueries({ queryKey: ['lancamento', empresaId] });
      setEditing(null);
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const del = async (id) => {
    if (!confirm('Excluir este lançamento?')) return;
    const { error } = await supabase.from('lancamento').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Excluído.'); qc.invalidateQueries({ queryKey: ['lancamento', empresaId] }); }
  };

  return (
    <div>
      <PageHeader title="Financeiro" subtitle="Entradas, saídas e fluxo de caixa da oficina" actions={
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold text-white shadow-md hover:shadow-lg transition" style={{ background: 'var(--grad-brand)' }}>
          <Plus className="w-4 h-4" /> Novo lançamento
        </button>
      } />

      {/* HERO — 4 KPIs cinematográficos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard variant="cinematic" tone="emerald" label="Faturamento (mês)" value={fmtCurrency(kpis.ent)}   hint="Entradas confirmadas" icon={TrendingUp}    className="delay-1" />
        <KpiCard variant="cinematic" tone="gold"    label="A receber"         value={fmtCurrency(kpis.rec)}   hint="Pendentes"           icon={Wallet}        className="delay-2" />
        <KpiCard variant="cinematic" tone="rose"    label="Saídas (mês)"      value={fmtCurrency(kpis.sai)}   hint="Despesas"            icon={TrendingDown}  className="delay-3" />
        <KpiCard variant="cinematic" tone="brand"   label="Lucro bruto"       value={fmtCurrency(kpis.lucro)} hint={`Ticket ${fmtCurrency(kpis.ticket)}`} icon={DollarSign} className="delay-4" />
      </div>

      {/* Gráficos premium */}
      <div className="grid lg:grid-cols-3 gap-4 mb-5">
        <Card title="Fluxo de caixa — últimos 30 dias" eyebrow="Caixa" className="lg:col-span-2">
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={fluxo30}>
                <defs>
                  <linearGradient id="finEnt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10B981" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient id="finSai" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#E11D48" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#E11D48" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
                <XAxis dataKey="dia" stroke="var(--ink-muted)" fontSize={11} interval={4} />
                <YAxis stroke="var(--ink-muted)" fontSize={11} />
                <Tooltip formatter={(v) => fmtCurrency(v)} contentStyle={{ borderRadius: 8, border: '1px solid var(--line-soft)' }} />
                <Area type="monotone" dataKey="entrada" stroke="#10B981" strokeWidth={2}   fill="url(#finEnt)" name="Entradas" />
                <Area type="monotone" dataKey="saida"   stroke="#E11D48" strokeWidth={2}   fill="url(#finSai)" name="Saídas" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Entradas por categoria (mês)" eyebrow="Mix">
          <div style={{ width: '100%', height: 260 }}>
            {porCategoria.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[12px]" style={{ color: 'var(--ink-faint)' }}>Sem dados no mês.</div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={porCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {porCategoria.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmtCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="flex gap-1 border-b mb-3" style={{ borderColor: 'var(--line)' }}>
        {[['todos', 'Todos'], ['entrada', 'Entradas'], ['saida', 'Saídas'], ['receber', 'A receber']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className="px-4 py-2 text-[13px] font-semibold border-b-2 -mb-px transition-colors"
            style={{ borderColor: tab === k ? 'var(--brand)' : 'transparent', color: tab === k ? 'var(--brand)' : 'var(--ink-muted)' }}>{l}</button>
        ))}
      </div>

      {isLoading ? <div className="text-[13px]" style={{ color: 'var(--ink-muted)' }}>Carregando…</div> : (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)', boxShadow: 'var(--shadow-soft)' }}>
          <table className="w-full text-[13px]">
            <thead style={{ backgroundColor: 'var(--surface-sunken)' }}>
              <tr>
                {['Data', 'Descrição', 'Categoria', 'Forma', 'Status', 'Valor', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--ink-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t hover:bg-black/[0.015]" style={{ borderColor: 'var(--line-soft)' }}>
                  <td className="px-4 py-2.5" style={{ color: 'var(--ink-muted)' }}>{fmtDate(r.data)}</td>
                  <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--ink)' }}>{r.descricao}</td>
                  <td className="px-4 py-2.5">{r.categoria && <Badge tone="gray">{r.categoria}</Badge>}</td>
                  <td className="px-4 py-2.5" style={{ color: 'var(--ink-muted)' }}>{r.forma || '—'}</td>
                  <td className="px-4 py-2.5"><Badge tone={statusBadge(r.status)}>{r.status}</Badge></td>
                  <td className="px-4 py-2.5 font-bold" style={{ color: r.tipo === 'entrada' ? 'var(--accent-emerald-fg)' : 'var(--accent-rose-fg)' }}>
                    {r.tipo === 'entrada' ? '+' : '−'} {fmtCurrency(r.valor)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => r.os_id?toast.info('Altere pagamento e itens na OS vinculada.'):open(r)} className="p-1.5 rounded hover:bg-black/5"><Pencil className="w-3.5 h-3.5" style={{ color: 'var(--ink-muted)' }} /></button>
                    <button onClick={() => r.os_id?toast.info('Altere o pagamento na OS vinculada.'):del(r.id)} className="p-1.5 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-rose-fg)' }} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[12px]" style={{ color: 'var(--ink-muted)' }}>Nenhum lançamento.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing && editing !== 'new' ? 'Editar lançamento' : 'Novo lançamento'}
        footer={
          <>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded text-[13px] border" style={{ borderColor: 'var(--line)' }}>Cancelar</button>
            <button form="fin-form" type="submit" disabled={busy} className="px-4 py-2 rounded text-[13px] font-bold text-white disabled:opacity-60" style={{ backgroundColor: 'var(--brand)' }}>{busy ? 'Salvando…' : 'Salvar'}</button>
          </>
        }>
        <form id="fin-form" onSubmit={save}>
          <Input label="Descrição" required value={form.descricao || ''} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tipo" required value={form.tipo || 'entrada'} onChange={(e) => setForm({ ...form, tipo: e.target.value, categoria: '' })}
              options={[{ value: 'entrada', label: 'Entrada' }, { value: 'saida', label: 'Saída' }]} placeholder="" />
            <NumberInput label="Valor" required value={form.valor || ''} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DateInput label="Data" required value={form.data || ''} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            <Select label="Status" value={form.status || 'confirmado'} onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[{ value: 'confirmado', label: 'Confirmado' }, { value: 'pendente', label: 'Pendente' }, { value: 'cancelado', label: 'Cancelado' }]} placeholder="" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Categoria" value={form.categoria || ''} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              options={(CATEGORIAS[form.tipo] || []).map((c) => ({ value: c, label: c }))} />
            <Select label="Forma de pagamento" value={form.forma || ''} onChange={(e) => setForm({ ...form, forma: e.target.value })}
              options={FORMAS.map((f) => ({ value: f, label: f }))} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

