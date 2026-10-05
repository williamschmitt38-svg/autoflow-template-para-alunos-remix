import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useEmpresa } from '@/lib/empresa';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import FormDialog from '@/components/common/FormDialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * CRUD generico tenant-aware. Usa empresa_id automaticamente.
 * Suporta create/update/delete via FormDialog.
 */
export default function CrudPage({
  table, title, subtitle, columns, fields, searchKeys = [], defaults = {},
  order = { column: 'created_at', ascending: false }, transformBeforeSave,
}) {
  const { empresaId } = useEmpresa();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null); // null | 'new' | row
  const [busy, setBusy] = useState(false);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: [table, empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select('*')
        .eq('empresa_id', empresaId).order(order.column, { ascending: order.ascending });
      if (error) throw error;
      return data;
    },
  });

  const save = async (payload) => {
    setBusy(true);
    try {
      const finalPayload = transformBeforeSave ? transformBeforeSave(payload, editing) : payload;
      if (editing && editing !== 'new') {
        const { error } = await supabase.from(table).update(finalPayload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Atualizado!');
      } else {
        const { error } = await supabase.from(table).insert({ ...defaults, ...finalPayload, empresa_id: empresaId });
        if (error) throw error;
        toast.success('Criado!');
      }
      qc.invalidateQueries({ queryKey: [table, empresaId] });
      setEditing(null);
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const del = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [table, empresaId] }); toast.success('Excluído.'); },
    onError: (e) => toast.error(e.message),
  });

  const cols = [
    ...columns,
    {
      header: '', render: (r) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => setEditing(r)} className="p-1.5 rounded hover:bg-black/5" title="Editar"><Pencil className="w-3.5 h-3.5" style={{ color: 'var(--ink-muted)' }} /></button>
          <button onClick={() => { if (confirm('Excluir este registro?')) del.mutate(r.id); }} className="p-1.5 rounded hover:bg-red-50" title="Excluir"><Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-red-fg)' }} /></button>
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} actions={
        <button onClick={() => setEditing('new')} className="flex items-center gap-2 px-4 py-2 rounded text-[13px] font-bold text-white" style={{ backgroundColor: 'var(--brand)' }}>
          <Plus className="w-4 h-4" /> Novo
        </button>
      } />
      {isLoading ? (
        <div className="text-[13px]" style={{ color: 'var(--ink-muted)' }}>Carregando…</div>
      ) : (
        <DataTable rows={rows} columns={cols} searchKeys={searchKeys} />
      )}
      <FormDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing && editing !== 'new' ? `Editar ${title.slice(0, -1)}` : `Novo ${title.slice(0, -1)}`}
        fields={fields}
        initial={editing && editing !== 'new' ? editing : {}}
        onSubmit={save}
        busy={busy}
      />
    </div>
  );
}

