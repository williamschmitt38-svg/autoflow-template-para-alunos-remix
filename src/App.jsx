import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClientInstance } from '@/lib/query-client';
import { AuthProvider } from '@/lib/auth';

import LandingPage from '@/routes/LandingPage';
import Login from '@/routes/Login';
import EsqueciSenha from '@/routes/auth/EsqueciSenha';
import ResetSenha from '@/routes/auth/ResetSenha';
import TrocarSenha from '@/routes/auth/TrocarSenha';
import Onboarding from '@/routes/Onboarding';
import TenantLayout from '@/components/layouts/TenantLayout';
import DemoLayout from '@/components/layouts/DemoLayout';
import MasterLayout from '@/components/layouts/MasterLayout';
import Vitrine from '@/routes/public/Vitrine';
import SolicitarOrcamento from '@/routes/public/SolicitarOrcamento';
import Agendar from '@/routes/public/Agendar';

import Solicitacoes from '@/routes/app/Solicitacoes';
import Servicos from '@/routes/app/Servicos';
import Dashboard from '@/routes/app/Dashboard';
import Clientes from '@/routes/app/Clientes';
import Veiculos from '@/routes/app/Veiculos';
import Orcamentos from '@/routes/app/Orcamentos';
import OrdemServico from '@/routes/app/OrdemServico';
import Financeiro from '@/routes/app/Financeiro';
import Relatorios from '@/routes/app/Relatorios';
import AIGrowth from '@/routes/app/AIGrowth';
import Equipe from '@/routes/app/Equipe';
import Configuracoes from '@/routes/app/Configuracoes';

import MasterPainel from '@/routes/master/Painel';
import MasterEmpresas from '@/routes/master/Empresas';
import MasterNovaEmpresa from '@/routes/master/NovaEmpresa';
import AdminMaster from '@/routes/master/AdminMaster';
import MasterPanelReal from '@/routes/master/MasterPanelReal';

import { DemoDashboard, DemoClientes, DemoVeiculos, DemoOrcamentos, DemoOrdens, DemoFinanceiro, DemoRelatorios, DemoAIGrowth } from '@/routes/demo/pages';
import { NotFound } from '@/components/common/InProgress';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/auth/reset-senha" element={<ResetSenha />} />
            <Route path="/auth/trocar-senha" element={<TrocarSenha />} />
            <Route path="/onboarding" element={<Onboarding />} />

            <Route path="/vitrine/:slug" element={<Vitrine />} />
            <Route path="/orcamento/:slug" element={<SolicitarOrcamento />} />
            <Route path="/agendar/:slug" element={<Agendar />} />

            <Route path="/app" element={<TenantLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} /><Route path="solicitacoes" element={<Solicitacoes />} /><Route path="servicos" element={<Servicos />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="veiculos" element={<Veiculos />} />
              <Route path="orcamentos" element={<Orcamentos />} />
              <Route path="ordens" element={<OrdemServico />} />
              <Route path="financeiro" element={<Financeiro />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="ai-growth" element={<AIGrowth />} />
              <Route path="equipe" element={<Equipe />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>

            <Route path="/demo" element={<DemoLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DemoDashboard />} />
              <Route path="clientes" element={<DemoClientes />} />
              <Route path="veiculos" element={<DemoVeiculos />} />
              <Route path="orcamentos" element={<DemoOrcamentos />} />
              <Route path="ordens" element={<DemoOrdens />} />
              <Route path="financeiro" element={<DemoFinanceiro />} />
              <Route path="relatorios" element={<DemoRelatorios />} />
              <Route path="ai-growth" element={<DemoAIGrowth />} />
            </Route>

            <Route path="/master" element={<MasterLayout />}>
              <Route index element={<Navigate to="painel" replace />} />
              <Route path="painel" element={<MasterPainel />} />
              <Route path="admin" element={<AdminMaster />} />
              <Route path="real" element={<MasterPanelReal />} />
              <Route path="empresas" element={<MasterEmpresas />} />
              <Route path="nova-empresa" element={<MasterNovaEmpresa />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;

