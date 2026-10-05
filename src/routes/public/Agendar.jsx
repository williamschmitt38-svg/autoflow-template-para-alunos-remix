import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input, Select } from '@/components/app/FormField';
import { toast } from 'sonner';
import { CheckCircle2, MessageCircle, ArrowLeft, Calendar } from 'lucide-react';

const TIPOS = [
  { value: 'Diagnóstico grátis', label: 'Diagnóstico grátis' },
  { value: 'Revisão preventiva', label: 'Revisão preventiva' },
  { value: 'Avaliação para compra', label: 'Avaliação para compra' },
  { value: 'Outro', label: 'Outro' },
];

const HORARIOS = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'];

export default function Agendar() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestId] = useState(()=>crypto.randomUUID());
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);
  const [form, setForm] = useState({
    tipo: 'Diagnóstico grátis',
    data_agendada: '', hora_agendada: '',
    cliente_nome: '', cliente_telefone: '', cliente_email: '',
    veiculo_marca: '', veiculo_modelo: '', veiculo_ano: '', veiculo_placa: '',
  });

  useEffect(() => {
    (async () => {
      const { data: emp } = await supabase.from('empresa_publica').select('*').eq('slug', slug).maybeSingle();
      setEmpresa(emp); setLoading(false);
    })();
  }, [slug]);

  const minDate = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate()+1);
    return d.toISOString().slice(0,10);
  }, []);

  async function submit(e){
    e.preventDefault();
    if (!form.cliente_nome || !form.cliente_telefone || !form.data_agendada || !form.hora_agendada) {
      toast.error('Preencha os campos obrigatórios'); return;
    }
    setSaving(true);
    const { data, error } = await supabase.rpc('create_public_solicitacao', { _payload: { request_id: requestId, empresa_id: empresa.id, tipo: 'agendamento', cliente_nome: form.cliente_nome, cliente_telefone: form.cliente_telefone, cliente_email: form.cliente_email || null, veiculo_marca: form.veiculo_marca || null, veiculo_modelo: form.veiculo_modelo || null, veiculo_ano: form.veiculo_ano || null, veiculo_placa: form.veiculo_placa || null, data_agendada: form.data_agendada, hora_agendada: form.hora_agendada, descricao: form.tipo, servicos: [{ nome: form.tipo }] } });
    setSaving(false);
    if (error) { toast.error('Erro: '+error.message); return; }
    setDone(Array.isArray(data) ? data[0] : data);

  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando…</div>;
  if (!empresa) return <div className="min-h-screen flex items-center justify-center">Oficina não encontrada</div>;

  const brand = empresa.cor_primaria || '#1C3F5E';

  if (done) {
    const wppMsg = encodeURIComponent(`Olá! Solicitei uma visita pelo site. Protocolo ${done.protocolo}, dia ${done.data_agendada} às ${done.hora_agendada}.`);
    const wppLink = `https://wa.me/${(empresa.whatsapp||'').replace(/\D/g,'')}?text=${wppMsg}`;
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center border" style={{ borderColor: 'var(--line)' }}>
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: brand+'15' }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: brand }}/>
          </div>
          <h1 className="text-[24px] font-black mb-2" style={{ color: 'var(--ink)' }}>Solicitação recebida!</h1>
          <p className="text-[14px] mb-1" style={{ color: 'var(--ink-muted)' }}>{new Date(done.data_agendada+'T00:00').toLocaleDateString('pt-BR')} às {done.hora_agendada}</p>
          <div className="rounded-lg p-4 my-5" style={{ backgroundColor: 'var(--surface-sunken)' }}>
            <div className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: 'var(--ink-muted)' }}>Protocolo</div>
            <div className="text-[20px] font-black font-mono" style={{ color: brand }}>{done.protocolo}</div>
          </div>
          <a href={wppLink} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded text-white font-bold bg-emerald-500 hover:bg-emerald-600 text-[14px]">
            <MessageCircle className="w-4 h-4"/> Confirmar no WhatsApp
          </a>
          <Link to={`/vitrine/${slug}`} className="block mt-3 text-[12px]" style={{ color: 'var(--ink-muted)' }}>← Voltar à vitrine</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--surface)', minHeight: '100vh' }}>
      <header className="text-white py-4 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${brand}, ${brand}dd)` }}>
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }}/>
        <div className="relative max-w-3xl mx-auto px-5 flex items-center justify-between">
          <Link to={`/vitrine/${slug}`} className="flex items-center gap-2 text-[13px] hover:opacity-80 font-semibold"><ArrowLeft className="w-4 h-4"/> {empresa.nome}</Link>
          <div className="text-[12px] opacity-80 font-semibold uppercase tracking-wider">Agendar visita</div>
        </div>
      </header>

      <form onSubmit={submit} className="max-w-3xl mx-auto px-5 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: `linear-gradient(135deg, ${brand}20, ${brand}10)`, color: brand }}><Calendar className="w-5 h-5"/></div>
          <div>
            <h1 className="text-[26px] font-black tracking-tight" style={{ color: 'var(--ink)' }}>Agendar diagnóstico</h1>
            <p className="text-[13px]" style={{ color: 'var(--ink-muted)' }}>Escolha o tipo de visita, data e horário. A oficina confirma a disponibilidade após receber sua solicitação.</p>
          </div>
        </div>

        <section className="bg-white rounded-2xl border p-6 mb-4 shadow-sm" style={{ borderColor: 'var(--line)' }}>
          <h2 className="font-black text-[14px] mb-4 flex items-center gap-2" style={{ color: 'var(--ink)' }}><span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] text-white" style={{ backgroundColor: brand }}>1</span> Tipo de visita</h2>
          <Select value={form.tipo} onChange={e=>setForm({...form, tipo: e.target.value})} options={TIPOS} placeholder="Selecione"/>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <Input type="date" label="Data" required min={minDate} value={form.data_agendada} onChange={e=>setForm({...form, data_agendada: e.target.value})}/>
            <Select label="Horário" required value={form.hora_agendada} onChange={e=>setForm({...form, hora_agendada: e.target.value})} options={HORARIOS.map(h=>({value:h,label:h}))}/>
          </div>
        </section>

        <section className="bg-white rounded-2xl border p-6 mb-4 shadow-sm" style={{ borderColor: 'var(--line)' }}>
          <h2 className="font-black text-[14px] mb-4 flex items-center gap-2" style={{ color: 'var(--ink)' }}><span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] text-white" style={{ backgroundColor: brand }}>2</span> Seu veículo</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Marca" value={form.veiculo_marca} onChange={e=>setForm({...form, veiculo_marca: e.target.value})}/>
            <Input label="Modelo" value={form.veiculo_modelo} onChange={e=>setForm({...form, veiculo_modelo: e.target.value})}/>
            <Input label="Ano" type="number" value={form.veiculo_ano} onChange={e=>setForm({...form, veiculo_ano: e.target.value})}/>
            <Input label="Placa" value={form.veiculo_placa} onChange={e=>setForm({...form, veiculo_placa: e.target.value.toUpperCase()})}/>
          </div>
        </section>

        <section className="bg-white rounded-2xl border p-6 mb-6 shadow-sm" style={{ borderColor: 'var(--line)' }}>
          <h2 className="font-black text-[14px] mb-4 flex items-center gap-2" style={{ color: 'var(--ink)' }}><span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] text-white" style={{ backgroundColor: brand }}>3</span> Seus dados</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Nome completo" required value={form.cliente_nome} onChange={e=>setForm({...form, cliente_nome: e.target.value})}/>
            <Input label="Telefone / WhatsApp" required value={form.cliente_telefone} onChange={e=>setForm({...form, cliente_telefone: e.target.value})}/>
            <Input label="E-mail" type="email" value={form.cliente_email} onChange={e=>setForm({...form, cliente_email: e.target.value})}/>
          </div>
        </section>

        <button type="submit" disabled={saving} className="w-full md:w-auto px-8 py-3.5 rounded-lg text-white font-bold disabled:opacity-50 shadow-lg hover:shadow-xl transition inline-flex items-center justify-center gap-2" style={{ backgroundColor: brand }}>
          {saving ? 'Enviando…' : <>Confirmar agendamento <Calendar className="w-4 h-4"/></>}
        </button>
      </form>
    </div>
  );
}

