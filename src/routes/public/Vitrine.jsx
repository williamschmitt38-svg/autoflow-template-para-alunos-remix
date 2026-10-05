import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import * as Icons from 'lucide-react';
import { MapPin, Phone, Clock, MessageCircle, Wrench, ArrowRight, CheckCircle2, Calendar, ShieldCheck, Award, Users, Car, FileText, Sparkles } from 'lucide-react';

const DIAS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

function brl(v){ return Number(v||0).toLocaleString('pt-BR',{ style:'currency', currency:'BRL' }); }

export default function Vitrine() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState(null);
  const [servicos, setServicos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: emp } = await supabase.from('empresa_publica').select('*').eq('slug', slug).maybeSingle();
      if (!emp) { setNotFound(true); setLoading(false); return; }
      setEmpresa(emp);
      const [{ data: srv }, { data: hor }] = await Promise.all([
        supabase.from('servico_referencia').select('*').eq('empresa_id', emp.id).eq('ativo', true).order('ordem'),
        supabase.from('horario_funcionamento').select('*').eq('empresa_id', emp.id).order('dia_semana'),
      ]);
      setServicos(srv || []);
      setHorarios(hor || []);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>Carregando…</div>;
  if (notFound) return <div className="min-h-screen flex items-center justify-center flex-col gap-3" style={{ backgroundColor: 'var(--surface)' }}>
    <h1 className="text-2xl font-bold">Oficina não encontrada</h1>
    <Link to="/" className="text-[var(--brand)] underline">Voltar</Link>
  </div>;

  const brand = empresa.cor_primaria || '#1C3F5E';
  const wppLink = `https://wa.me/${(empresa.whatsapp||'').replace(/\D/g,'')}?text=${encodeURIComponent('Olá! Vim pela vitrine online da '+empresa.nome)}`;

  return (
    <div style={{ backgroundColor: 'var(--surface)', minHeight: '100vh' }}>
      {/* HERO premium com glow + grid pattern */}
      <header className="relative text-white overflow-hidden" style={{ background: `radial-gradient(1200px 600px at 80% -10%, ${brand}55, transparent 60%), linear-gradient(135deg, ${brand} 0%, #0B0F14 100%)` }}>
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)', backgroundSize: '44px 44px' }}/>
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full blur-3xl opacity-30" style={{ backgroundColor: brand }}/>

        <div className="relative max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {empresa.logo_url
              ? <img src={empresa.logo_url} alt={empresa.nome} className="h-11 w-11 rounded-lg object-cover bg-white ring-1 ring-white/20"/>
              : <div className="h-11 w-11 rounded-lg flex items-center justify-center font-black bg-white ring-1 ring-white/20" style={{ color: brand }}>{empresa.nome[0]}</div>}
            <div>
              <div className="font-black text-[15px] leading-tight">{empresa.nome}</div>
              <div className="text-[11px] opacity-70 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Oficina mecânica certificada</div>
            </div>
          </div>
          <a href={wppLink} target="_blank" rel="noreferrer" className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold shadow-lg shadow-emerald-500/20">
            <MessageCircle className="w-4 h-4"/> WhatsApp
          </a>
        </div>

        <div className="relative max-w-6xl mx-auto px-5 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-[11px] font-semibold bg-white/10 backdrop-blur-sm ring-1 ring-white/15">
              <Sparkles className="w-3.5 h-3.5"/> Atendimento e serviços da oficina
            </div>
            <h1 className="text-[36px] md:text-[52px] font-black leading-[1.02] tracking-tight mb-5">
              Seu veículo em mãos<br/>
              <span style={{ background: `linear-gradient(90deg, #fff, ${brand}cc)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>de quem entende.</span>
            </h1>
            <p className="text-white/70 text-[15px] md:text-[16px] mb-8 max-w-md leading-relaxed">{empresa.sobre || 'Solicite um orçamento e converse com a equipe sobre os serviços disponíveis.'}</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={()=>navigate(`/orcamento/${slug}`)} className="px-5 py-3.5 rounded-lg text-[14px] font-bold flex items-center gap-2 bg-white hover:bg-white/90 transition shadow-xl shadow-black/20" style={{ color: brand }}>
                <FileText className="w-4 h-4"/> Solicitar orçamento online <ArrowRight className="w-4 h-4"/>
              </button>
              <button onClick={()=>navigate(`/agendar/${slug}`)} className="px-5 py-3.5 rounded-lg text-[14px] font-bold border border-white/25 hover:bg-white/10 backdrop-blur-sm flex items-center gap-2 transition">
                <Calendar className="w-4 h-4"/> Solicitar visita
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Wrench, k: String(servicos.length), l: 'Serviços disponíveis' },
              { icon: Users, k: 'Contato', l: 'Fale com a oficina' },
              { icon: Award, k: 'Serviços', l: 'Consulte a equipe' },
              { icon: CheckCircle2, k: 'Online', l: 'Solicite um orçamento' },
            ].map((s,i)=>(
              <div key={i} className="rounded-2xl p-5 bg-white/[0.04] backdrop-blur-sm border border-white/10 hover:bg-white/[0.08] transition">
                <s.icon className="w-6 h-6 mb-3 opacity-80" style={{ color: '#8CB4D8' }}/>
                <div className="font-black text-[24px] leading-none mb-1">{s.k}</div>
                <div className="text-[12px] text-white/60">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* SERVICOS */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] mb-3 px-3 py-1 rounded-full" style={{ color: brand, backgroundColor: brand+'10' }}><Wrench className="w-3 h-3"/> Serviços da oficina</div>
          <h2 className="text-[32px] md:text-[40px] font-black tracking-tight" style={{ color: 'var(--ink)' }}>Tudo o que seu veículo precisa</h2>
          <p className="text-[14px] mt-3 max-w-lg mx-auto" style={{ color: 'var(--ink-muted)' }}>Valores de referência. Orçamento final emitido após inspeção técnica.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicos.map(s => {
            const Ico = Icons[s.icone] || Wrench;
            return (
              <div key={s.id} className="group rounded-2xl border p-6 bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200" style={{ borderColor: 'var(--line)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: `linear-gradient(135deg, ${brand}20, ${brand}10)`, color: brand }}>
                  <Ico className="w-5 h-5"/>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: 'var(--ink-muted)' }}>{s.categoria}</div>
                <h3 className="font-black text-[17px] mb-1.5" style={{ color: 'var(--ink)' }}>{s.nome}</h3>
                <p className="text-[13px] mb-5 leading-relaxed" style={{ color: 'var(--ink-muted)' }}>{s.descricao}</p>
                <div className="flex items-end justify-between pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--ink-muted)' }}>A partir de</div>
                    <div className="text-[20px] font-black leading-tight" style={{ color: brand }}>{brl(s.valor_referencia)}</div>
                    {s.duracao_min && <div className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: 'var(--ink-muted)' }}><Clock className="w-3 h-3"/> ~{s.duracao_min} min</div>}
                  </div>
                  <button onClick={()=>navigate(`/orcamento/${slug}?servico=${s.id}`)} className="px-3.5 py-2 rounded-lg text-[12px] font-bold text-white shadow-md hover:shadow-lg transition" style={{ backgroundColor: brand }}>
                    Solicitar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SOBRE */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#0B0F14', color: 'white' }}>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '24px 24px' }}/>
        <div className="relative max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] mb-3 text-white/60"><Car className="w-3 h-3"/> Por que escolher</div>
            <h2 className="text-[32px] md:text-[40px] font-black tracking-tight mb-5">Conheça a oficina</h2>
            <p className="text-white/70 text-[15px] leading-relaxed mb-7">{empresa.sobre}</p>
            <ul className="space-y-3 text-[14px]">
              {['Solicitação online de orçamento','Contato direto com a oficina','Dados do veículo organizados','Acompanhamento com a equipe'].map(t=>(
                <li key={t} className="flex items-center gap-3"><div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: brand+'40' }}><CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#8CB4D8' }}/></div> {t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden bg-white/[0.04] backdrop-blur-sm border border-white/10 p-6">
            <h3 className="font-black text-[18px] mb-5">Contato e localização</h3>
            <div className="space-y-3 text-[13px]">
              <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-white/60 shrink-0"/> {empresa.endereco}</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-white/60"/> {empresa.telefone}</div>
              <a href={wppLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold"><MessageCircle className="w-4 h-4"/> Conversar no WhatsApp</a>
            </div>
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3 text-[13px] font-bold"><Clock className="w-4 h-4"/> Horário de funcionamento</div>
              <div className="space-y-1.5 text-[12px]">
                {horarios.map(h => (
                  <div key={h.id} className="flex justify-between">
                    <span className="text-white/60">{DIAS[h.dia_semana]}</span>
                    <span className="font-semibold">{h.fechado ? 'Fechado' : `${h.abre} – ${h.fecha}`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA premium */}
      <section className="py-20 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${brand} 0%, ${brand}dd 100%)`, color: 'white' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,.4), transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,.3), transparent 50%)' }}/>
        <div className="relative max-w-4xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] mb-4 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm"><Sparkles className="w-3 h-3"/> Comece agora</div>
          <h2 className="text-[30px] md:text-[42px] font-black tracking-tight mb-4 leading-[1.1]">Pronto para cuidar do seu veículo?</h2>
          <p className="text-white/85 mb-8 text-[15px] md:text-[16px] max-w-xl mx-auto">Solicite seu orçamento online em menos de 1 minuto ou agende um diagnóstico técnico grátis.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={()=>navigate(`/orcamento/${slug}`)} className="px-6 py-3.5 rounded-lg text-[14px] font-bold bg-white hover:bg-white/95 shadow-xl shadow-black/20 transition inline-flex items-center gap-2" style={{ color: brand }}>
              <FileText className="w-4 h-4"/> Solicitar orçamento
            </button>
            <button onClick={()=>navigate(`/agendar/${slug}`)} className="px-6 py-3.5 rounded-lg text-[14px] font-bold border border-white/40 hover:bg-white/10 backdrop-blur-sm transition inline-flex items-center gap-2">
              <Calendar className="w-4 h-4"/> Agendar diagnóstico
            </button>
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-[11px]" style={{ color: 'var(--ink-muted)', backgroundColor: 'var(--surface)' }}>
        © {empresa.nome} · Vitrine powered by <Link to="/" className="font-bold" style={{ color: brand }}>AutoFlow AI</Link>
      </footer>
    </div>
  );
}

