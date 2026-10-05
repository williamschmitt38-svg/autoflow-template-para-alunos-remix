import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, PlusCircle, Shield, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const items = [
  { to: '/master/painel',       label: 'Painel Geral',  icon: LayoutDashboard },
  { to: '/master/empresas',     label: 'Empresas',      icon: Building2 },
  { to: '/master/nova-empresa', label: 'Nova Empresa',  icon: PlusCircle },
];

export default function MasterSidebar() {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  return (
    <aside
      className="w-64 shrink-0 flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(0 55% 14%) 0%, hsl(0 60% 18%) 100%)',
        borderRight: '1px solid hsl(0 30% 25%)',
      }}
    >
      <div className="pointer-events-none absolute -top-32 -left-16 w-72 h-72 rounded-full blur-3xl opacity-25" style={{ background: 'var(--brand-master)' }} />

      <div className="relative px-5 py-5 flex items-center gap-2.5 border-b" style={{ borderColor: 'hsl(0 30% 25%)' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--brand-master)', boxShadow: 'var(--brand-master-glow)' }}>
          <Shield className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <div className="font-black text-white text-[14px] leading-tight tracking-tight">Painel Master</div>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.5)' }}>Super Admin</div>
        </div>
      </div>

      <nav className="relative flex-1 px-2 pt-4 space-y-0.5">
        <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.35)' }}>Master</div>
        {items.map(it => {
          const active = pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-all"
              style={{
                background: active ? 'linear-gradient(90deg, var(--brand-master), hsl(0 65% 45%))' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                boxShadow: active ? '0 8px 18px -10px hsl(0 70% 35% / 0.7)' : 'none',
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; } }}
            >
              {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r" style={{ background: '#FCA5A5', boxShadow: '0 0 8px rgba(252,165,165,0.6)' }} />}
              <Icon className="w-[18px] h-[18px]" /> {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative p-2 border-t space-y-1" style={{ borderColor: 'hsl(0 30% 25%)' }}>
        <Link to="/app/dashboard" className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] hover:bg-white/5 transition" style={{ color: 'rgba(255,255,255,0.65)' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar pro app
        </Link>
        <button onClick={signOut} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-semibold hover:bg-white/5 transition" style={{ color: 'rgba(255,255,255,0.65)' }}>
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </aside>
  );
}

