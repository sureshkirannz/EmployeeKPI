import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut } from "lucide-react";
import KPICard from "./KPICard";
import WeeklyGoalTracker from "./WeeklyGoalTracker";
import DateRangeSelector, { DateRangeType } from "./DateRangeSelector";
import ProgressChart from "./ProgressChart";
import { DollarSign, Target, TrendingUp, Percent } from "lucide-react";

interface EmployeeDashboardProps {
  employeeName: string;
  onLogout: () => void;
}

export default function EmployeeDashboard({ employeeName, onLogout }: EmployeeDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRangeType>("current-week");

  const handleDateRangeChange = (type: DateRangeType, customDates?: { from: Date; to: Date }) => {
    setDateRange(type);
    console.log('Date range changed:', type, customDates);
  };

  const handleSaveGoals = (goals: any) => {
    console.log('Goals saved:', goals);
  };

  //todo: remove mock functionality
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

  const weekStart = new Date();
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 6);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex items-center justify-between px-4 sm:px-8 h-16">
          <h1 className="text-xl sm:text-2xl font-bold">Employee Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {employeeName}
            </span>
            <Button variant="outline" onClick={onLogout} data-testid="button-logout">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly Tracker</TabsTrigger>
            <TabsTrigger value="progress" data-testid="tab-progress">Progress</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Annual Volume Goal"
                value="$45M"
                target="$100M"
                progress={45}
                icon={DollarSign}
                status="at-risk"
              />
              <KPICard
                title="Monthly Units"
                value="18"
                target="24"
                progress={75}
                icon={Target}
                status="on-track"
              />
              <KPICard
                title="Locked Loans"
                value="22"
                target="26"
                progress={85}
                icon={TrendingUp}
                status="on-track"
              />
              <KPICard
                title="Lock to Close %"
                value="90%"
                target="90%"
                progress={100}
                icon={Percent}
                status="on-track"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold">Weekly Activities</h2>
              <DateRangeSelector onRangeChange={handleDateRangeChange} />
            </div>
            <WeeklyGoalTracker
              weekStart={weekStart}
              weekEnd={weekEnd}
              onSubmit={handleSaveGoals}
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <h2 className="text-xl font-semibold">Performance Trends</h2>
            <div className="grid grid-cols-1 gap-4">
              <ProgressChart
                title="Year-to-Date Volume Progress"
                data={monthlyData}
                type="line"
                height={400}
              />
              <ProgressChart
                title="Weekly Activities Comparison"
                data={weeklyData}
                type="bar"
                height={300}
              />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-xl font-semibold">My Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Name</h3>
                  <p className="text-base">{employeeName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Role</h3>
                  <p className="text-base">Employee</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">2025 Goals</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Annual Volume:</span>
                      <span className="font-mono">$100M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Required Units Monthly:</span>
                      <span className="font-mono">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lock %:</span>
                      <span className="font-mono">90%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
