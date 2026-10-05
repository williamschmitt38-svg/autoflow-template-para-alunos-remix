import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from '@/lib/supabase';
import { useEmpresa } from '@/lib/empresa';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';
import Badge, { statusBadge } from '@/components/common/Badge';
import Modal from '@/components/app/Modal';
import { Input, Select, Textarea, DateInput, NumberInput } from '@/components/app/FormField';
import { fmtCurrency, fmtDate } from '@/lib/format';
import { Plus, X, Clock, Wrench, CheckCircle2, User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const COLUNAS = [
  { key: 'aberta',          label: 'Abertas',          color: '#1A4B7A' },
  { key: 'em_andamento',    label: 'Em andamento',     color: '#1C3F5E' },
  { key: 'aguardando_peca', label: 'Aguardando peça',  color: '#8A5A0A' },
  { key: 'concluida',       label: 'Concluídas',       color: '#1A6B3A' },
  { key: 'cancelada',       label: 'Canceladas',       color: '#9B1C1C' },
];

const prioCor = (p) => p === 'alta' ? 'red' : p === 'baixa' ? 'gray' : 'blue';

export default function OrdemServico() {
  useDocumentTitle('Ordens de Serviço');
  const { empresaId } = useEmpresa();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [drawerOs, setDrawerOs] = useState(null);
  const [filterTec, setFilterTec] = useState('');
  const [filterPrio, setFilterPrio] = useState('');

  const { data: rows = [] } = useQuery({
    queryKey: ['ordem_servico', empresaId],
    enabled: !!empresaId,
    queryFn: async () => (await supabase.from('ordem_servico').select('*').eq('empresa_id', empresaId).order('data_abertura', { ascending: false })).data || [],
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['cliente-select', empresaId], enabled: !!empresaId,
    queryFn: async () => (await supabase.from('cliente').select('id,nome').eq('empresa_id', empresaId).order('nome')).data || [],
  });
  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculo-select', empresaId], enabled: !!empresaId,
    queryFn: async () => (await supabase.from('veiculo').select('id,cliente_id,marca,modelo,placa').eq('empresa_id', empresaId)).data || [],
  });
  const { data: equipe = [] } = useQuery({
    queryKey: ['equipe-select', empresaId], enabled: !!empresaId,
    queryFn: async () => (await supabase.from('empresa_user').select('id,nome').eq('empresa_id', empresaId).eq('ativo', true)).data || [],
  });

  const tecnicos = useMemo(() => Array.from(new Set(rows.map((r) => r.tecnico).filter(Boolean))), [rows]);

  const filtered = useMemo(() => rows.filter((r) =>
    (!filterTec || r.tecnico === filterTec) && (!filterPrio || r.prioridade === filterPrio)
  ), [rows, filterTec, filterPrio]);

  const onDragEnd = async (res) => {
    if (!res.destination) return;
    const newStatus = res.destination.droppableId;
    const osId = res.draggableId;
    const os = rows.find((r) => r.id === osId);
    if (!os || os.status === newStatus) return;
    qc.setQueryData(['ordem_servico', empresaId], (old) => (old || []).map((o) => o.id === osId ? { ...o, status: newStatus } : o));
    const patch = { status: newStatus };
    if (newStatus === 'concluida') patch.data_conclusao = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from('ordem_servico').update(patch).eq('id', osId);
    if (error) { toast.error(error.message); qc.invalidateQueries({ queryKey: ['ordem_servico', empresaId] }); }
    else toast.success(`${os.numero || 'OS'} → ${newStatus.replace('_', ' ')}`);
  };

  const nextNumber = () => `OS-${new Date().getFullYear()}-${crypto.randomUUID().slice(0,8).toUpperCase()}`;

  const open = (row) => {
    setEditing(row || 'new');
    if (row && row !== 'new') setForm({ ...row, itens: row.itens || [] });
    else setForm({ numero: nextNumber(), data_abertura: new Date().toISOString().slice(0, 10), status: 'aberta', prioridade: 'normal', itens: [{ descricao: '', quantidade: 1, valor: 0 }] });
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
        data_abertura: form.data_abertura, data_prevista: form.data_prevista || null,
        status: form.status || 'aberta', prioridade: form.prioridade || 'normal',
        tecnico: form.tecnico || null, total: totalForm, itens: form.itens || [],
      };
      if (editing && editing !== 'new') {
        const { error } = await supabase.from('ordem_servico').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('OS atualizada.');
      } else {
        const { error } = await supabase.from('ordem_servico').insert({ ...payload, empresa_id: empresaId });
        if (error) throw error;
        toast.success('OS criada.');
      }
      qc.invalidateQueries({ queryKey: ['ordem_servico', empresaId] });
      setEditing(null);
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const updateOs = async (id, patch) => {
    qc.setQueryData(['ordem_servico', empresaId], (old) => (old || []).map((o) => o.id === id ? { ...o, ...patch } : o));
    setDrawerOs((p) => p && p.id === id ? { ...p, ...patch } : p);
    const { error } = await supabase.from('ordem_servico').update(patch).eq('id', id);
    if(error){toast.error(error.message);qc.invalidateQueries({queryKey:['ordem_servico',empresaId]});}else{qc.invalidateQueries({queryKey:['lancamento']});toast.success('OS atualizada');}
  };

  const veiculosDoCli = veiculos.filter((v) => v.cliente_id === form.cliente_id);

  return (
    <div>
      <PageHeader title="Ordens de Serviço" subtitle={`${rows.length} OS no total`} actions={
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2 rounded text-[13px] font-bold text-white" style={{ backgroundColor: 'var(--brand)' }}>
          <Plus className="w-4 h-4" /> Nova OS
        </button>
      } />

      <div className="flex flex-wrap gap-2 mb-4">
        <select value={filterTec} onChange={(e) => setFilterTec(e.target.value)} className="px-3 py-2 rounded border text-[12px]" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line)' }}>
          <option value="">Todos técnicos</option>
          {tecnicos.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterPrio} onChange={(e) => setFilterPrio(e.target.value)} className="px-3 py-2 rounded border text-[12px]" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line)' }}>
          <option value="">Todas prioridades</option>
          <option value="alta">Alta</option><option value="normal">Normal</option><option value="baixa">Baixa</option>
        </select>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {COLUNAS.map((col) => {
            const ordens = filtered.filter((o) => o.status === col.key);
            return (
              <Droppable key={col.key} droppableId={col.key}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    className="rounded-lg p-3 min-h-[200px]"
                    style={{ backgroundColor: snapshot.isDraggingOver ? 'var(--brand-subtle)' : 'var(--surface-sunken)' }}>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                        <div className="text-[12px] font-bold">{col.label}</div>
                      </div>
                      <div className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--ink-muted)' }}>{ordens.length}</div>
                    </div>
                    <div className="space-y-2">
                      {ordens.map((os, idx) => {
                        const itens = os.itens || [];
                        const concluidosCount = itens.filter((i) => i.status === 'concluido').length;
                        return (
                          <Draggable key={os.id} draggableId={os.id} index={idx}>
                            {(p, snap) => (
                              <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}
                                onClick={() => setDrawerOs(os)}
                                className="rounded p-3 border cursor-pointer"
                                style={{ ...p.draggableProps.style, backgroundColor: 'var(--surface-raised)', borderColor: snap.isDragging ? 'var(--brand)' : 'var(--line-soft)', boxShadow: snap.isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none' }}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="font-mono font-bold text-[11px]" style={{ color: 'var(--brand)' }}>{os.numero}</div>
                                  <Badge tone={prioCor(os.prioridade)}>{os.prioridade}</Badge>
                                </div>
                                <div className="text-[12.5px] font-semibold" style={{ color: 'var(--ink)' }}>{os.cliente_nome}</div>
                                <div className="text-[11px] mb-2" style={{ color: 'var(--ink-muted)' }}>{os.veiculo_desc}</div>
                                {os.tecnico && (
                                  <div className="flex items-center gap-1.5 text-[11px] mb-2" style={{ color: 'var(--ink-2)' }}>
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: 'var(--brand)' }}>{os.tecnico[0]}</div>
                                    {os.tecnico}
                                  </div>
                                )}
                                {itens.length > 0 && (
                                  <div className="mb-2">
                                    <div className="h-1 rounded overflow-hidden" style={{ backgroundColor: 'var(--surface-sunken)' }}>
                                      <div className="h-full" style={{ width: `${(concluidosCount / itens.length) * 100}%`, backgroundColor: 'var(--brand)' }} />
                                    </div>
                                    <div className="text-[10px] mt-1" style={{ color: 'var(--ink-muted)' }}>{concluidosCount}/{itens.length} itens</div>
                                  </div>
                                )}
                                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--line-soft)' }}>
                                  <span className="text-[12px] font-bold" style={{ color: 'var(--status-green-fg)' }}>{fmtCurrency(os.total)}</span>
                                  <Badge tone={statusBadge(os.pagamento_status)}>{os.pagamento_status}</Badge>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {/* DRAWER lateral */}
      {drawerOs && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setDrawerOs(null)} />
          <div className="w-full max-w-md h-full overflow-auto p-5" style={{ backgroundColor: 'var(--surface-raised)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-mono font-bold text-[13px]" style={{ color: 'var(--brand)' }}>{drawerOs.numero}</div>
                <div className="font-bold text-[16px]">{drawerOs.cliente_nome}</div>
                <div className="text-[12px]" style={{ color: 'var(--ink-muted)' }}>{drawerOs.veiculo_desc}</div>
              </div>
              <button onClick={() => setDrawerOs(null)} className="p-1.5 rounded hover:bg-black/5"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-2 mb-5">
              <TimelineRow icon={Clock} label="Aberta" date={drawerOs.data_abertura} active />
              <TimelineRow icon={Wrench} label="Em andamento" active={['em_andamento', 'aguardando_peca', 'concluida'].includes(drawerOs.status)} />
              <TimelineRow icon={CheckCircle2} label="Concluída" date={drawerOs.data_conclusao} active={drawerOs.status === 'concluida'} />
            </div>

            <div className="mb-4">
              <div className="text-[11px] font-semibold uppercase mb-2" style={{ color: 'var(--ink-muted)' }}>Itens / Checklist</div>
              <div className="space-y-1.5">
                {(drawerOs.itens || []).map((it, i) => {
                  const done = it.status === 'concluido';
                  return (
                    <div key={i} className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'var(--surface-sunken)' }}>
                      <input type="checkbox" checked={done} onChange={(e) => {
                        const next = (drawerOs.itens || []).map((x, j) => j === i ? { ...x, status: e.target.checked ? 'concluido' : 'pendente' } : x);
                        updateOs(drawerOs.id, { itens: next });
                      }} />
                      <div className="flex-1 text-[12.5px]" style={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--ink-muted)' : 'var(--ink)' }}>
                        {it.descricao} <span style={{ color: 'var(--ink-muted)' }}>×{it.quantidade}</span>
                      </div>
                      <div className="text-[12px] font-semibold">{fmtCurrency(Number(it.quantidade || 0) * Number(it.valor || 0))}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <Select label="Técnico" value={drawerOs.tecnico || ''} onChange={(e) => updateOs(drawerOs.id, { tecnico: e.target.value })}
                options={equipe.map((m) => ({ value: m.nome, label: m.nome }))} />
              <Select label="Pagamento" value={drawerOs.pagamento_status || 'pendente'} onChange={(e) => updateOs(drawerOs.id, { pagamento_status: e.target.value })}
                options={[{ value: 'pendente', label: 'Pendente' }, { value: 'parcial', label: 'Parcial' }, { value: 'pago', label: 'Pago' }]} placeholder="" />
            </div>

            {drawerOs.status !== 'concluida' && (
              <button onClick={() => { updateOs(drawerOs.id, { status: 'concluida', data_conclusao: new Date().toISOString().slice(0, 10) }); }}
                className="w-full py-2 rounded text-[13px] font-bold text-white" style={{ backgroundColor: 'var(--status-green-fg)' }}>
                Finalizar OS
              </button>
            )}
            <button onClick={() => { setDrawerOs(null); open(drawerOs); }} className="w-full mt-2 py-2 rounded text-[13px] border" style={{ borderColor: 'var(--line)' }}>Editar OS completa</button>
          </div>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} size="lg"
        title={editing && editing !== 'new' ? `Editar ${form.numero || ''}` : `Nova OS — ${fmtCurrency(totalForm)}`}
        footer={
          <>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded text-[13px] border" style={{ borderColor: 'var(--line)' }}>Cancelar</button>
            <button form="os-form" type="submit" disabled={busy} className="px-4 py-2 rounded text-[13px] font-bold text-white disabled:opacity-60" style={{ backgroundColor: 'var(--brand)' }}>{busy ? 'Salvando…' : 'Salvar'}</button>
          </>
        }>
        <form id="os-form" onSubmit={save}>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Número" value={form.numero || ''} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
            <Select label="Prioridade" value={form.prioridade || 'normal'} onChange={(e) => setForm({ ...form, prioridade: e.target.value })}
              options={[{ value: 'baixa', label: 'Baixa' }, { value: 'normal', label: 'Normal' }, { value: 'alta', label: 'Alta' }]} placeholder="" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Cliente" required value={form.cliente_id || ''} onChange={(e) => setForm({ ...form, cliente_id: e.target.value, veiculo_id: '' })}
              options={clientes.map((c) => ({ value: c.id, label: c.nome }))} />
            <Select label="Veículo" required value={form.veiculo_id || ''} onChange={(e) => setForm({ ...form, veiculo_id: e.target.value })}
              options={veiculosDoCli.map((v) => ({ value: v.id, label: `${v.marca} ${v.modelo} — ${v.placa}` }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <DateInput label="Abertura" value={form.data_abertura || ''} onChange={(e) => setForm({ ...form, data_abertura: e.target.value })} />
            <DateInput label="Previsão" value={form.data_prevista || ''} onChange={(e) => setForm({ ...form, data_prevista: e.target.value })} />
            <Select label="Técnico" value={form.tecnico || ''} onChange={(e) => setForm({ ...form, tecnico: e.target.value })}
              options={equipe.map((m) => ({ value: m.nome, label: m.nome }))} />
          </div>
          <div className="mt-3 mb-2 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-muted)' }}>Itens</div>
            <button type="button" onClick={addItem} className="text-[11px] font-bold flex items-center gap-1" style={{ color: 'var(--brand)' }}>
              <Plus className="w-3 h-3" /> Adicionar
            </button>
          </div>
          <div className="space-y-2">
            {(form.itens || []).map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-6"><Input placeholder="Descrição" value={it.descricao} onChange={(e) => updateItem(i, { descricao: e.target.value })} /></div>
                <div className="col-span-2"><NumberInput placeholder="Qtd" value={it.quantidade} onChange={(e) => updateItem(i, { quantidade: e.target.value })} /></div>
                <div className="col-span-3"><NumberInput placeholder="Valor unit." value={it.valor} onChange={(e) => updateItem(i, { valor: e.target.value })} /></div>
                <div className="col-span-1 pt-2"><button type="button" onClick={() => rmItem(i)} className="p-1.5"><Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-red-fg)' }} /></button></div>
              </div>
            ))}
          </div>
          <div className="text-right font-bold text-[15px] my-3" style={{ color: 'var(--brand)' }}>Total: {fmtCurrency(totalForm)}</div>
        </form>
      </Modal>
    </div>
  );
}

function TimelineRow({ icon: Icon, label, date, active }) {
  return (
    <div className="flex items-center gap-3 text-[12px]">
      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: active ? 'var(--brand)' : 'var(--surface-sunken)' }}>
        <Icon className="w-3.5 h-3.5" style={{ color: active ? '#fff' : 'var(--ink-muted)' }} />
      </div>
      <div className="flex-1">
        <div className="font-semibold" style={{ color: active ? 'var(--ink)' : 'var(--ink-muted)' }}>{label}</div>
        {date && <div className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>{fmtDate(date)}</div>}
      </div>
    </div>
  );
}

