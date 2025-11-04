import EmployeeTable from '../EmployeeTable';

export default function EmployeeTableExample() {
  const employees = [
    {
      id: '1',
      name: 'Sarah Johnson',
      username: 'sjohnson',
      role: 'Employee',
      volumeProgress: 85,
      unitsProgress: 92,
      status: 'on-track' as const,
    },
    {
      id: '2',
      name: 'Michael Chen',
      username: 'mchen',
      role: 'Employee',
      volumeProgress: 45,
      unitsProgress: 58,
      status: 'at-risk' as const,
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      username: 'erodriguez',
      role: 'Employee',
      volumeProgress: 110,
      unitsProgress: 105,
      status: 'exceeded' as const,
    },
  ];

  return (
    <div className="p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <EmployeeTable
          employees={employees}
          onEdit={(id) => console.log('Edit employee:', id)}
          onDelete={(id) => console.log('Delete employee:', id)}
          onAdd={() => console.log('Add employee')}
        />
      </div>
    </div>
  );
}
