import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useEmpresa } from '@/lib/empresa';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import Badge, { statusBadge } from '@/components/common/Badge';
import Modal from '@/components/app/Modal';
import { Input, NumberInput, DateInput, Select, Textarea } from '@/components/app/FormField';
import { fmtCurrency, fmtDate } from '@/lib/format';
import { Plus, Search, Pencil, Trash2, FileText, ChevronDown, ChevronUp, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const STATUS = ['todos', 'pendente', 'aprovado', 'recusado'];

export default function Orcamentos() {
  useDocumentTitle('Orçamentos');
  const { empresaId } = useEmpresa();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [expandedId, setExpandedId] = useState(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['orcamento', empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase.from('orcamento').select('*').eq('empresa_id', empresaId).order('data', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['cliente-select', empresaId], enabled: !!empresaId,
    queryFn: async () => (await supabase.from('cliente').select('id,nome').eq('empresa_id', empresaId).order('nome')).data || [],
  });
  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculo-select', empresaId], enabled: !!empresaId,
    queryFn: async () => (await supabase.from('veiculo').select('id,cliente_id,marca,modelo,placa').eq('empresa_id', empresaId)).data || [],
  });

  const kpis = useMemo(() => {
    const m = new Date().toISOString().slice(0, 7);
    return {
      pendentes: rows.filter((r) => r.status === 'pendente').length,
      aprovados: rows.filter((r) => r.status === 'aprovado').length,
      recusados: rows.filter((r) => r.status === 'recusado').length,
      totalMes: rows.filter((r) => r.data?.startsWith(m)).reduce((s, r) => s + Number(r.total || 0), 0),
    };
  }, [rows]);

  const filtered = useMemo(() => {
    let r = rows;
    if (filter !== 'todos') r = r.filter((x) => x.status === filter);
    if (search) {
      const s = search.toLowerCase();
      r = r.filter((x) => x.cliente_nome?.toLowerCase().includes(s) || x.numero?.toLowerCase().includes(s));
    }
    return r;
  }, [rows, filter, search]);

  const nextNumber = () => `ORC-${new Date().getFullYear()}-${crypto.randomUUID().slice(0,8).toUpperCase()}`;

  const open = (row) => {
    setEditing(row || 'new');
    if (row && row !== 'new') {
      setForm({ ...row, itens: row.itens || [] });
    } else {
      const dPlus = new Date(); dPlus.setDate(dPlus.getDate() + 14);
      setForm({ numero: nextNumber(), data: new Date().toISOString().slice(0, 10), validade: dPlus.toISOString().slice(0, 10), status: 'pendente', itens: [{ descricao: '', quantidade: 1, valor: 0 }] });
    }
  };

  const totalForm = useMemo(() => (form.itens || []).reduce((s, i) => s + (Number(i.quantidade || 0) * Number(i.valor || 0)), 0), [form.itens]);

  const updateItem = (idx, patch) => setForm((p) => ({ ...p, itens: p.itens.map((it, i) => i === idx ? { ...it, ...patch } : it) }));
  const addItem = () => setForm((p) => ({ ...p, itens: [...(p.itens || []), { descricao: '', quantidade: 1, valor: 0 }] }));
  const rmItem = (idx) => setForm((p) => ({ ...p, itens: p.itens.filter((_, i) => i !== idx) }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const cli = clientes.find((c) => c.id === form.cliente_id);
      const veic = veiculos.find((v) => v.id === form.veiculo_id);
      const payload = {
        numero: form.numero, cliente_id: form.cliente_id, cliente_nome: cli?.nome,
        veiculo_id: form.veiculo_id, veiculo_desc: veic ? `${veic.marca} ${veic.modelo} — ${veic.placa}` : null,
        data: form.data, validade: form.validade || null, status: form.status || 'pendente',
        total: totalForm, itens: form.itens || [], observacoes: form.observacoes || null,
      };
      if (editing && editing !== 'new') {
        const { error } = await supabase.from('orcamento').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Orçamento atualizado.');
      } else {
        const { error } = await supabase.from('orcamento').insert({ ...payload, empresa_id: empresaId });
        if (error) throw error;
        toast.success('Orçamento criado.');
      }
      qc.invalidateQueries({ queryKey: ['orcamento', empresaId] });
      setEditing(null);
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const aprovarConverter = async (r) => {
    if (!confirm(`Aprovar ${r.numero} e converter em Ordem de Serviço?`)) return;
    try {
      const {data:os,error}=await supabase.rpc('convert_budget',{id:r.id});if(error)throw error;const numeroOS=os.numero;
      toast.success(`Convertido em ${numeroOS}.`, { description: 'Acesse /app/ordens para acompanhar.' });
      qc.invalidateQueries({ queryKey: ['orcamento', empresaId] });
      qc.invalidateQueries({ queryKey: ['ordem_servico', empresaId] });
    } catch (e) { toast.error(e.message); }
  };

  const recusar = async (r) => {
    const motivo = prompt('Motivo da recusa (opcional):');
    if (motivo === null) return;
    const obs = motivo ? `${r.observacoes || ''}\n[Recusado]: ${motivo}`.trim() : r.observacoes;
    const { error } = await supabase.from('orcamento').update({ status: 'recusado', observacoes: obs }).eq('id', r.id);
    if (error) toast.error(error.message); else { toast.success('Marcado como recusado.'); qc.invalidateQueries({ queryKey: ['orcamento', empresaId] }); }
  };

  const del = async (id) => {
    if (!confirm('Excluir este orçamento?')) return;
    const { error } = await supabase.from('orcamento').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Excluído.'); qc.invalidateQueries({ queryKey: ['orcamento', empresaId] }); }
  };

  const veiculosDoCli = veiculos.filter((v) => v.cliente_id === form.cliente_id);

  return (
    <div>
      <PageHeader title="Orçamentos" subtitle={`${rows.length} orçamentos no total`} actions={
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2 rounded text-[13px] font-bold text-white" style={{ backgroundColor: 'var(--brand)' }}>
          <Plus className="w-4 h-4" /> Novo orçamento
        </button>
      } />

      <div className="grid md:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Pendentes" value={kpis.pendentes} accent="var(--status-blue-fg)" />
        <KpiCard label="Aprovados" value={kpis.aprovados} accent="var(--status-green-fg)" />
        <KpiCard label="Recusados" value={kpis.recusados} accent="var(--status-red-fg)" />
        <KpiCard label="Valor total (mês)" value={fmtCurrency(kpis.totalMes)} accent="var(--brand)" />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded border flex-1 min-w-[240px]" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line)' }}>
          <Search className="w-4 h-4" style={{ color: 'var(--ink-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por cliente ou número…" className="flex-1 text-[13px] bg-transparent outline-none" />
        </div>
        <div className="flex rounded border overflow-hidden" style={{ borderColor: 'var(--line)' }}>
          {STATUS.map((k) => (
            <button key={k} onClick={() => setFilter(k)} className="px-3 py-2 text-[12px] font-semibold capitalize"
              style={{ backgroundColor: filter === k ? 'var(--brand)' : 'var(--surface-raised)', color: filter === k ? '#fff' : 'var(--ink-2)' }}>{k}</button>
          ))}
        </div>
      </div>

      {isLoading ? <div className="text-[13px]">Carregando…</div> : filtered.length === 0 ? (
        <div className="rounded-lg border p-12 text-center" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
          <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--ink-faint)' }} />
          <div className="text-[14px] font-semibold mb-1">Nenhum orçamento encontrado</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const exp = expandedId === r.id;
            return (
              <div key={r.id} className="rounded-lg border" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
                <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedId(exp ? null : r.id)}>
                  <div className="font-mono font-bold text-[12px]" style={{ color: 'var(--brand)' }}>{r.numero || '—'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>{r.cliente_nome}</div>
                    <div className="text-[11px] truncate" style={{ color: 'var(--ink-muted)' }}>{r.veiculo_desc || '—'}</div>
                  </div>
                  <div className="text-[13px] font-bold" style={{ color: 'var(--ink)' }}>{fmtCurrency(r.total)}</div>
                  <Badge tone={statusBadge(r.status)}>{r.status}</Badge>
                  {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                {exp && (
                  <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: 'var(--line-soft)' }}>
                    <div className="grid md:grid-cols-2 gap-2 text-[12px] mb-3" style={{ color: 'var(--ink-muted)' }}>
                      <div>Data: <span style={{ color: 'var(--ink)' }}>{fmtDate(r.data)}</span></div>
                      <div>Validade: <span style={{ color: 'var(--ink)' }}>{fmtDate(r.validade)}</span></div>
                    </div>
                    <div className="space-y-1 mb-3">
                      {(r.itens || []).map((it, i) => (
                        <div key={i} className="flex justify-between text-[12px] py-1.5 border-b" style={{ borderColor: 'var(--line-soft)' }}>
                          <div>{it.descricao} <span style={{ color: 'var(--ink-muted)' }}>×{it.quantidade}</span></div>
                          <div className="font-semibold">{fmtCurrency(Number(it.quantidade || 0) * Number(it.valor || 0))}</div>
                        </div>
                      ))}
                    </div>
                    {r.observacoes && <div className="text-[12px] p-3 rounded mb-3" style={{ backgroundColor: 'var(--surface-sunken)', color: 'var(--ink-2)' }}>{r.observacoes}</div>}
                    <div className="flex flex-wrap gap-2">
                      {r.status === 'pendente' && (
                        <>
                          <button onClick={() => aprovarConverter(r)} className="px-3 py-1.5 rounded text-[12px] font-bold text-white flex items-center gap-1" style={{ backgroundColor: 'var(--status-green-fg)' }}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar e converter em OS <ArrowRight className="w-3 h-3" />
                          </button>
                          <button onClick={() => recusar(r)} className="px-3 py-1.5 rounded text-[12px] font-bold text-white flex items-center gap-1" style={{ backgroundColor: 'var(--status-red-fg)' }}>
                            <XCircle className="w-3.5 h-3.5" /> Recusar
                          </button>
                        </>
                      )}
                      <button onClick={() => open(r)} className="px-3 py-1.5 rounded text-[12px] border flex items-center gap-1" style={{ borderColor: 'var(--line)' }}>
                        <Pencil className="w-3.5 h-3.5" /> Editar
                      </button>
                      <button onClick={() => del(r.id)} className="px-3 py-1.5 rounded text-[12px] border flex items-center gap-1" style={{ borderColor: 'var(--status-red-fg)', color: 'var(--status-red-fg)' }}>
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} size="lg"
        title={editing && editing !== 'new' ? `Editar ${form.numero || ''}` : `Novo orçamento — ${fmtCurrency(totalForm)}`}
        footer={
          <>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded text-[13px] border" style={{ borderColor: 'var(--line)' }}>Cancelar</button>
            <button form="orc-form" type="submit" disabled={busy} className="px-4 py-2 rounded text-[13px] font-bold text-white disabled:opacity-60" style={{ backgroundColor: 'var(--brand)' }}>{busy ? 'Salvando…' : 'Salvar'}</button>
          </>
        }>
        <form id="orc-form" onSubmit={save}>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Número" value={form.numero || ''} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
            <Select label="Status" value={form.status || 'pendente'} onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[{ value: 'pendente', label: 'Pendente' }, { value: 'aprovado', label: 'Aprovado' }, { value: 'recusado', label: 'Recusado' }]} placeholder="" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Cliente" required value={form.cliente_id || ''} onChange={(e) => setForm({ ...form, cliente_id: e.target.value, veiculo_id: '' })}
              options={clientes.map((c) => ({ value: c.id, label: c.nome }))} />
            <Select label="Veículo" required value={form.veiculo_id || ''} onChange={(e) => setForm({ ...form, veiculo_id: e.target.value })}
              options={veiculosDoCli.map((v) => ({ value: v.id, label: `${v.marca} ${v.modelo} — ${v.placa}` }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DateInput label="Data" value={form.data || ''} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            <DateInput label="Validade" value={form.validade || ''} onChange={(e) => setForm({ ...form, validade: e.target.value })} />
          </div>

          <div className="mt-3 mb-2 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-muted)' }}>Itens</div>
            <button type="button" onClick={addItem} className="text-[11px] font-bold flex items-center gap-1" style={{ color: 'var(--brand)' }}>
              <Plus className="w-3 h-3" /> Adicionar item
            </button>
          </div>
          <div className="space-y-2">
            {(form.itens || []).map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-6"><Input placeholder="Descrição" value={it.descricao} onChange={(e) => updateItem(i, { descricao: e.target.value })} /></div>
                <div className="col-span-2"><NumberInput placeholder="Qtd" value={it.quantidade} onChange={(e) => updateItem(i, { quantidade: e.target.value })} /></div>
                <div className="col-span-3"><NumberInput placeholder="Valor unit." value={it.valor} onChange={(e) => updateItem(i, { valor: e.target.value })} /></div>
                <div className="col-span-1 pt-2">
                  <button type="button" onClick={() => rmItem(i)} className="p-1.5 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-red-fg)' }} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-right font-bold text-[15px] my-3" style={{ color: 'var(--brand)' }}>Total: {fmtCurrency(totalForm)}</div>
          <Textarea label="Observações" rows={3} value={form.observacoes || ''} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
        </form>
      </Modal>
    </div>
  );
}

