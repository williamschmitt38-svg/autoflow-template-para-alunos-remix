import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Car, FileText, Wrench, DollarSign, BarChart3, Sparkles, UserCog, Settings, LogOut, Zap, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const groups = [
  { label: 'Principal', items: [
    { to: '/app/dashboard',   label: 'Dashboard',          icon: LayoutDashboard },
    { to: '/app/clientes',    label: 'Clientes',           icon: Users },
    { to: '/app/veiculos',    label: 'Veículos',           icon: Car },
    { to: '/app/orcamentos',  label: 'Orçamentos',         icon: FileText },
    {to:'/app/solicitacoes',label:'Solicitações',icon:FileText},
    {to:'/app/servicos',label:'Serviços / vitrine',icon:Wrench},
    { to: '/app/ordens',      label: 'Ordens de Serviço',  icon: Wrench },
  ]},
  { label: 'Operacional', items: [
    { to: '/app/financeiro',  label: 'Financeiro',         icon: DollarSign },
    { to: '/app/relatorios',  label: 'Relatórios',         icon: BarChart3 },
    { to: '/app/ai-growth',   label: 'AI Growth',          icon: Sparkles, badge: 'IA' },
  ]},
  { label: 'Gestão', items: [
    { to: '/app/equipe',         label: 'Equipe',         icon: UserCog },
    { to: '/app/configuracoes',  label: 'Configurações',  icon: Settings },
  ]},
];

export default function TenantSidebar() {
  const { pathname } = useLocation();
  const { signOut, isSuperAdmin } = useAuth();
  return (
    <aside
      className="w-64 shrink-0 flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0B1018 0%, #111824 100%)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
    >
      {/* glow ambient */}
      <div className="pointer-events-none absolute -top-32 -left-16 w-72 h-72 rounded-full blur-3xl opacity-20" style={{ background: 'var(--brand-glow)' }} />

      <div className="relative px-5 py-5 flex items-center gap-2.5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg" style={{ background: 'var(--grad-brand)', boxShadow: 'var(--shadow-glow-brand)' }}>
          <Zap className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <div className="font-black text-white text-[15px] leading-tight tracking-tight">AutoFlow AI</div>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/40">Oficina · pro</div>
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
                    className="group relative flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-all"
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
                    {it.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider" style={{ background: 'var(--grad-violet)', color: '#fff' }}>
                        {it.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="relative p-2 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
        {isSuperAdmin && (
          <Link to="/master/painel" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] mb-1 font-semibold" style={{ color: '#FCA5A5', background: 'rgba(225,29,72,0.08)' }}>
            <Shield className="w-3.5 h-3.5" /> Painel Master
          </Link>
        )}
        <button onClick={signOut} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-semibold hover:bg-white/5 transition" style={{ color: 'var(--sidebar-text)' }}>
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </aside>
  );
}

