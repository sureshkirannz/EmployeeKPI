import AdminDashboard from '../AdminDashboard';

export default function AdminDashboardExample() {
  return (
    <AdminDashboard onLogout={() => console.log('Logout clicked')} />
  );
}
