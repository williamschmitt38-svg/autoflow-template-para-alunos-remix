import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Car, ClipboardList, FileText, DollarSign, BarChart3, UserCheck,
  Check, ArrowRight, Menu, X, ChevronDown, Bot, Wrench, ShieldCheck, Gauge, Layers,
} from 'lucide-react';

const BG_DARK    = '#0B1018';
const BG_DARK_2  = '#111824';
const LINE_DARK  = '#1E2330';
const TEXT_MUTED = '#8A93A6';

/* ------------------------ Reusable bits ------------------------ */

function Logo({ size = 36, dark = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div
        className="rounded-lg flex items-center justify-center font-black text-white relative overflow-hidden"
        style={{
          width: size, height: size,
          background: 'linear-gradient(135deg, #1C3F5E 0%, #3B6FA0 100%)',
          boxShadow: '0 8px 18px -8px rgba(28,63,94,0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
        }}
      >
        <Wrench className="w-1/2 h-1/2" strokeWidth={2.4} />
        <span className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.25), transparent 60%)' }}/>
      </div>
      <div className="leading-none">
        <div className="font-display font-black text-[17px] tracking-tight" style={{ color: dark ? '#fff' : 'var(--ink)' }}>
          AutoFlow <span style={{ color: dark ? '#8CB4D8' : 'var(--brand)' }}>AI</span>
        </div>
        <div className="text-[9.5px] font-bold uppercase tracking-[0.22em] mt-1" style={{ color: dark ? 'rgba(255,255,255,0.45)' : 'var(--ink-muted)' }}>
          Gestão de oficinas
        </div>
      </div>
    </Link>
  );
}

