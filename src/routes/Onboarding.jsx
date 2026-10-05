import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { callBackend } from '@/blink/backend';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useEmpresa } from '@/lib/empresa';
import { Input, Textarea } from '@/components/app/FormField';
import { Building2, Palette, Users, Car, Sparkles, Check, ChevronRight, ChevronLeft, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { key: 'empresa',  label: 'Dados da oficina', icon: Building2 },
  { key: 'branding', label: 'Branding',         icon: Palette },
  { key: 'equipe',   label: 'Equipe inicial',   icon: Users },
  { key: 'cliente',  label: 'Primeiro cliente', icon: Car },
  { key: 'pronto',   label: 'Pronto!',          icon: Sparkles },
];

const STORE_KEY = 'autoflow_onboarding';

export default function Onboarding() {
  const { user, loading } = useAuth();
  const { empresa, isLoading, refresh } = useEmpresa();
  const nav = useNavigate();

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState({});

  useEffect(() => {
    if (empresa && !data.nome) {
      setData((p) => ({ ...p, nome: empresa.nome, telefone: empresa.telefone, endereco: empresa.endereco, cor_primaria: empresa.cor_primaria || '#1C3F5E', slogan: empresa.slogan }));
    }
  }, [empresa]);


  if (loading || isLoading) return <div className="min-h-screen flex items-center justify-center">Carregando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (empresa?.onboarding_concluido) return <Navigate to="/app/dashboard" replace />;

  const set = (k, v) => setData((p) => ({ ...p, [k]: v }));

  // Persist empresa fields when leaving step 1 or 2
  const persistEmpresa = async () => {
    if (!empresa?.id) {
      const created=await callBackend('/api/onboarding',{nome:data.nome,slogan:data.slogan||null,telefone:data.telefone||null,endereco:data.endereco||null,cor_primaria:data.cor_primaria||'#1C3F5E'});
      await refresh();
      return created.id;
    } else {
      const { error } = await supabase.from('empresa').update({
        nome: data.nome, slogan: data.slogan || null, telefone: data.telefone || null,
        endereco: data.endereco || null, cor_primaria: data.cor_primaria || '#1C3F5E',
        logo_url: data.logo_url || empresa.logo_url,
      }).eq('id', empresa.id);
      if (error) throw error;
      return empresa.id;
    }
  };

  const next = async () => {
    setBusy(true);
    try {
      if (step === 0) { if (!data.nome) throw new Error('Informe o nome da oficina.'); await persistEmpresa(); }
      if (step === 1) { await persistEmpresa(); }
      if (step === 2 && !data.teamSaved && (data.equipe || []).length > 0) {
        const empId = empresa?.id || await persistEmpresa();
        for (const m of data.equipe) {
          if (m.email && m.nome) {const {error}=await supabase.from('empresa_user').insert({ empresa_id: empId, email: m.email, nome: m.nome, role: m.role || 'tecnico', ativo: true });if(error&&!error.message.includes('UNIQUE'))throw error;}
        }
      }
      if(step===2)set('teamSaved',true);
      if (step === 3 && !data.clientSaved && data.cliente_nome) {
        const empId = empresa?.id || await persistEmpresa();
        const { data: cli, error: clientError } = await supabase.from('cliente').insert({ empresa_id: empId, nome: data.cliente_nome, telefone: data.cliente_tel || null }).select().single();
        if(clientError)throw clientError;
        set('clientSaved',true);
        if (cli && data.veic_placa) {
          await supabase.from('veiculo').insert({
            empresa_id: empId, cliente_id: cli.id, cliente_nome: cli.nome,
            marca: data.veic_marca, modelo: data.veic_modelo, placa: data.veic_placa.toUpperCase(),
          });
        }
      }
      setStep((s) => Math.min(STEPS.length - 1, s + 1));
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const finish = async () => {
    setBusy(true);
    try {
      const {error}=await supabase.from('empresa').update({ onboarding_concluido: true }).eq('id', empresa.id); if(error)throw error; await refresh();
      localStorage.removeItem(`${STORE_KEY}_step`);
      localStorage.removeItem(`${STORE_KEY}_data`);
      toast.success('Tudo pronto! Trial de 14 dias ativado.');
      nav('/app/dashboard', { replace: true });
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const uploadLogo = async (file) => {
    if (!file || !empresa?.id) { toast.error('Salve os dados da oficina primeiro.'); return; }
    try {
      if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>150000)throw Error('Use PNG, JPG ou WebP de até 150 KB.');
      const publicUrl=await new Promise((ok,no)=>{const reader=new FileReader();reader.onload=()=>ok(reader.result);reader.onerror=no;reader.readAsDataURL(file)});
      set('logo_url',publicUrl);
      toast.success('Logo carregado.');
    } catch (e) { toast.error(e.message); }
  };

  const StepIcon = STEPS[step].icon;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <div key={s.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px]"
                      style={{ backgroundColor: done ? 'var(--status-green-fg)' : active ? 'var(--brand)' : 'var(--surface-sunken)', color: done || active ? '#fff' : 'var(--ink-muted)' }}>
                      {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="text-[10px] mt-1 hidden sm:block font-semibold" style={{ color: active ? 'var(--brand)' : 'var(--ink-muted)' }}>{s.label}</div>
                  </div>
                  {i < STEPS.length - 1 && <div className="flex-1 h-0.5 mx-2" style={{ backgroundColor: done ? 'var(--status-green-fg)' : 'var(--line)' }} />}
                </div>
              );
            })}
          </div>
          <div className="h-1 rounded overflow-hidden" style={{ backgroundColor: 'var(--surface-sunken)' }}>
            <div className="h-full transition-all" style={{ width: `${progress}%`, backgroundColor: 'var(--brand)' }} />
          </div>
        </div>

        <div className="rounded-lg border p-8" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
          <div className="flex items-center gap-3 mb-1">
            <StepIcon className="w-6 h-6" style={{ color: 'var(--brand)' }} />
            <h1 className="text-[22px] font-black">{STEPS[step].label}</h1>
          </div>
          <div className="text-[13px] mb-5" style={{ color: 'var(--ink-muted)' }}>Passo {step + 1} de {STEPS.length}</div>

          {step === 0 && (
            <div>
              <Input label="Nome da oficina" required value={data.nome || ''} onChange={(e) => set('nome', e.target.value)} />
              <Input label="Slogan" value={data.slogan || ''} onChange={(e) => set('slogan', e.target.value)} placeholder="Ex: Sua oficina rodando como linha de produção" />
              <Input label="Telefone" value={data.telefone || ''} onChange={(e) => set('telefone', e.target.value)} placeholder="(11) 99999-9999" />
              <Textarea label="Endereço" rows={2} value={data.endereco || ''} onChange={(e) => set('endereco', e.target.value)} />
            </div>
          )}

          {step === 1 && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--ink-muted)' }}>Cor primária</label>
              <div className="flex items-center gap-3 mb-4">
                <input type="color" value={data.cor_primaria || '#1C3F5E'} onChange={(e) => set('cor_primaria', e.target.value)} className="w-16 h-12 rounded border cursor-pointer" />
                <Input value={data.cor_primaria || '#1C3F5E'} onChange={(e) => set('cor_primaria', e.target.value)} />
              </div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--ink-muted)' }}>Logo</label>
              <div className="flex items-center gap-3 mb-4">
                {data.logo_url && <img src={data.logo_url} alt="" className="w-16 h-16 rounded object-cover border" style={{ borderColor: 'var(--line)' }} />}
                <label className="flex items-center gap-2 px-3 py-2 rounded border cursor-pointer text-[12px]" style={{ borderColor: 'var(--line)' }}>
                  <Upload className="w-3.5 h-3.5" /> Carregar logo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadLogo(e.target.files?.[0])} />
                </label>
              </div>
              <div className="rounded-lg p-4 text-white" style={{ backgroundColor: data.cor_primaria || '#1C3F5E' }}>
                <div className="font-bold">Preview da sidebar</div>
                <div className="text-[12px] opacity-80">{data.nome || 'Sua oficina'}</div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="text-[12px] mb-3" style={{ color: 'var(--ink-muted)' }}>Adicione técnicos e atendentes (você pode pular).</div>
              <div className="space-y-2 mb-3">
                {(data.equipe || []).map((m, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4"><Input placeholder="Nome" value={m.nome || ''} onChange={(e) => set('equipe', data.equipe.map((x, j) => j === i ? { ...x, nome: e.target.value } : x))} /></div>
                    <div className="col-span-5"><Input type="email" placeholder="E-mail" value={m.email || ''} onChange={(e) => set('equipe', data.equipe.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} /></div>
                    <div className="col-span-2">
                      <select value={m.role || 'tecnico'} onChange={(e) => set('equipe', data.equipe.map((x, j) => j === i ? { ...x, role: e.target.value } : x))}
                        className="w-full px-2 py-2 rounded border text-[12px]" style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--line)' }}>
                        <option value="tecnico">Técnico</option><option value="recepcao">Recepção</option><option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="col-span-1"><button onClick={() => set('equipe', data.equipe.filter((_, j) => j !== i))} className="p-1.5"><Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-red-fg)' }} /></button></div>
                  </div>
                ))}
              </div>
              <button onClick={() => set('equipe', [...(data.equipe || []), {}])} className="text-[12px] font-bold flex items-center gap-1" style={{ color: 'var(--brand)' }}>
                <Plus className="w-3 h-3" /> Adicionar membro
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="text-[12px] mb-3" style={{ color: 'var(--ink-muted)' }}>Cadastre seu primeiro cliente e veículo (opcional).</div>
              <Input label="Nome do cliente" value={data.cliente_nome || ''} onChange={(e) => set('cliente_nome', e.target.value)} />
              <Input label="Telefone" value={data.cliente_tel || ''} onChange={(e) => set('cliente_tel', e.target.value)} />
              <div className="grid grid-cols-3 gap-3">
                <Input label="Marca" value={data.veic_marca || ''} onChange={(e) => set('veic_marca', e.target.value)} />
                <Input label="Modelo" value={data.veic_modelo || ''} onChange={(e) => set('veic_modelo', e.target.value)} />
                <Input label="Placa" value={data.veic_placa || ''} onChange={(e) => set('veic_placa', e.target.value.toUpperCase())} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--brand-subtle)' }}>
                <Sparkles className="w-8 h-8" style={{ color: 'var(--brand)' }} />
              </div>
              <h2 className="text-[20px] font-black mb-2">Tudo pronto, {data.nome}!</h2>
              <p className="text-[13px] mb-4" style={{ color: 'var(--ink-muted)' }}>Seu trial de <strong>14 dias gratuitos</strong> começa agora. Acesse o painel e comece a trabalhar.</p>
              <div className="rounded-lg p-4 text-left text-[12px] mb-5" style={{ backgroundColor: 'var(--surface-sunken)' }}>
                <div><strong>Oficina:</strong> {data.nome}</div>
                {data.telefone && <div><strong>Telefone:</strong> {data.telefone}</div>}
                <div><strong>Equipe inicial:</strong> {(data.equipe || []).length + 1} pessoa(s)</div>
                {data.cliente_nome && <div><strong>Primeiro cliente:</strong> {data.cliente_nome}</div>}
              </div>
              <button onClick={finish} disabled={busy} className="px-6 py-3 rounded text-[14px] font-bold text-white flex items-center gap-2 mx-auto disabled:opacity-60" style={{ backgroundColor: 'var(--brand)' }}>
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Começar trial 14 dias →
              </button>
            </div>
          )}

          {step < 4 && (
            <div className="flex justify-between mt-6 pt-5 border-t" style={{ borderColor: 'var(--line-soft)' }}>
              <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="px-4 py-2 rounded text-[13px] border flex items-center gap-1 disabled:opacity-40" style={{ borderColor: 'var(--line)' }}>
                <ChevronLeft className="w-3.5 h-3.5" /> Voltar
              </button>
              <button onClick={next} disabled={busy} className="px-5 py-2 rounded text-[13px] font-bold text-white flex items-center gap-1 disabled:opacity-60" style={{ backgroundColor: 'var(--brand)' }}>
                {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Continuar <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

