// Form especializado pra Orcamento/OS — com itens (jsonb) reordenáveis via DnD
import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { X, Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import { fmtCurrency } from '@/lib/format';

export default function ItemizedForm({ open, onClose, title, initial = {}, clientes = [], veiculos = [], extraFields = [], onSubmit, busy }) {
  const [form, setForm] = useState({ cliente_id: '', veiculo_id: '', observacoes: '', itens: [], ...initial });

  useEffect(() => {
    if (open) setForm({ cliente_id: '', veiculo_id: '', observacoes: '', ...(initial || {}), itens: (initial?.itens || []) });
    // eslint-disable-next-line
  }, [open]);

  if (!open) return null;
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const total = (form.itens || []).reduce((s, it) => s + (Number(it.qtd || 0) * Number(it.preco || 0)), 0);
  const veicsCliente = veiculos.filter(v => !form.cliente_id || v.cliente_id === form.cliente_id);

  const updateItem = (i, k, v) => {
    const arr = [...(form.itens || [])];
    arr[i] = { ...arr[i], [k]: v };
    set('itens', arr);
  };
  const addItem = () => set('itens', [...(form.itens || []), { descricao: '', qtd: 1, preco: 0 }]);
  const removeItem = (i) => set('itens', (form.itens || []).filter((_, j) => j !== i));
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const arr = [...(form.itens || [])];
    const [moved] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, moved);
    set('itens', arr);
  };

  const submit = (e) => {
    e.preventDefault();
    const cli = clientes.find(c => c.id === form.cliente_id);
    const veic = veiculos.find(v => v.id === form.veiculo_id);
    onSubmit({
      ...form,
      cliente_nome: cli?.nome || null,
      veiculo_desc: veic ? `${veic.marca} ${veic.modelo} - ${veic.placa}` : null,
      total,
      itens: form.itens || [],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto" style={{ backgroundColor: 'var(--surface-raised)' }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--line-soft)' }}>
          <h3 className="text-lg font-black">{title}</h3>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FieldSel label="Cliente *" value={form.cliente_id} onChange={v => set('cliente_id', v)} options={clientes.map(c => ({ value: c.id, label: c.nome }))} required />
            <FieldSel label="Veículo *" value={form.veiculo_id} onChange={v => set('veiculo_id', v)} options={veicsCliente.map(v => ({ value: v.id, label: `${v.marca} ${v.modelo} - ${v.placa}` }))} required />
          </div>
          {extraFields.map(f => (
            <div key={f.name}>
              <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-muted)' }}>{f.label}</label>
              {f.type === 'select' ? (
                <select value={form[f.name] ?? ''} onChange={e => set(f.name, e.target.value)} className="w-full rounded border px-3 py-2 text-[13px]" style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--line)' }}>
                  <option value="">—</option>
                  {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input type={f.type || 'text'} value={form[f.name] ?? ''} onChange={e => set(f.name, e.target.value)} className="w-full rounded border px-3 py-2 text-[13px]" style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--line)' }} />
              )}
            </div>
          ))}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-muted)' }}>Itens (arraste para reordenar)</label>
              <button type="button" onClick={addItem} className="text-[12px] font-bold flex items-center gap-1" style={{ color: 'var(--brand)' }}><Plus className="w-3 h-3" /> Adicionar</button>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="itens">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                    {(form.itens || []).map((it, i) => (
                      <Draggable draggableId={`item-${i}`} index={i} key={`item-${i}`}>
                        {(p, snap) => (
                          <div ref={p.innerRef} {...p.draggableProps}
                            className="grid grid-cols-12 gap-2 items-center rounded"
                            style={{
                              backgroundColor: snap.isDragging ? 'var(--brand-subtle)' : 'transparent',
                              boxShadow: snap.isDragging ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                              ...p.draggableProps.style,
                            }}>
                            <div {...p.dragHandleProps} className="col-span-1 flex items-center justify-center cursor-grab active:cursor-grabbing" style={{ color: 'var(--ink-faint)' }}>
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <input placeholder="Descrição" value={it.descricao || ''} onChange={e => updateItem(i, 'descricao', e.target.value)} className="col-span-5 rounded border px-3 py-1.5 text-[13px]" style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--line)' }} />
                            <input type="number" min="0" step="1" placeholder="Qtd" value={it.qtd ?? 1} onChange={e => updateItem(i, 'qtd', e.target.value)} className="col-span-2 rounded border px-3 py-1.5 text-[13px]" style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--line)' }} />
                            <input type="number" min="0" step="0.01" placeholder="Preço" value={it.preco ?? 0} onChange={e => updateItem(i, 'preco', e.target.value)} className="col-span-3 rounded border px-3 py-1.5 text-[13px]" style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--line)' }} />
                            <button type="button" onClick={() => removeItem(i)} className="col-span-1 text-[13px]" style={{ color: 'var(--status-red-fg)' }}><Trash2 className="w-3.5 h-3.5 mx-auto" /></button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {!(form.itens || []).length && <div className="text-[12px]" style={{ color: 'var(--ink-faint)' }}>Nenhum item ainda.</div>}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <div className="text-right mt-3 text-[14px] font-black">Total: {fmtCurrency(total)}</div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-muted)' }}>Observações</label>
            <textarea rows={2} value={form.observacoes || ''} onChange={e => set('observacoes', e.target.value)} className="w-full rounded border px-3 py-2 text-[13px]" style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--line)' }} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded text-[13px] border" style={{ borderColor: 'var(--line)' }}>Cancelar</button>
            <button type="submit" disabled={busy} className="px-4 py-2 rounded text-[13px] font-bold text-white flex items-center gap-2" style={{ backgroundColor: 'var(--brand)' }}>
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const FieldSel = ({ label, value, onChange, options, required }) => (
  <div>
    <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-muted)' }}>{label}</label>
    <select required={required} value={value} onChange={e => onChange(e.target.value)} className="w-full rounded border px-3 py-2 text-[13px]" style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--line)' }}>
      <option value="">Selecione…</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

