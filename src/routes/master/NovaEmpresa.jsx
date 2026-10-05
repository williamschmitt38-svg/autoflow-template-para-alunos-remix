import { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { callBackend } from '@/blink/backend';

export default function NovaEmpresa() {
  const [form, setForm] = useState({ nome: '', owner_email: '', owner_nome: '', plano: 'trial', telefone: '', cnpj: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await callBackend('/api/master/empresa',form);
      toast.success('Oficina criada. O proprietário deve entrar com o email informado e verificado. Nenhum convite foi enviado.');
      setForm({ nome: '', owner_email: '', owner_nome: '', plano: 'trial', telefone: '', cnpj: '' });
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader title="Nova empresa" subtitle="Criar empresa manualmente (modo super admin)" />
      <form onSubmit={submit} className="rounded-lg border p-6 max-w-2xl space-y-3" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
        <F label="Nome da empresa *" value={form.nome} onChange={v => setForm(p => ({ ...p, nome: v }))} required />
        <div className="grid grid-cols-2 gap-3">
          <F label="Nome do owner" value={form.owner_nome} onChange={v => setForm(p => ({ ...p, owner_nome: v }))} />
          <F label="E-mail do owner *" type="email" value={form.owner_email} onChange={v => setForm(p => ({ ...p, owner_email: v }))} required />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <F label="Telefone" value={form.telefone} onChange={v => setForm(p => ({ ...p, telefone: v }))} />
          <F label="CNPJ" value={form.cnpj} onChange={v => setForm(p => ({ ...p, cnpj: v }))} />
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-muted)' }}>Plano</label>
            <select value={form.plano} onChange={e => setForm(p => ({ ...p, plano: e.target.value }))} className="w-full rounded border px-3 py-2 text-[13px]" style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--line)' }}>
              <option value="trial">Trial</option>
              <option value="basico">Iniciante</option>
              <option value="profissional">Profissional</option>
              
            </select>
          </div>
        </div>
        <p className="text-[11px]" style={{ color: 'var(--ink-faint)' }}>Obs: o owner ainda precisa criar a conta via /login com este e-mail para vincular.</p>
        <button type="submit" disabled={busy} className="px-4 py-2 rounded text-[13px] font-bold text-white flex items-center gap-2 disabled:opacity-50" style={{ backgroundColor: 'var(--brand-master)' }}>
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Criar empresa
        </button>
      </form>
    </div>
  );
}

const F = ({ label, value, onChange, required, type = 'text' }) => (
  <div>
    <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-muted)' }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} className="w-full rounded border px-3 py-2 text-[13px]" style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--line)' }} />
  </div>
);

