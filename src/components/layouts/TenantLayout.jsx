import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useEmpresa } from '@/lib/empresa';
import TenantSidebar from '@/components/sidebars/TenantSidebar';
import TrialBanner from '@/components/common/TrialBanner';
import { useLocation } from 'react-router-dom';

export default function TenantLayout() {
  const { user, loading, error: authError } = useAuth();
  const { empresa, isLoading: loadingEmp, error: empresaError } = useEmpresa();
  const loc = useLocation();

  if (loading || (user && loadingEmp)) {
    return <div className="min-h-screen flex items-center justify-center text-sm" style={{ color: 'var(--ink-muted)' }}>Carregando…</div>;
  }
  if (authError || empresaError) return <div className="p-8 text-red-700">{authError || empresaError.message}</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!empresa) return <Navigate to="/onboarding" replace />;
  if (!empresa.onboarding_concluido) return <Navigate to="/onboarding" replace />;

  // Guard de suspensão: bloqueia /app/* exceto Configurações?tab=cobranca
  if (empresa.status_cobranca === 'suspenso') {
    const isConfig = loc.pathname.startsWith('/app/configuracoes');
    if (!isConfig) return <Navigate to="/app/configuracoes?tab=cobranca" replace />;
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--surface)' }}>
      <TenantSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TrialBanner empresa={empresa} />
        <main className="flex-1 p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}

