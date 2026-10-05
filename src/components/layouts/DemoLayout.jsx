import { Outlet } from 'react-router-dom';
import DemoSidebar from '@/components/sidebars/DemoSidebar';
import { Eye } from 'lucide-react';

export default function DemoLayout() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--surface)' }}>
      <DemoSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-6 py-2 text-[12px] flex items-center gap-2" style={{ backgroundColor: 'var(--status-amber-bg)', color: 'var(--status-amber-fg)' }}>
          <Eye className="w-3.5 h-3.5" /> Você está no <strong>modo demonstração</strong>. Os dados são fictícios e não são salvos.
        </div>
        <main className="flex-1 p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}

