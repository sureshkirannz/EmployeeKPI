import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut } from "lucide-react";
import KPICard from "./KPICard";
import WeeklyGoalTracker from "./WeeklyGoalTracker";
import DateRangeSelector, { DateRangeType } from "./DateRangeSelector";
import ProgressChart from "./ProgressChart";
import ActivityBreakdownChart from "./ActivityBreakdownChart";
import { DollarSign, Target, TrendingUp, Percent } from "lucide-react";

interface EmployeeDashboardProps {
  employeeName: string;
  onLogout: () => void;
}

interface KPITarget {
  id: string;
  employeeId: string;
  year: number;
  annualVolumeGoal: string;
  avgLoanAmount: string;
  requiredUnitsMonthly: number;
  lockPercentage: string;
  lockedLoansMonthly: number;
  newFileToLockedPercentage: string;
  newFilesMonthly: string;
}

interface SalesTarget {
  id: string;
  employeeId: string;
  year: number;
  eventsTarget: number;
  meetingsTarget: number;
  thankyouTarget: number;
  prospectingTarget: number;
  videosTarget: number;
}

export default function EmployeeDashboard({ employeeName, onLogout }: EmployeeDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRangeType>("current-week");
  const currentYear = new Date().getFullYear();

  const { data: kpiData } = useQuery<{ target: KPITarget | null }>({
    queryKey: ["/api/employee/kpi-targets", currentYear],
  });

  const { data: salesData } = useQuery<{ target: SalesTarget | null }>({
    queryKey: ["/api/employee/sales-targets", currentYear],
  });

  const { data: progressData } = useQuery<{ progress: any | null }>({
    queryKey: ["/api/employee/kpi-progress"],
  });

  const handleDateRangeChange = (type: DateRangeType, customDates?: { from: Date; to: Date }) => {
    setDateRange(type);
  };

  const kpiTarget = kpiData?.target;
  const salesTarget = salesData?.target;
  const progress = progressData?.progress;

  // Calculate progress percentages from real data
  const volumeProgress = kpiTarget && progress
    ? Math.round((progress.volumeCompleted / parseFloat(kpiTarget.annualVolumeGoal)) * 100)
    : 0;

  const unitsProgress = kpiTarget && progress
    ? Math.round((progress.unitsThisMonth / kpiTarget.requiredUnitsMonthly) * 100)
    : 0;

  const lockedProgress = kpiTarget && progress
    ? Math.round((progress.lockedLoansThisMonth / kpiTarget.lockedLoansMonthly) * 100)
    : 0;

  const lockPercentage = kpiTarget ? parseFloat(kpiTarget.lockPercentage) : 90;

  // Determine status based on progress
  const getStatus = (progress: number): "on-track" | "at-risk" | "behind" => {
    if (progress >= 80) return "on-track";
    if (progress >= 60) return "at-risk";
    return "behind";
  };

  // Generate chart data from actual weekly breakdown
  const weeklyTarget = kpiTarget ? Math.ceil(kpiTarget.requiredUnitsMonthly / 4) : 6;
  const weeklyData = progress?.weeklyBreakdown
    ? progress.weeklyBreakdown.map((week: any) => ({
        name: `Week ${week.weekNumber}`,
        value: week.meetings + week.events,
        target: weeklyTarget,
      }))
    : [
        { name: 'Week 1', value: 0, target: weeklyTarget },
        { name: 'Week 2', value: 0, target: weeklyTarget },
        { name: 'Week 3', value: 0, target: weeklyTarget },
        { name: 'Week 4', value: 0, target: weeklyTarget },
      ];

  // Weekly activity breakdown data
  const weeklyActivityData = progress?.weeklyBreakdown
    ? progress.weeklyBreakdown.map((week: any) => ({
        name: `Week ${week.weekNumber}`,
        events: week.events || 0,
        meetings: week.meetings || 0,
        videos: week.videos || 0,
        thankyouCards: week.thankyouCards || 0,
        hoursProspected: week.hoursProspected || 0,
      }))
    : [
        { name: 'Week 1', events: 0, meetings: 0, videos: 0, thankyouCards: 0, hoursProspected: 0 },
        { name: 'Week 2', events: 0, meetings: 0, videos: 0, thankyouCards: 0, hoursProspected: 0 },
        { name: 'Week 3', events: 0, meetings: 0, videos: 0, thankyouCards: 0, hoursProspected: 0 },
        { name: 'Week 4', events: 0, meetings: 0, videos: 0, thankyouCards: 0, hoursProspected: 0 },
      ];

  // For monthly data, use real aggregated data from all months
  const monthlyTarget = kpiTarget ? kpiTarget.requiredUnitsMonthly : 24;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIndex = new Date().getMonth();
  
  const monthlyData = progress?.monthlyBreakdown
    ? monthNames.slice(0, currentMonthIndex + 1).map((name, index) => {
        const monthData = progress.monthlyBreakdown[index];
        return {
          name,
          value: monthData ? monthData.meetings + monthData.events : 0,
          target: monthlyTarget,
        };
      })
    : monthNames.slice(0, currentMonthIndex + 1).map((name) => ({
        name,
        value: 0,
        target: monthlyTarget,
      }));

  // Monthly activity breakdown data
  const monthlyActivityData = progress?.monthlyBreakdown
    ? monthNames.slice(0, currentMonthIndex + 1).map((name, index) => {
        const monthData = progress.monthlyBreakdown[index];
        return {
          name,
          events: monthData?.events || 0,
          meetings: monthData?.meetings || 0,
          videos: monthData?.videos || 0,
          thankyouCards: monthData?.thankyouCards || 0,
          hoursProspected: monthData?.hoursProspected || 0,
        };
      })
    : monthNames.slice(0, currentMonthIndex + 1).map((name) => ({
        name,
        events: 0,
        meetings: 0,
        videos: 0,
        thankyouCards: 0,
        hoursProspected: 0,
      }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

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
            {!kpiTarget ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No KPI targets set. Please contact your administrator to set up your goals.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <KPICard
                    title="Annual Volume Goal"
                    value={progress ? formatCurrency(progress.volumeCompleted) : "$0"}
                    target={formatCurrency(parseFloat(kpiTarget.annualVolumeGoal))}
                    progress={volumeProgress}
                    icon={DollarSign}
                    status={getStatus(volumeProgress)}
                  />
                  <KPICard
                    title="Monthly Units"
                    value={progress ? progress.unitsThisMonth.toString() : "0"}
                    target={kpiTarget.requiredUnitsMonthly.toString()}
                    progress={unitsProgress}
                    icon={Target}
                    status={getStatus(unitsProgress)}
                  />
                  <KPICard
                    title="Locked Loans"
                    value={progress ? progress.lockedLoansThisMonth.toString() : "0"}
                    target={kpiTarget.lockedLoansMonthly.toString()}
                    progress={lockedProgress}
                    icon={TrendingUp}
                    status={getStatus(lockedProgress)}
                  />
                  <KPICard
                    title="Lock to Close %"
                    value={`${lockPercentage.toFixed(0)}%`}
                    target={`${lockPercentage.toFixed(0)}%`}
                    progress={100}
                    icon={Percent}
                    status="on-track"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <ActivityBreakdownChart
                    title="Weekly Activities Breakdown"
                    data={weeklyActivityData}
                    type="stacked"
                  />
                  <ActivityBreakdownChart
                    title="Monthly Activities Breakdown"
                    data={monthlyActivityData}
                    type="stacked"
                  />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold">Weekly Activities</h2>
              <DateRangeSelector onRangeChange={handleDateRangeChange} />
            </div>
            <WeeklyGoalTracker />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <h2 className="text-xl font-semibold">Performance Trends</h2>
            <div className="grid grid-cols-1 gap-4">
              <ActivityBreakdownChart
                title="Year-to-Date Activities by Month"
                data={monthlyActivityData}
                type="stacked"
                height={400}
              />
              <ActivityBreakdownChart
                title="Weekly Activities Comparison"
                data={weeklyActivityData}
                type="grouped"
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
              {kpiTarget && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">{currentYear} KPI Goals</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Annual Volume:</span>
                        <span className="font-mono">{formatCurrency(parseFloat(kpiTarget.annualVolumeGoal))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Required Units Monthly:</span>
                        <span className="font-mono">{kpiTarget.requiredUnitsMonthly}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lock %:</span>
                        <span className="font-mono">{parseFloat(kpiTarget.lockPercentage).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Locked Loans Monthly:</span>
                        <span className="font-mono">{kpiTarget.lockedLoansMonthly}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {salesTarget && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">{currentYear} Sales Targets</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Events (Yearly):</span>
                        <span className="font-mono">{salesTarget.eventsTarget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>1-to-1 Meetings:</span>
                        <span className="font-mono">{salesTarget.meetingsTarget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thank You Cards:</span>
                        <span className="font-mono">{salesTarget.thankyouTarget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Prospecting Calls:</span>
                        <span className="font-mono">{salesTarget.prospectingTarget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Social Media Videos:</span>
                        <span className="font-mono">{salesTarget.videosTarget}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
