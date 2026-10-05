import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import { Construction } from 'lucide-react';

export default function InProgress({ title = 'Em construção' }) {
  return (
    <div>
      <PageHeader title={title} />
      <div className="rounded-lg border p-10 text-center" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
        <Construction className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--ink-faint)' }} />
        <p className="text-[14px] font-semibold mb-1">Esta página será disponibilizada em breve.</p>
        <p className="text-[12px]" style={{ color: 'var(--ink-muted)' }}>Schema, RLS e fluxo principal já estão prontos — interface dedicada nas próximas iterações.</p>
      </div>
    </div>
  );
}

export const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
    <h1 className="text-6xl font-black" style={{ color: 'var(--brand)' }}>404</h1>
    <p className="mt-2 mb-5 text-[14px]" style={{ color: 'var(--ink-muted)' }}>Página não encontrada.</p>
    <Link to="/" className="px-4 py-2 rounded text-[13px] font-bold text-white" style={{ backgroundColor: 'var(--brand)' }}>Voltar pra home</Link>
  </div>
);

