import WeeklyGoalTracker from '../WeeklyGoalTracker';

export default function WeeklyGoalTrackerExample() {
  const weekStart = new Date();
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 6);

  const handleSubmit = (goals: any) => {
    console.log('Weekly goals submitted:', goals);
  };

  return (
    <div className="p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <WeeklyGoalTracker
          weekStart={weekStart}
          weekEnd={weekEnd}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