function Section({ id, eyebrow, title, subtitle, children, dark = false }) {
  return (
    <section id={id} className="py-20 md:py-24" style={dark ? { backgroundColor: BG_DARK, color: '#fff' } : undefined}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.22em] mb-4 px-3 py-1 rounded-full"
              style={ dark
                ? { color: '#8CB4D8', backgroundColor: 'rgba(140,180,216,0.08)', border: '1px solid rgba(140,180,216,0.18)' }
                : { color: 'var(--brand)', backgroundColor: 'var(--brand-subtle)' }}>
              {eyebrow}
            </div>
          )}
          <h2 className="font-display text-[30px] md:text-[42px] font-black tracking-tight leading-[1.1]" style={{ color: dark ? '#fff' : 'var(--ink)' }}>{title}</h2>
          {subtitle && <p className="text-[15px] mt-4 leading-relaxed" style={{ color: dark ? 'rgba(255,255,255,0.65)' : 'var(--ink-muted)' }}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

/* ----------------------------- Page ----------------------------- */

export default function LandingPage() {
  const [open, setOpen] = useState(false);
  const [faq, setFaq] = useState(null);

  return (
    <div style={{ backgroundColor: 'var(--surface)' }}>
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ backgroundColor: 'rgba(11,16,24,0.92)', borderColor: LINE_DARK }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Logo dark />
          <div className="hidden md:flex items-center gap-8 text-[13.5px] font-semibold" style={{ color: TEXT_MUTED }}>
            <a href="#modulos" className="hover:text-white transition">Módulos</a>
            <a href="#como"     className="hover:text-white transition">Como funciona</a>
            <a href="#pricing"  className="hover:text-white transition">Planos</a>
            <Link to="/demo"    className="hover:text-white transition">Demo</Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-3.5 py-2 text-[13px] font-semibold text-white/85 hover:text-white transition">Entrar</Link>
            <Link to="/demo" className="px-4 py-2 rounded-md text-[13px] font-bold text-white transition" style={{ background: 'linear-gradient(135deg, #1C3F5E 0%, #3B6FA0 100%)', boxShadow: '0 6px 16px -6px rgba(28,63,94,0.65)' }}>
              Ver demo
            </Link>
          </div>
          <button className="md:hidden text-white" onClick={() => setOpen(!open)}>{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
        </div>
        {open && (
          <div className="md:hidden border-t p-4 space-y-3" style={{ borderColor: LINE_DARK }}>
            <a href="#modulos" className="block text-white text-[14px]">Módulos</a>
            <a href="#pricing" className="block text-white text-[14px]">Planos</a>
            <Link to="/demo"   className="block text-white text-[14px]">Demo</Link>
            <Link to="/login"  className="block text-white text-[14px]">Entrar</Link>
            <Link to="/demo" className="block text-center px-4 py-2.5 rounded-md text-[13px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #1C3F5E, #3B6FA0)' }}>Ver demo</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ backgroundColor: BG_DARK }}>
        {/* ambient glow + grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '52px 52px', maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)' }}/>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-3xl opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, #1C3F5E 0%, transparent 65%)' }}/>

        <div className="relative max-w-6xl mx-auto px-5 pt-24 pb-20 md:pt-28 md:pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7 text-[11.5px] font-semibold border" style={{ backgroundColor: 'rgba(28,63,94,0.25)', color: '#A8C9E5', borderColor: 'rgba(140,180,216,0.20)' }}>
            <ShieldCheck className="w-3.5 h-3.5" /> Software de gestão para oficinas mecânicas
          </div>

          <h1 className="font-display text-[42px] md:text-[64px] font-black leading-[1.03] tracking-tight text-white mb-6 max-w-4xl mx-auto">
            A gestão completa da sua oficina,<br/>
            <span style={{ color: '#8CB4D8' }}>em um único sistema.</span>
          </h1>

          <p className="text-[16px] md:text-[17px] max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.68)' }}>
            Clientes, veículos, ordens de serviço, orçamentos e financeiro — operação organizada
            de ponta a ponta, com indicadores em tempo real e inteligência para crescer.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            <Link to="/demo" className="px-6 py-3.5 rounded-md text-[14px] font-bold text-white flex items-center gap-2 transition" style={{ background: 'linear-gradient(135deg, #1C3F5E 0%, #3B6FA0 100%)', boxShadow: '0 12px 28px -10px rgba(28,63,94,0.7)' }}>
              Ver demo do sistema <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#pricing" className="px-6 py-3.5 rounded-md text-[14px] font-bold text-white border transition hover:bg-white/5" style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
              Ver planos
            </a>
          </div>

          {/* Mockup */}
          <div className="mx-auto max-w-5xl rounded-xl border overflow-hidden shadow-2xl" style={{ borderColor: LINE_DARK, backgroundColor: '#0a0c11' }}>
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b" style={{ borderColor: LINE_DARK }}>
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <div className="mx-auto text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>Demonstração ilustrativa · dados fictícios</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5">
              {[
                { label: 'OS abertas',    value: '24',       sub: '+12% mês' },
                { label: 'Faturamento',   value: 'R$ 28k',   sub: 'meta 80%' },
                { label: 'Em andamento',  value: '7',        sub: '3 técnicos' },
                { label: 'Ticket médio',  value: 'R$ 1.190', sub: '+8% vs mês ant.' },
              ].map((k) => (
                <div key={k.label} className="rounded-lg p-4 text-left border" style={{ backgroundColor: '#13161d', borderColor: '#1A1F2A' }}>
                  <div className="text-[10px] uppercase font-bold tracking-wider mb-1.5" style={{ color: TEXT_MUTED }}>{k.label}</div>
                  <div className="font-display text-[22px] font-black text-white leading-none">{k.value}</div>
                  <div className="text-[10.5px] mt-1.5 font-medium" style={{ color: '#5C8AB8' }}>{k.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* trust bar */}
        <div className="relative border-t" style={{ borderColor: LINE_DARK }}>
          <div className="max-w-6xl mx-auto px-5 py-7 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { v: 'Clientes', l: 'Cadastro organizado' },
              { v: 'OS', l: 'Kanban e checklist' },
              { v: 'Finanças', l: 'Entradas e saídas' },
              { v: 'Vitrine', l: 'Solicitações online' },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-[24px] font-black text-white">{s.v}</div>
                <div className="text-[11px] uppercase font-bold tracking-wider mt-1" style={{ color: TEXT_MUTED }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULOS */}
      <Section id="modulos" eyebrow="Módulos" title="Tudo o que sua oficina precisa, integrado"
        subtitle="Do primeiro contato ao pós-venda. Sem planilhas paralelas, sem dado solto.">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { i: Users,         t: 'Clientes',           d: 'Cadastro completo, histórico de serviços e ticket por cliente.' },
            { i: Car,           t: 'Veículos',           d: 'Frota com placa, modelo, KM e datas de revisão para acompanhamento.' },
            { i: ClipboardList, t: 'Ordens de Serviço',  d: 'Kanban com status, técnico responsável e checklist técnico.' },
            { i: FileText,      t: 'Orçamentos',         d: 'Aprovação em 1 clique que converte direto em OS executável.' },
            { i: DollarSign,    t: 'Financeiro',         d: 'Entradas, saídas, contas a receber e ticket médio em tempo real.' },
            { i: BarChart3,     t: 'Relatórios',         d: 'Faturamento, desempenho de técnicos e serviços mais lucrativos.' },
            { i: Bot,           t: 'Sugestões de crescimento',  d: 'Identifica clientes inativos e sugere campanhas de receita.' },
            { i: UserCheck,     t: 'Equipe',             d: 'Cadastre técnicos por email e controle permissões.' },
            { i: Gauge,         t: 'Painel da operação', d: 'KPIs ao vivo: produtividade, ocupação e gargalos da oficina.' },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="rounded-lg border p-5 transition hover:shadow-md hover:border-[var(--brand)]" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--brand-subtle)' }}>
                <Icon className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              </div>
              <div className="font-display font-extrabold text-[16px] mb-1.5" style={{ color: 'var(--ink)' }}>{t}</div>
              <div className="text-[13.5px] leading-relaxed" style={{ color: 'var(--ink-muted)' }}>{d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section id="como" eyebrow="Como funciona" title="Sua operação em quatro passos">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { n: '01', t: 'Cadastre a base',    d: 'Cadastre clientes e veículos da sua oficina.' },
            { n: '02', t: 'Abra ordens',        d: 'Crie OS com itens, técnico e prazo no Kanban.' },
            { n: '03', t: 'Aprove orçamentos',  d: 'Registre a aprovação e converta em uma OS.' },
            { n: '04', t: 'Acompanhe resultados', d: 'Indicadores ao vivo e alertas para agir rápido.' },
          ].map((s) => (
            <div key={s.n} className="relative border-l-2 pl-5" style={{ borderColor: 'var(--brand-line)' }}>
              <div className="font-display text-[40px] font-black leading-none mb-3" style={{ color: 'var(--brand)' }}>{s.n}</div>
              <div className="font-display font-extrabold text-[17px] mb-1.5" style={{ color: 'var(--ink)' }}>{s.t}</div>
              <div className="text-[13.5px] leading-relaxed" style={{ color: 'var(--ink-muted)' }}>{s.d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* DIFFERENTIALS */}
      <Section eyebrow="Diferenciais" title="Por que escolher o AutoFlow" dark>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { i: ShieldCheck, t: 'Padrão profissional', d: 'Login verificado e acesso separado aos dados de cada oficina.' },
            { i: Bot,         t: 'Inteligência de receita', d: 'Regras de datas e status ajudam a encontrar pendências.' },
            { i: Layers,      t: 'Multi-empresa',  d: 'Nome, cores e logo próprios com dados separados por oficina.' },
            { i: Gauge,       t: 'Indicadores ao vivo', d: 'Painéis em tempo real para gestão técnica e financeira.' },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="rounded-lg p-5 border" style={{ background: 'linear-gradient(160deg, rgba(28,63,94,0.45), rgba(28,63,94,0.10))', borderColor: 'rgba(140,180,216,0.18)' }}>
              <Icon className="w-7 h-7 mb-4" style={{ color: '#A8C9E5' }} />
              <div className="font-display font-extrabold text-[16px] mb-1.5 text-white">{t}</div>
              <div className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* PRICING */}
      <Section id="pricing" eyebrow="Planos" title="Comece grátis, escale quando precisar"
        subtitle="Preços ilustrativos do template. O proprietário define sua oferta; não há cobrança automática integrada.">
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            { n: 'Trial',        p: 'R$ 0',   sub: '14 dias',  destaque: false, features: ['Todos os módulos', 'Acesso da equipe', 'Cadastro de clientes'], cta: 'Iniciar trial' },
            { n: 'Básico',       p: 'R$ 97',  sub: '/ mês',    destaque: false, features: ['Acesso da equipe', 'Clientes ilimitados', 'Controle de veículos', 'Relatórios essenciais'], cta: 'Conhecer o sistema' },
            { n: 'Profissional', p: 'R$ 197', sub: '/ mês',    destaque: true,  features: ['Acesso da equipe', 'Sugestões por regras', 'Solicitações públicas', 'Gestão de equipe', 'Multi-empresa'], cta: 'Conhecer o sistema' },
          ].map((p) => (
            <div key={p.n} className="rounded-xl border p-7 relative transition hover:shadow-lg"
              style={{ backgroundColor: 'var(--surface-raised)', borderColor: p.destaque ? 'var(--brand)' : 'var(--line-soft)', borderWidth: p.destaque ? 2 : 1, boxShadow: p.destaque ? '0 16px 36px -16px rgba(28,63,94,0.30)' : 'none' }}>
              {p.destaque && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase text-white" style={{ background: 'linear-gradient(135deg, #1C3F5E, #3B6FA0)' }}>Exemplo de plano</div>}
              <div className="font-display font-extrabold text-[18px]" style={{ color: 'var(--ink)' }}>{p.n}</div>
              <div className="my-4 flex items-baseline gap-1.5">
                <span className="font-display text-[40px] font-black tracking-tight" style={{ color: 'var(--ink)' }}>{p.p}</span>
                <span className="text-[13px] font-medium" style={{ color: 'var(--ink-muted)' }}>{p.sub}</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px]" style={{ color: 'var(--ink-2)' }}>
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand)' }} />{f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="block text-center py-3 rounded-md text-[13.5px] font-bold transition"
                style={ p.destaque
                  ? { background: 'linear-gradient(135deg, #1C3F5E, #3B6FA0)', color: '#fff' }
                  : { background: 'transparent', color: 'var(--brand)', border: '1.5px solid var(--brand)' }}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section eyebrow="FAQ" title="Perguntas frequentes">
        <div className="max-w-2xl mx-auto space-y-2.5">
          {[
            { q: 'Como funciona o trial de 14 dias?', a: 'Você cadastra sua oficina e acessa todos os recursos por 14 dias sem cobrança. Não pedimos cartão de crédito.' },
            { q: 'Posso cancelar a qualquer momento?', a: 'As condições de assinatura são definidas pelo proprietário. Este template não processa cobranças.' },
            { q: 'Como as mensagens funcionam?', a: 'Você prepara o texto, abre o WhatsApp e confirma o envio manualmente. Não há disparos automáticos.' },
            { q: 'Vocês ajudam na migração de dados?', a: 'O cadastro inicial é manual. Importações de outros sistemas exigem desenvolvimento adicional.' },
            { q: 'A IA tem custo adicional?', a: 'Não. A Sugestões por regras está incluída no plano Profissional sem cobrança por uso.' },
            { q: 'Funciona no celular?', a: 'Você pode acessar pelo navegador. Telas com tabelas e Kanban ficam mais confortáveis em computadores.' },
          ].map((f, i) => (
            <div key={i} className="rounded-lg border" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
              <button onClick={() => setFaq(faq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                <span className="font-semibold text-[14px]" style={{ color: 'var(--ink)' }}>{f.q}</span>
                <ChevronDown className="w-4 h-4 transition" style={{ transform: faq === i ? 'rotate(180deg)' : 'none', color: 'var(--ink-muted)' }} />
              </button>
              {faq === i && <div className="px-4 pb-4 text-[13.5px] leading-relaxed" style={{ color: 'var(--ink-2)' }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </Section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden" style={{ backgroundColor: BG_DARK }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(800px 400px at 50% 0%, rgba(28,63,94,0.6), transparent 70%)' }}/>
        <div className="relative max-w-3xl mx-auto px-5 py-20 text-center">
          <h2 className="font-display text-[30px] md:text-[40px] font-black tracking-tight text-white mb-4 leading-[1.1]">
            Pronto para profissionalizar sua oficina?
          </h2>
          <p className="text-[15px] mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Veja o sistema em funcionamento ou escolha o plano que cabe na sua operação.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/demo" className="px-6 py-3.5 rounded-md text-[14px] font-bold text-white flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #1C3F5E, #3B6FA0)', boxShadow: '0 12px 28px -10px rgba(28,63,94,0.7)' }}>
              Ver demo <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#pricing" className="px-6 py-3.5 rounded-md text-[14px] font-bold text-white border hover:bg-white/5 transition" style={{ borderColor: 'rgba(255,255,255,0.20)' }}>
              Ver planos
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER — sóbrio */}
      <footer style={{ backgroundColor: BG_DARK_2, color: '#fff' }}>
        <div className="max-w-6xl mx-auto px-5 py-12 flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div className="max-w-xs">
            <Logo dark />
            <p className="text-[13px] mt-4 leading-relaxed" style={{ color: TEXT_MUTED }}>
              Sistema de gestão para oficinas mecânicas. Operação, financeiro e crescimento em um único lugar.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 text-[13px]">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-3 text-white">Produto</div>
              <ul className="space-y-2" style={{ color: TEXT_MUTED }}>
                <li><a href="#modulos" className="hover:text-white transition">Módulos</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Planos</a></li>
                <li><Link to="/demo" className="hover:text-white transition">Demo</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-3 text-white">Empresa</div>
              <ul className="space-y-2" style={{ color: TEXT_MUTED }}>
                <li><a href="#como" className="hover:text-white transition">Sobre o sistema</a></li>
                <li><span>Contato: configurar ao publicar</span></li>
              </ul>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-3 text-white">Legal</div>
              <ul className="space-y-2" style={{ color: TEXT_MUTED }}>
                <li><span>Política de privacidade: configurar</span></li>
                <li><span>Termos de uso: configurar</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t" style={{ borderColor: LINE_DARK }}>
          <div className="max-w-6xl mx-auto px-5 py-5 flex flex-col sm:flex-row justify-between gap-2 text-[12px]" style={{ color: TEXT_MUTED }}>
            <div>© {new Date().getFullYear()} AutoFlow AI · Todos os direitos reservados.</div>
            <div>Template personalizável · configure seus dados comerciais</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

