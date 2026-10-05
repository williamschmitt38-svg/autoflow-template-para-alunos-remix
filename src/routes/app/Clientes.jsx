import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useEmpresa } from '@/lib/empresa';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';
import Badge, { statusBadge } from '@/components/common/Badge';
import Modal from '@/components/app/Modal';
import { Input, Textarea, Select } from '@/components/app/FormField';
import { Plus, Search, Pencil, Trash2, User, Phone, Mail, Tag } from 'lucide-react';
import { toast } from 'sonner';

const TAGS = ['VIP', 'Recorrente', 'Frota', 'Reativar'];

export default function Clientes() {
  useDocumentTitle('Clientes');
  const { empresaId } = useEmpresa();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [form, setForm] = useState({});

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['cliente', empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase.from('cliente').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    let r = rows;
    if (filter === 'ativos') r = r.filter((x) => x.status === 'ativo');
    if (filter === 'inativos') r = r.filter((x) => x.status === 'inativo');
    if (search) {
      const s = search.toLowerCase();
      r = r.filter((x) => x.nome?.toLowerCase().includes(s) || x.telefone?.includes(s) || x.email?.toLowerCase().includes(s));
    }
    return r;
  }, [rows, filter, search]);

  const open = (row) => {
    setEditing(row || 'new');
    setForm(row && row !== 'new' ? { ...row, tags: row.tags || [] } : { status: 'ativo', tags: [] });
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        nome: form.nome, telefone: form.telefone || null, email: form.email || null,
        observacoes: form.observacoes || null, status: form.status || 'ativo',
        tags: form.tags || [],
      };
      if (editing && editing !== 'new') {
        const { error } = await supabase.from('cliente').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Cliente atualizado.');
      } else {
        const { error } = await supabase.from('cliente').insert({ ...payload, empresa_id: empresaId });
        if (error) throw error;
        toast.success('Cliente criado.');
      }
      qc.invalidateQueries({ queryKey: ['cliente', empresaId] });
      setEditing(null);
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const del = async (id) => {
    if (!confirm('Excluir este cliente?')) return;
    const { error } = await supabase.from('cliente').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Excluído.'); qc.invalidateQueries({ queryKey: ['cliente', empresaId] }); }
  };

  const toggleTag = (t) => setForm((p) => ({ ...p, tags: p.tags?.includes(t) ? p.tags.filter((x) => x !== t) : [...(p.tags || []), t] }));

  const ativos = rows.filter((r) => r.status === 'ativo').length;
  const vips = rows.filter((r) => r.tags?.includes('VIP')).length;

  return (
    <div>
      <PageHeader title="Clientes" subtitle={`${rows.length} cadastrados • ${ativos} ativos • ${vips} VIP`} actions={
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2 rounded text-[13px] font-bold text-white" style={{ backgroundColor: 'var(--brand)' }}>
          <Plus className="w-4 h-4" /> Novo cliente
        </button>
      } />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded border flex-1 min-w-[240px]" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line)' }}>
          <Search className="w-4 h-4" style={{ color: 'var(--ink-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, telefone, e-mail…" className="flex-1 text-[13px] bg-transparent outline-none" />
        </div>
        <div className="flex rounded border overflow-hidden" style={{ borderColor: 'var(--line)' }}>
          {[['todos', 'Todos'], ['ativos', 'Ativos'], ['inativos', 'Inativos']].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className="px-3 py-2 text-[12px] font-semibold"
              style={{ backgroundColor: filter === k ? 'var(--brand)' : 'var(--surface-raised)', color: filter === k ? '#fff' : 'var(--ink-2)' }}>{l}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-[13px]" style={{ color: 'var(--ink-muted)' }}>Carregando…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border p-12 text-center" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
          <User className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--ink-faint)' }} />
          <div className="text-[14px] font-semibold mb-1" style={{ color: 'var(--ink)' }}>Nenhum cliente encontrado</div>
          <div className="text-[12px]" style={{ color: 'var(--ink-muted)' }}>Cadastre seu primeiro cliente para começar.</div>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
          <table className="w-full text-[13px]">
            <thead style={{ backgroundColor: 'var(--surface-sunken)' }}>
              <tr>
                {['Cliente', 'Contato', 'Tags', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--ink-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t" style={{ borderColor: 'var(--line-soft)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px]" style={{ backgroundColor: 'var(--brand-subtle)', color: 'var(--brand)' }}>
                        {r.nome?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: 'var(--ink)' }}>{r.nome}</div>
                        {r.observacoes && <div className="text-[11px] truncate max-w-[280px]" style={{ color: 'var(--ink-muted)' }}>{r.observacoes}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {r.telefone && <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--ink-2)' }}><Phone className="w-3 h-3" />{r.telefone}</div>}
                    {r.email && <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--ink-muted)' }}><Mail className="w-3 h-3" />{r.email}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(r.tags || []).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: 'var(--brand-subtle)', color: 'var(--brand)' }}>{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge tone={statusBadge(r.status)}>{r.status}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => open(r)} className="p-1.5 rounded hover:bg-black/5"><Pencil className="w-3.5 h-3.5" style={{ color: 'var(--ink-muted)' }} /></button>
                    <button onClick={() => del(r.id)} className="p-1.5 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-red-fg)' }} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing && editing !== 'new' ? 'Editar cliente' : 'Novo cliente'}
        footer={
          <>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded text-[13px] border" style={{ borderColor: 'var(--line)' }}>Cancelar</button>
            <button form="cliente-form" type="submit" disabled={busy} className="px-4 py-2 rounded text-[13px] font-bold text-white disabled:opacity-60" style={{ backgroundColor: 'var(--brand)' }}>{busy ? 'Salvando…' : 'Salvar'}</button>
          </>
        }>
        <form id="cliente-form" onSubmit={save}>
          <Input label="Nome" required value={form.nome || ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Telefone" value={form.telefone || ''} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            <Input type="email" label="E-mail" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <Select label="Status" value={form.status || 'ativo'} onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[{ value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }]} placeholder="" />
          <FormFieldLabel label="Tags" />
          <div className="flex flex-wrap gap-2 mb-3">
            {TAGS.map((t) => {
              const on = form.tags?.includes(t);
              return (
                <button key={t} type="button" onClick={() => toggleTag(t)}
                  className="px-2.5 py-1 rounded text-[12px] font-semibold flex items-center gap-1 border"
                  style={{ backgroundColor: on ? 'var(--brand)' : 'transparent', color: on ? '#fff' : 'var(--ink-2)', borderColor: on ? 'var(--brand)' : 'var(--line)' }}>
                  <Tag className="w-3 h-3" />{t}
                </button>
              );
            })}
          </div>
          <Textarea label="Observações" rows={3} value={form.observacoes || ''} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
        </form>
      </Modal>
    </div>
  );
}

function FormFieldLabel({ label }) {
  return <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-muted)' }}>{label}</label>;
}

