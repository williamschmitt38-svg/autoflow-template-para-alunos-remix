import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useEmpresa } from '@/lib/empresa';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';
import Modal from '@/components/app/Modal';
import { Input, Select } from '@/components/app/FormField';
import Badge from '@/components/common/Badge';
import { UserPlus, Mail, Phone, Pencil, Pause, Copy, Users, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = [
  { value: 'admin', label: 'Admin', color: 'red' },
  { value: 'tecnico', label: 'Técnico', color: 'green' },
  { value: 'recepcao', label: 'Recepção', color: 'blue' },
  { value: 'financeiro', label: 'Financeiro', color: 'amber' },
];

const roleLabel = (r) => ROLES.find((x) => x.value === r)?.label || r;
const roleColor = (r) => ROLES.find((x) => x.value === r)?.color || 'gray';

export default function Equipe() {
  useDocumentTitle('Equipe');
  const { empresaId, empresa } = useEmpresa();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [invite, setInvite] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('tecnico');

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['equipe', empresaId],
    enabled: !!empresaId,
    queryFn: async () => (await supabase.from('empresa_user').select('*').eq('empresa_id', empresaId).order('created_at')).data || [],
  });

  const { data: osCounts = {} } = useQuery({
    queryKey: ['equipe-os', empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data } = await supabase.from('ordem_servico').select('tecnico,status,data_conclusao').eq('empresa_id', empresaId);
      const m = new Date().toISOString().slice(0, 7);
      const out = {};
      (data || []).forEach((o) => {
        if (!o.tecnico) return;
        out[o.tecnico] = out[o.tecnico] || { ativas: 0, mes: 0 };
        if (['aberta', 'em_andamento', 'aguardando_peca'].includes(o.status)) out[o.tecnico].ativas++;
        if (o.status === 'concluida' && o.data_conclusao?.startsWith(m)) out[o.tecnico].mes++;
      });
      return out;
    },
  });

  const open = (row) => {
    setEditing(row || 'new');
    setForm(row && row !== 'new' ? row : { role: 'tecnico', ativo: true });
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { nome: form.nome, email: form.email, role: form.role, ativo: !!form.ativo };
      if (editing && editing !== 'new') {
        const { error } = await supabase.from('empresa_user').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Membro atualizado.');
      } else {
        const { error } = await supabase.from('empresa_user').insert({ ...payload, empresa_id: empresaId });
        if (error) throw error;
        toast.success('Membro adicionado. Peça que entre com este email verificado. Nenhum convite foi enviado.');
      }
      qc.invalidateQueries({ queryKey: ['equipe', empresaId] });
      setEditing(null);
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const suspender = async (m) => {
    if (!confirm(`${m.ativo ? 'Suspender' : 'Reativar'} ${m.nome}?`)) return;
    const { error } = await supabase.from('empresa_user').update({ ativo: !m.ativo }).eq('id', m.id);
    if (error) toast.error(error.message); else { toast.success(m.ativo ? 'Suspenso.' : 'Reativado.'); qc.invalidateQueries({ queryKey: ['equipe', empresaId] }); }
  };

  const gerarConvite = () => {
    const token = Math.random().toString(36).slice(2, 10);
    const slug = empresa?.slug || empresa?.id?.slice(0, 8) || 'oficina';
    const url = `${window.location.origin}/convite/${slug}/${token}`;
    setInvite({ email: inviteEmail, role: inviteRole, url });
  };

  const copiar = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!');
  };

  return (
    <div>
      <PageHeader title="Equipe" subtitle={`${rows.length} membros • ${rows.filter((r) => r.ativo).length} ativos`} actions={
        <div className="flex gap-2">
          <button onClick={() => { setInvite('open'); setInviteEmail(''); setInviteRole('tecnico'); }} className="flex items-center gap-2 px-4 py-2 rounded text-[13px] font-bold border" style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
            <LinkIcon className="w-4 h-4" /> Gerar convite
          </button>
          <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2 rounded text-[13px] font-bold text-white" style={{ backgroundColor: 'var(--brand)' }}>
            <UserPlus className="w-4 h-4" /> Adicionar membro
          </button>
        </div>
      } />

      {isLoading ? <div className="text-[13px]">Carregando…</div> : rows.length === 0 ? (
        <div className="rounded-lg border p-12 text-center" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
          <Users className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--ink-faint)' }} />
          <div className="text-[14px] font-semibold">Nenhum membro cadastrado.</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((m) => {
            const os = osCounts[m.nome] || { ativas: 0, mes: 0 };
            return (
              <div key={m.id} className="rounded-lg border p-5" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)', opacity: m.ativo ? 1 : 0.6 }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-[15px]" style={{ backgroundColor: 'var(--brand)' }}>
                    {m.nome?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[14px] truncate">{m.nome}</div>
                    <Badge tone={roleColor(m.role)}>{roleLabel(m.role)}</Badge>
                  </div>
                  <Badge tone={m.ativo ? 'green' : 'gray'}>{m.ativo ? 'Ativo' : 'Inativo'}</Badge>
                </div>
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--ink-2)' }}><Mail className="w-3 h-3" />{m.email}</div>
                  {m.telefone && <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--ink-muted)' }}><Phone className="w-3 h-3" />{m.telefone}</div>}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center p-2 rounded" style={{ backgroundColor: 'var(--surface-sunken)' }}>
                    <div className="text-[18px] font-black" style={{ color: 'var(--brand)' }}>{os.ativas}</div>
                    <div className="text-[10px] uppercase font-semibold" style={{ color: 'var(--ink-muted)' }}>OS ativas</div>
                  </div>
                  <div className="text-center p-2 rounded" style={{ backgroundColor: 'var(--surface-sunken)' }}>
                    <div className="text-[18px] font-black" style={{ color: 'var(--status-green-fg)' }}>{os.mes}</div>
                    <div className="text-[10px] uppercase font-semibold" style={{ color: 'var(--ink-muted)' }}>Concluídas mês</div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--line-soft)' }}>
                  <button onClick={() => open(m)} className="flex-1 py-1.5 rounded text-[12px] border flex items-center justify-center gap-1" style={{ borderColor: 'var(--line)' }}>
                    <Pencil className="w-3 h-3" /> Editar
                  </button>
                  <button onClick={() => suspender(m)} className="flex-1 py-1.5 rounded text-[12px] border flex items-center justify-center gap-1" style={{ borderColor: 'var(--line)', color: m.ativo ? 'var(--status-red-fg)' : 'var(--status-green-fg)' }}>
                    <Pause className="w-3 h-3" /> {m.ativo ? 'Suspender' : 'Reativar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing && editing !== 'new' ? 'Editar membro' : 'Adicionar membro'}
        footer={<>
          <button onClick={() => setEditing(null)} className="px-4 py-2 rounded text-[13px] border" style={{ borderColor: 'var(--line)' }}>Cancelar</button>
          <button form="m-form" type="submit" disabled={busy} className="px-4 py-2 rounded text-[13px] font-bold text-white disabled:opacity-60" style={{ backgroundColor: 'var(--brand)' }}>{busy ? 'Salvando…' : 'Salvar'}</button>
        </>}>
        <form id="m-form" onSubmit={save}>
          <Input label="Nome" required value={form.nome || ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <Input type="email" label="E-mail" required value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Select label="Papel" required value={form.role || 'tecnico'} onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={ROLES.map((r) => ({ value: r.value, label: r.label }))} placeholder="" />
          <label className="flex items-center gap-2 mt-3 text-[13px]">
            <input type="checkbox" checked={!!form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
            Membro ativo
          </label>
        </form>
      </Modal>

      <Modal open={invite === 'open' || (invite && typeof invite === 'object')} onClose={() => setInvite(null)} title="Gerar convite">
        {!invite || invite === 'open' ? (
          <>
            <Input type="email" label="E-mail do convidado" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <Select label="Papel" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} options={ROLES.map((r) => ({ value: r.value, label: r.label }))} placeholder="" />
            <button onClick={gerarConvite} disabled={!inviteEmail} className="w-full mt-3 py-2 rounded text-[13px] font-bold text-white disabled:opacity-60" style={{ backgroundColor: 'var(--brand)' }}>Gerar link</button>
          </>
        ) : (
          <>
            <div className="text-[12px] mb-2" style={{ color: 'var(--ink-muted)' }}>Convite gerado para <strong>{invite.email}</strong> ({roleLabel(invite.role)})</div>
            <div className="flex gap-2">
              <input readOnly value={invite.url} className="flex-1 px-3 py-2 rounded border text-[12px] font-mono" style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--line)' }} />
              <button onClick={() => copiar(invite.url)} className="px-3 py-2 rounded text-[12px] font-bold text-white flex items-center gap-1" style={{ backgroundColor: 'var(--brand)' }}>
                <Copy className="w-3.5 h-3.5" /> Copiar
              </button>
            </div>
            <div className="text-[11px] mt-2" style={{ color: 'var(--ink-muted)' }}>Em produção, este link seria enviado por e-mail automaticamente.</div>
          </>
        )}
      </Modal>
    </div>
  );
}

