import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Car, FileText, Wrench, DollarSign, BarChart3, Sparkles, Zap, ArrowRight } from 'lucide-react';

const groups = [
  { label: 'Principal', items: [
    { to: '/demo/dashboard',   label: 'Dashboard',         icon: LayoutDashboard },
    { to: '/demo/clientes',    label: 'Clientes',          icon: Users },
    { to: '/demo/veiculos',    label: 'Veículos',          icon: Car },
    { to: '/demo/orcamentos',  label: 'Orçamentos',        icon: FileText },
    { to: '/demo/ordens',      label: 'Ordens de Serviço', icon: Wrench },
  ]},
  { label: 'Operacional', items: [
    { to: '/demo/financeiro',  label: 'Financeiro', icon: DollarSign },
    { to: '/demo/relatorios',  label: 'Relatórios', icon: BarChart3 },
    { to: '/demo/ai-growth',   label: 'AI Growth',  icon: Sparkles, badge: 'IA' },
  ]},
];

export default function DemoSidebar() {
  const { pathname } = useLocation();
  return (
    <aside
      className="w-64 shrink-0 flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0B1018 0%, #111824 100%)' }}
    >
      <div className="pointer-events-none absolute -top-32 -left-16 w-72 h-72 rounded-full blur-3xl opacity-20" style={{ background: 'var(--brand-glow)' }} />

      <div className="relative px-5 py-5 flex items-center gap-2.5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg" style={{ background: 'var(--grad-brand)', boxShadow: 'var(--shadow-glow-brand)' }}>
          <Zap className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <div className="font-black text-white text-[14px] leading-tight tracking-tight">AutoFlow AI</div>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: '#D4A24C' }}>Demonstração</div>
        </div>
      </div>

      <nav className="relative flex-1 px-2 pt-4 space-y-5 overflow-y-auto pb-4">
        {groups.map(g => (
          <div key={g.label}>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: '#5A6072' }}>{g.label}</div>
            <div className="space-y-0.5">
              {g.items.map(it => {
                const active = pathname.startsWith(it.to);
                const Icon = it.icon;
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    className="relative flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-all"
                    style={{
                      background: active ? 'linear-gradient(90deg, rgba(28,63,94,0.95), rgba(59,111,160,0.55))' : 'transparent',
                      color: active ? '#fff' : 'var(--sidebar-text)',
                      boxShadow: active ? '0 8px 18px -10px rgba(28,63,94,0.7)' : 'none',
                    }}
                    onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--sidebar-item-hover)'; e.currentTarget.style.color = 'var(--sidebar-text-hover)'; } }}
                    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--sidebar-text)'; } }}
                  >
                    {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r" style={{ background: '#8CB4D8', boxShadow: '0 0 8px rgba(140,180,216,0.6)' }} />}
                    <span className="flex items-center gap-2.5"><Icon className="w-[18px] h-[18px]" /> {it.label}</span>
                    {it.badge && <span className="px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider" style={{ background: 'var(--grad-violet)', color: '#fff' }}>{it.badge}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="relative p-3 m-2 rounded-xl border" style={{ background: 'linear-gradient(135deg, rgba(28,63,94,0.4), rgba(28,63,94,0.15))', borderColor: 'rgba(140,180,216,0.25)', boxShadow: 'var(--shadow-glow-brand)' }}>
        <div className="text-[11px] font-black text-white mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" style={{ color: '#D4A24C' }} /> Gostou?</div>
        <div className="text-[11px] mb-3" style={{ color: '#8A8F9E' }}>Crie sua conta gratuita e use com seus dados.</div>
        <Link to="/login" className="flex items-center justify-center gap-1 py-2 rounded-lg text-[12px] font-bold text-white shadow-md hover:shadow-lg transition" style={{ background: 'var(--grad-brand)' }}>
          Criar conta <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </aside>
  );
}

