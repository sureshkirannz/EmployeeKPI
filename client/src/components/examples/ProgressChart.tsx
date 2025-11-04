import ProgressChart from '../ProgressChart';

export default function ProgressChartExample() {
  const weeklyData = [
    { name: 'Week 1', value: 15, target: 24 },
    { name: 'Week 2', value: 18, target: 24 },
    { name: 'Week 3', value: 22, target: 24 },
    { name: 'Week 4', value: 20, target: 24 },
  ];

  const monthlyData = [
    { name: 'Jan', value: 65, target: 96 },
    { name: 'Feb', value: 72, target: 96 },
    { name: 'Mar', value: 88, target: 96 },
    { name: 'Apr', value: 91, target: 96 },
  ];

  return (
    <div className="p-8 bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-7xl">
        <ProgressChart
          title="Weekly Units Closed"
          data={weeklyData}
          type="area"
        />
        <ProgressChart
          title="Monthly Performance"
          data={monthlyData}
          type="bar"
        />
      </div>
    </div>
  );
}
