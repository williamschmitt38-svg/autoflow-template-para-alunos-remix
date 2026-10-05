import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input, Textarea, Select, NumberInput } from '@/components/app/FormField';
import { toast } from 'sonner';
import { CheckCircle2, MessageCircle, ArrowLeft, FileText } from 'lucide-react';

export default function SolicitarOrcamento() {
  const { slug } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState(null);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestId] = useState(()=>crypto.randomUUID());
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);
  const [form, setForm] = useState({
    cliente_nome: '', cliente_telefone: '', cliente_email: '',
    veiculo_marca: '', veiculo_modelo: '', veiculo_ano: '', veiculo_placa: '', veiculo_km: '',
    descricao: '',
  });
  const [selecionados, setSelecionados] = useState(new Set(sp.get('servico') ? [sp.get('servico')] : []));

  useEffect(() => {
    (async () => {
      const { data: emp } = await supabase.from('empresa_publica').select('*').eq('slug', slug).maybeSingle();
      if (!emp) { setLoading(false); return; }
      setEmpresa(emp);
      const { data: srv } = await supabase.from('servico_referencia').select('id,nome,valor_referencia').eq('empresa_id', emp.id).eq('ativo', true).order('ordem');
      setServicos(srv || []);
      setLoading(false);
    })();
  }, [slug]);

  function toggle(id){
    const n = new Set(selecionados);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelecionados(n);
  }

  async function submit(e){
    e.preventDefault();
    if (!form.cliente_nome || !form.cliente_telefone) { toast.error('Nome e telefone são obrigatórios'); return; }
    setSaving(true);
    const servicos_payload = servicos.filter(s => selecionados.has(s.id)).map(s => ({ id: s.id, nome: s.nome, valor_referencia: Number(s.valor_referencia)||0 }));
    const { data, error } = await supabase.rpc('create_public_solicitacao', { _payload: { request_id: requestId, empresa_id: empresa.id, tipo: 'orcamento', cliente_nome: form.cliente_nome, cliente_telefone: form.cliente_telefone, cliente_email: form.cliente_email || null, veiculo_marca: form.veiculo_marca || null, veiculo_modelo: form.veiculo_modelo || null, veiculo_ano: form.veiculo_ano || null, veiculo_placa: form.veiculo_placa || null, veiculo_km: form.veiculo_km || null, servicos: servicos_payload, descricao: form.descricao || null } });
    setSaving(false);
    if (error) { toast.error('Erro: '+error.message); return; }
    setDone(Array.isArray(data) ? data[0] : data);

  }

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>Carregando…</div>;
  if (!empresa) return <div className="min-h-screen flex items-center justify-center">Oficina não encontrada</div>;

  const brand = empresa.cor_primaria || '#1C3F5E';

  if (done) {
    const wppMsg = encodeURIComponent(`Olá! Acabei de solicitar um orçamento pelo site. Meu protocolo é ${done.protocolo}.`);
    const wppLink = `https://wa.me/${(empresa.whatsapp||'').replace(/\D/g,'')}?text=${wppMsg}`;
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center border" style={{ borderColor: 'var(--line)' }}>
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: brand+'15' }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: brand }}/>
          </div>
          <h1 className="text-[24px] font-black mb-2" style={{ color: 'var(--ink)' }}>Solicitação enviada!</h1>
          <p className="text-[14px] mb-5" style={{ color: 'var(--ink-muted)' }}>A oficina entrará em contato em breve.</p>
          <div className="rounded-lg p-4 mb-5" style={{ backgroundColor: 'var(--surface-sunken)' }}>
            <div className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: 'var(--ink-muted)' }}>Protocolo</div>
            <div className="text-[20px] font-black font-mono" style={{ color: brand }}>{done.protocolo}</div>
          </div>
          <a href={wppLink} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded text-white font-bold bg-emerald-500 hover:bg-emerald-600 text-[14px]">
            <MessageCircle className="w-4 h-4"/> Falar no WhatsApp
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
          <div className="text-[12px] opacity-80 font-semibold uppercase tracking-wider">Orçamento online</div>
        </div>
      </header>

      <form onSubmit={submit} className="max-w-3xl mx-auto px-5 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: `linear-gradient(135deg, ${brand}20, ${brand}10)`, color: brand }}><FileText className="w-5 h-5"/></div>
          <div>
            <h1 className="text-[26px] font-black tracking-tight" style={{ color: 'var(--ink)' }}>Solicitar orçamento</h1>
            <p className="text-[13px]" style={{ color: 'var(--ink-muted)' }}>Preencha os dados abaixo. Sem compromisso — resposta em até 1h útil.</p>
          </div>
        </div>

        <section className="bg-white rounded-2xl border p-6 mb-4 shadow-sm" style={{ borderColor: 'var(--line)' }}>
          <h2 className="font-black text-[14px] mb-4 flex items-center gap-2" style={{ color: 'var(--ink)' }}><span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] text-white" style={{ backgroundColor: brand }}>1</span> Seu veículo</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Marca" value={form.veiculo_marca} onChange={e=>setForm({...form, veiculo_marca: e.target.value})} placeholder="Ex: Volkswagen"/>
            <Input label="Modelo" value={form.veiculo_modelo} onChange={e=>setForm({...form, veiculo_modelo: e.target.value})} placeholder="Ex: Gol"/>
            <NumberInput label="Ano" value={form.veiculo_ano} onChange={e=>setForm({...form, veiculo_ano: e.target.value})} placeholder="2020"/>
            <Input label="Placa" value={form.veiculo_placa} onChange={e=>setForm({...form, veiculo_placa: e.target.value.toUpperCase()})} placeholder="ABC1D23"/>
            <NumberInput label="Quilometragem" value={form.veiculo_km} onChange={e=>setForm({...form, veiculo_km: e.target.value})} placeholder="80000"/>
          </div>
        </section>

        <section className="bg-white rounded-2xl border p-6 mb-4 shadow-sm" style={{ borderColor: 'var(--line)' }}>
          <h2 className="font-black text-[14px] mb-4 flex items-center gap-2" style={{ color: 'var(--ink)' }}><span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] text-white" style={{ backgroundColor: brand }}>2</span> Serviços desejados</h2>
          <div className="grid md:grid-cols-2 gap-2 mb-3">
            {servicos.map(s => {
              const checked = selecionados.has(s.id);
              return (
                <label key={s.id} className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition" style={{ borderColor: checked ? brand : 'var(--line)', backgroundColor: checked ? brand+'0a' : 'transparent' }}>
                  <input type="checkbox" checked={checked} onChange={()=>toggle(s.id)} className="w-4 h-4 accent-current" style={{ color: brand }}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--ink)' }}>{s.nome}</div>
                    <div className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>A partir de R$ {Number(s.valor_referencia).toFixed(2)}</div>
                  </div>
                </label>
              );
            })}
          </div>
          <Textarea label="Descreva o problema" rows={3} value={form.descricao} onChange={e=>setForm({...form, descricao: e.target.value})} placeholder="Ex: barulho na frente ao frear..." />
        </section>

        <section className="bg-white rounded-2xl border p-6 mb-6 shadow-sm" style={{ borderColor: 'var(--line)' }}>
          <h2 className="font-black text-[14px] mb-4 flex items-center gap-2" style={{ color: 'var(--ink)' }}><span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] text-white" style={{ backgroundColor: brand }}>3</span> Seus dados</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Nome completo" required value={form.cliente_nome} onChange={e=>setForm({...form, cliente_nome: e.target.value})}/>
            <Input label="Telefone / WhatsApp" required value={form.cliente_telefone} onChange={e=>setForm({...form, cliente_telefone: e.target.value})} placeholder="(11) 99999-9999"/>
            <Input label="E-mail" type="email" value={form.cliente_email} onChange={e=>setForm({...form, cliente_email: e.target.value})}/>
          </div>
        </section>

        <button type="submit" disabled={saving} className="w-full md:w-auto px-8 py-3.5 rounded-lg text-white font-bold disabled:opacity-50 shadow-lg hover:shadow-xl transition inline-flex items-center justify-center gap-2" style={{ backgroundColor: brand }}>
          {saving ? 'Enviando…' : <>Enviar solicitação <FileText className="w-4 h-4"/></>}
        </button>
      </form>
    </div>
  );
}

