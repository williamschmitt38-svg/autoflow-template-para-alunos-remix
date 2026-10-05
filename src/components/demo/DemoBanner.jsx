import { Sparkles, ArrowRight } from 'lucide-react';

export default function DemoBanner({ onOpen }) {
  return (
    <div className="rounded-lg border p-3 mb-5 flex items-center justify-between flex-wrap gap-3"
      style={{ backgroundColor: '#FEF6E4', borderColor: '#8A5A0A' }}>
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5" style={{ color: '#8A5A0A' }} />
        <div>
          <div className="text-[13px] font-bold" style={{ color: '#8A5A0A' }}>Modo Demo - Crie sua conta gratis</div>
          <div className="text-[11px]" style={{ color: 'var(--ink-2)' }}>Voce esta navegando com dados ficticios. Ative seu trial de 14 dias e use com dados reais.</div>
        </div>
      </div>
      <button onClick={onOpen} className="px-4 py-2 rounded text-[12px] font-bold text-white flex items-center gap-1" style={{ backgroundColor: 'var(--brand)' }}>
        Criar conta gratis <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

