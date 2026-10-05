import { Link } from 'react-router-dom';
import { daysUntil } from '@/lib/format';
import { AlertTriangle } from 'lucide-react';

export default function TrialBanner({ empresa }) {
  if (!empresa) return null;
  const sc = empresa.status_cobranca;
  const dias = daysUntil(empresa.trial_ate);

  if (sc === 'suspenso') {
    return (
      <div className="px-6 py-2 text-[13px] flex items-center gap-2" style={{ backgroundColor: 'var(--status-red-bg)', color: 'var(--status-red-fg)' }}>
        <AlertTriangle className="w-4 h-4" /> Sua conta está <strong>suspensa</strong>. <Link to="/app/configuracoes" className="underline ml-1">Regularizar pagamento</Link>
      </div>
    );
  }
  if (sc === 'inadimplente') {
    return (
      <div className="px-6 py-2 text-[13px] flex items-center gap-2" style={{ backgroundColor: '#FFEDD5', color: '#9A3412' }}>
        <AlertTriangle className="w-4 h-4" /> Pagamento atrasado. <Link to="/app/configuracoes" className="underline ml-1">Regularizar</Link>
      </div>
    );
  }
  if (sc === 'trial' && dias !== null && dias <= 3 && dias >= 0) {
    return (
      <div className="px-6 py-2 text-[13px] flex items-center gap-2" style={{ backgroundColor: 'var(--status-amber-bg)', color: 'var(--status-amber-fg)' }}>
        <AlertTriangle className="w-4 h-4" /> Seu trial expira em <strong>{dias} dia{dias === 1 ? '' : 's'}</strong>. <Link to="/app/configuracoes" className="underline ml-1">Assinar agora</Link>
      </div>
    );
  }
  return null;
}

