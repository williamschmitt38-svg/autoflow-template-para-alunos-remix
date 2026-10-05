import { Outlet } from 'react-router-dom';
import MasterSidebar from '@/components/sidebars/MasterSidebar';
import SuperAdminGuard from '@/components/common/SuperAdminGuard';

export default function MasterLayout() {
  return (
    <SuperAdminGuard>
      <div className="min-h-screen flex" style={{ backgroundColor: 'var(--surface)' }}>
        <MasterSidebar />
        <main className="flex-1 p-6 overflow-auto min-w-0"><Outlet /></main>
      </div>
    </SuperAdminGuard>
  );
}

