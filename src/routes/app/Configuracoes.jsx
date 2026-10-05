import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useEmpresa } from '@/lib/empresa';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';
import { Input, Textarea, Select } from '@/components/app/FormField';
import Badge from '@/components/common/Badge';
import { fmtCurrency, fmtDate } from '@/lib/format';
import { Building2, Palette, CreditCard, Plug, Upload, Check, Download, MessageSquare, Mail, Webhook } from 'lucide-react';
import { toast } from 'sonner';

const TABS = [
  { key: 'empresa',     label: 'Empresa',     icon: Building2 },
  { key: 'aparencia',   label: 'Aparência',   icon: Palette },
  { key: 'cobranca',    label: 'Cobrança',    icon: CreditCard },
  { key: 'integracoes', label: 'Integrações', icon: Plug },
];

const PLANOS = [
  { key: 'trial',         nome: 'Trial',         preco: 0,   features: ['14 dias grátis', 'Até 2 usuários', 'Suporte por e-mail'] },
  { key: 'basico',        nome: 'Básico',        preco: 97,  features: ['Até 5 usuários', 'Clientes ilimitados', 'Suporte WhatsApp'] },
  { key: 'profissional',  nome: 'Profissional',  preco: 197, features: ['Usuários ilimitados', 'AI Growth Engine', 'Integrações nativas', 'Suporte prioritário'] },
];

export default function Configuracoes() {
  useDocumentTitle('Configurações');
  const { empresa, refresh } = useEmpresa();
  const qc = useQueryClient();
  const [tab, setTab] = useState('empresa');
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (empresa) setForm(empresa); }, [empresa]);

  const saveEmpresa = async (e) => {
    e?.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.from('empresa').update({
        nome: form.nome, slogan: form.slogan, cnpj: form.cnpj,
        telefone: form.telefone, email: form.email, endereco: form.endereco,
        cor_primaria: form.cor_primaria, logo_url: form.logo_url, slug:form.slug, whatsapp:form.whatsapp,sobre:form.sobre,vitrine_ativa:form.vitrine_ativa,
      }).eq('id', empresa.id);
      if (error) throw error;
      toast.success('Configurações salvas.');
      refresh();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const uploadLogo = async (file) => {
    if (!file) return;
    try {
      if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>150000)throw Error('Use PNG, JPG ou WebP de até 150 KB.');
      const publicUrl=await new Promise((ok,no)=>{const reader=new FileReader();reader.onload=()=>ok(reader.result);reader.onerror=no;reader.readAsDataURL(file)});
      setForm(p=>({...p,logo_url:publicUrl}));
      toast.success('Logo carregado. Clique em Salvar.');
    } catch (e) { toast.error(e.message); }
  };


  if (!empresa) return <div className="text-[13px]">Carregando…</div>;

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Gerencie sua oficina, aparência e cobrança" />

      <div className="flex border-b mb-5 overflow-x-auto" style={{ borderColor: 'var(--line)' }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className="px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap"
              style={{ borderColor: on ? 'var(--brand)' : 'transparent', color: on ? 'var(--brand)' : 'var(--ink-muted)' }}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'empresa' && (
        <form onSubmit={saveEmpresa} className="max-w-2xl rounded-lg border p-6" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
          <Input label="Nome da oficina" required value={form.nome || ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <Input label="Endereço da vitrine (apenas letras minúsculas, números e hífen)" value={form.slug||''} onChange={e=>setForm({...form,slug:e.target.value})}/><Input label="WhatsApp com DDI (ex.: 5511999999999)" value={form.whatsapp||''} onChange={e=>setForm({...form,whatsapp:e.target.value})}/><Textarea label="Sobre a oficina" value={form.sobre||''} onChange={e=>setForm({...form,sobre:e.target.value})}/><a href={'/vitrine/'+empresa.slug} target="_blank" rel="noreferrer" className="block mb-4 underline">Abrir vitrine pública</a><Input label="Slogan" value={form.slogan || ''} onChange={(e) => setForm({ ...form, slogan: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="CNPJ" value={form.cnpj || ''} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
            <Input label="Telefone" value={form.telefone || ''} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          </div>
          <Input type="email" label="E-mail" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Textarea label="Endereço" rows={2} value={form.endereco || ''} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
          <div className="mb-3">
            <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-muted)' }}>Logo</label>
            <div className="flex items-center gap-3">
              {form.logo_url && <img src={form.logo_url} alt="" className="w-14 h-14 rounded object-cover border" style={{ borderColor: 'var(--line)' }} />}
              <label className="flex items-center gap-2 px-3 py-2 rounded border cursor-pointer text-[12px]" style={{ borderColor: 'var(--line)' }}>
                <Upload className="w-3.5 h-3.5" /> Carregar imagem
                <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadLogo(e.target.files?.[0])} />
              </label>
            </div>
          </div>
          <button type="submit" disabled={busy} className="px-5 py-2 rounded text-[13px] font-bold text-white disabled:opacity-60" style={{ backgroundColor: 'var(--brand)' }}>
            {busy ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </form>
      )}

      {tab === 'aparencia' && (
        <div className="max-w-2xl rounded-lg border p-6 space-y-4" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--ink-muted)' }}>Cor primária</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.cor_primaria || '#1C3F5E'} onChange={(e) => setForm({ ...form, cor_primaria: e.target.value })} className="w-16 h-12 rounded border cursor-pointer" />
              <Input value={form.cor_primaria || ''} onChange={(e) => setForm({ ...form, cor_primaria: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--ink-muted)' }}>Preview</label>
            <div className="rounded-lg p-5 text-white" style={{ backgroundColor: form.cor_primaria || '#1C3F5E' }}>
              <div className="font-bold text-[16px]">{form.nome || 'AutoFlow'}</div>
              <div className="text-[12px] opacity-80">{form.slogan || 'Sua oficina rodando como linha de produção'}</div>
            </div>
          </div>
          <button onClick={saveEmpresa} disabled={busy} className="px-5 py-2 rounded text-[13px] font-bold text-white disabled:opacity-60" style={{ backgroundColor: 'var(--brand)' }}>
            {busy ? 'Salvando…' : 'Aplicar'}
          </button>
        </div>
      )}

      {tab==='cobranca'&&<div className="rounded-lg border p-6"><h2 className="font-bold mb-3">Controle administrativo</h2><p>Plano cadastrado: {empresa.plano}. Status: {empresa.status_cobranca}.</p><p className="mt-3 text-sm">O template não processa pagamentos de assinatura. O proprietário define preços e condições e registra o status no painel Master. Não existem faturas ou cobranças automáticas nesta versão.</p></div>}
      {tab==='integracoes'&&<div className="rounded-lg border p-6"><h2 className="font-bold mb-3">Recursos externos</h2><p>As mensagens são preparadas para envio manual no WhatsApp. Pagamentos online, email transacional, integrações de peças e IA generativa ainda exigem implementação e configuração próprias.</p></div>}

    </div>
  );
}

