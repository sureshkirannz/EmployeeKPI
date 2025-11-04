import EmployeeDashboard from '../EmployeeDashboard';

export default function EmployeeDashboardExample() {
  return (
    <EmployeeDashboard
      employeeName="Sarah Johnson"
      onLogout={() => console.log('Logout clicked')}
    />
  );
}
