import { Link } from 'react-router-dom';
import { X, Sparkles, Check } from 'lucide-react';

export default function DemoCTAModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="rounded-lg w-full max-w-md p-6 relative" style={{ backgroundColor: 'var(--surface-raised)' }}>
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded hover:bg-black/5"><X className="w-4 h-4" /></button>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--brand-subtle)' }}>
          <Sparkles className="w-6 h-6" style={{ color: 'var(--brand)' }} />
        </div>
        <h3 className="text-[20px] font-black mb-2">Pronto para usar com seus dados?</h3>
        <p className="text-[13px] mb-4" style={{ color: 'var(--ink-muted)' }}>
          Crie sua conta gratuita e ganhe <strong>14 dias de trial</strong> com todos os recursos liberados.
        </p>
        <ul className="space-y-1.5 mb-5">
          {['Sem cartão de crédito', 'Setup em menos de 5 minutos', 'Cancelamento a qualquer momento', 'Suporte por WhatsApp'].map((f) => (
            <li key={f} className="flex items-center gap-2 text-[12.5px]">
              <Check className="w-3.5 h-3.5" style={{ color: 'var(--status-green-fg)' }} />{f}
            </li>
          ))}
        </ul>
        <Link to="/login" className="block text-center px-5 py-2.5 rounded text-[13px] font-bold text-white" style={{ backgroundColor: 'var(--brand)' }}>
          Começar trial grátis
        </Link>
      </div>
    </div>
  );
}

