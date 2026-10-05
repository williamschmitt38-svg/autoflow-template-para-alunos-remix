import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useEmpresa } from '@/lib/empresa';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';
import Modal from '@/components/app/Modal';
import { Input, NumberInput, DateInput, Select, Textarea } from '@/components/app/FormField';
import { Plus, Search, Car, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { fmtDate } from '@/lib/format';
import { toast } from 'sonner';

const today = () => new Date();
const diasAte = (d) => d ? Math.ceil((new Date(d) - today()) / 86400000) : null;

export default function Veiculos() {
  useDocumentTitle('Veículos');
  const { empresaId } = useEmpresa();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['veiculo', empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase.from('veiculo').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['cliente-select', empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data } = await supabase.from('cliente').select('id,nome').eq('empresa_id', empresaId).order('nome');
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    if (!search) return rows;
    const s = search.toLowerCase();
    return rows.filter((v) =>
      v.marca?.toLowerCase().includes(s) || v.modelo?.toLowerCase().includes(s) ||
      v.placa?.toLowerCase().includes(s) || v.cliente_nome?.toLowerCase().includes(s)
    );
  }, [rows, search]);

  const open = (row) => {
    setEditing(row || 'new');
    setForm(row && row !== 'new' ? row : { ano: new Date().getFullYear() });
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const cli = clientes.find((c) => c.id === form.cliente_id);
      const payload = {
        cliente_id: form.cliente_id, cliente_nome: cli?.nome || form.cliente_nome,
        marca: form.marca, modelo: form.modelo, ano: form.ano ? Number(form.ano) : null,
        placa: (form.placa || '').toUpperCase(), cor: form.cor || null,
        quilometragem: form.quilometragem ? Number(form.quilometragem) : null,
        ultima_revisao: form.ultima_revisao || null, proxima_revisao: form.proxima_revisao || null,
      };
      if (editing && editing !== 'new') {
        const { error } = await supabase.from('veiculo').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Veículo atualizado.');
      } else {
        const { error } = await supabase.from('veiculo').insert({ ...payload, empresa_id: empresaId });
        if (error) throw error;
        toast.success('Veículo cadastrado.');
      }
      qc.invalidateQueries({ queryKey: ['veiculo', empresaId] });
      setEditing(null);
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const del = async (id) => {
    if (!confirm('Excluir este veículo?')) return;
    const { error } = await supabase.from('veiculo').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Excluído.'); qc.invalidateQueries({ queryKey: ['veiculo', empresaId] }); }
  };

  return (
    <div>
      <PageHeader title="Veículos" subtitle={`${rows.length} veículos cadastrados`} actions={
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2 rounded text-[13px] font-bold text-white" style={{ backgroundColor: 'var(--brand)' }}>
          <Plus className="w-4 h-4" /> Novo veículo
        </button>
      } />

      <div className="flex items-center gap-2 px-3 py-2 rounded border mb-4" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line)' }}>
        <Search className="w-4 h-4" style={{ color: 'var(--ink-muted)' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por marca, modelo, placa ou cliente…" className="flex-1 text-[13px] bg-transparent outline-none" />
      </div>

      {isLoading ? <div className="text-[13px]" style={{ color: 'var(--ink-muted)' }}>Carregando…</div> : filtered.length === 0 ? (
        <div className="rounded-lg border p-12 text-center" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
          <Car className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--ink-faint)' }} />
          <div className="text-[14px] font-semibold mb-1" style={{ color: 'var(--ink)' }}>Nenhum veículo encontrado</div>
          <div className="text-[12px] mb-4" style={{ color: 'var(--ink-muted)' }}>Cadastre o primeiro veículo para começar.</div>
          <button onClick={() => open()} className="px-4 py-2 rounded text-[13px] font-bold text-white" style={{ backgroundColor: 'var(--brand)' }}>Cadastrar veículo</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => {
            const dias = diasAte(v.proxima_revisao);
            const alerta = dias !== null && dias <= 30 && dias >= 0;
            return (
              <div key={v.id} className="rounded-lg border p-5 relative" style={{ backgroundColor: 'var(--surface-raised)', borderColor: alerta ? 'var(--status-red-fg)' : 'var(--line-soft)', borderWidth: alerta ? 2 : 1 }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--brand-subtle)' }}>
                      <Car className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[15px] truncate" style={{ color: 'var(--ink)' }}>{v.marca} {v.modelo}</div>
                      <div className="text-[12px] truncate" style={{ color: 'var(--ink-muted)' }}>{v.cliente_nome || '—'}</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded text-[11px] font-mono font-bold flex-shrink-0" style={{ backgroundColor: 'var(--surface-sunken)', color: 'var(--ink)' }}>{v.placa}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] mb-3">
                  <div><div className="font-semibold" style={{ color: 'var(--ink-muted)' }}>Ano</div><div style={{ color: 'var(--ink)' }}>{v.ano || '—'}</div></div>
                  <div><div className="font-semibold" style={{ color: 'var(--ink-muted)' }}>Cor</div><div style={{ color: 'var(--ink)' }}>{v.cor || '—'}</div></div>
                  <div><div className="font-semibold" style={{ color: 'var(--ink-muted)' }}>KM</div><div style={{ color: 'var(--ink)' }}>{v.quilometragem ? v.quilometragem.toLocaleString('pt-BR') : '—'}</div></div>
                </div>
                {alerta ? (
                  <div className="flex items-center gap-2 px-2.5 py-2 rounded text-[12px] mb-3" style={{ backgroundColor: 'var(--status-red-bg)', color: 'var(--status-red-fg)' }}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Revisão em {dias} dia{dias === 1 ? '' : 's'} ({fmtDate(v.proxima_revisao)})
                  </div>
                ) : v.proxima_revisao ? (
                  <div className="text-[11px] mb-3" style={{ color: 'var(--ink-muted)' }}>Próxima revisão: {fmtDate(v.proxima_revisao)}</div>
                ) : null}
                <div className="flex justify-end gap-1 pt-2 border-t" style={{ borderColor: 'var(--line-soft)' }}>
                  <button onClick={() => open(v)} className="p-1.5 rounded hover:bg-black/5"><Pencil className="w-3.5 h-3.5" style={{ color: 'var(--ink-muted)' }} /></button>
                  <button onClick={() => del(v.id)} className="p-1.5 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-red-fg)' }} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing && editing !== 'new' ? 'Editar veículo' : 'Novo veículo'}
        footer={
          <>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded text-[13px] border" style={{ borderColor: 'var(--line)' }}>Cancelar</button>
            <button form="v-form" type="submit" disabled={busy} className="px-4 py-2 rounded text-[13px] font-bold text-white disabled:opacity-60" style={{ backgroundColor: 'var(--brand)' }}>{busy ? 'Salvando…' : 'Salvar'}</button>
          </>
        }>
        <form id="v-form" onSubmit={save}>
          <Select label="Cliente" required value={form.cliente_id || ''} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
            options={clientes.map((c) => ({ value: c.id, label: c.nome }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Marca" required value={form.marca || ''} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
            <Input label="Modelo" required value={form.modelo || ''} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <NumberInput label="Ano" min={1980} max={2030} value={form.ano || ''} onChange={(e) => setForm({ ...form, ano: e.target.value })} />
            <Input label="Placa" required value={form.placa || ''} onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })} />
            <Input label="Cor" value={form.cor || ''} onChange={(e) => setForm({ ...form, cor: e.target.value })} />
          </div>
          <NumberInput label="Quilometragem" value={form.quilometragem || ''} onChange={(e) => setForm({ ...form, quilometragem: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <DateInput label="Última revisão" value={form.ultima_revisao || ''} onChange={(e) => setForm({ ...form, ultima_revisao: e.target.value })} />
            <DateInput label="Próxima revisão" value={form.proxima_revisao || ''} onChange={(e) => setForm({ ...form, proxima_revisao: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

