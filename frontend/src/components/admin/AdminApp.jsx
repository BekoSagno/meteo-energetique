import { useEffect } from 'react';
import AdminLayout from './AdminLayout.jsx';
import AdminLogin from './AdminLogin.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import AdminInfoPage from './AdminInfoPage.jsx';
import AdminUsers from './AdminUsers.jsx';
import AdminReports from './AdminReports.jsx';
import AdminQueue from './AdminQueue.jsx';
import { formatUserDisplayName } from '../../lib/auth.js';

export function resolveAdminSection(hash = '') {
  const id = String(hash).replace(/^#/, '');
  if (id === 'admin-info') return 'info';
  if (id === 'admin-users') return 'users';
  if (id === 'admin-reports') return 'reports';
  if (id === 'admin-queue') return 'queue';
  return 'dashboard';
}

export default function AdminApp({
  authUser,
  onLogin,
  onLogout,
  communes = [],
  section = 'dashboard',
}) {
  const isStaff = authUser?.role === 'edg_staff';

  useEffect(() => {
    const previous = document.title;
    document.title = 'Administration — Météo Énergétique';
    return () => {
      document.title = previous;
    };
  }, []);

  if (!isStaff) {
    return <AdminLogin onSuccess={onLogin} />;
  }

  return (
    <AdminLayout
      section={section}
      userName={formatUserDisplayName(authUser)}
      onLogout={onLogout}
    >
      {section === 'info' ? <AdminInfoPage communes={communes} /> : null}
      {section === 'users' ? <AdminUsers /> : null}
      {section === 'reports' ? <AdminReports /> : null}
      {section === 'queue' ? <AdminQueue /> : null}
      {section === 'dashboard' ? <AdminDashboard /> : null}
    </AdminLayout>
  );
}
