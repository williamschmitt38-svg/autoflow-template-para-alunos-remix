import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

/** Bloqueia hard /master/* se nao for super_admin */
export default function SuperAdminGuard({ children }) {
  const { user, loading, isSuperAdmin } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm">Carregando…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="rounded-lg border p-8 max-w-md text-center" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
          <h1 className="text-xl font-black mb-2">Acesso restrito</h1>
          <p className="text-[13px] mb-5" style={{ color: 'var(--ink-muted)' }}>O painel master é exclusivo do super administrador deste deploy.</p>
          <Link to="/app/dashboard" className="px-4 py-2 rounded text-[13px] font-bold text-white" style={{ backgroundColor: 'var(--brand)' }}>Voltar ao app</Link>
        </div>
      </div>
    );
  }
  return children;
}

