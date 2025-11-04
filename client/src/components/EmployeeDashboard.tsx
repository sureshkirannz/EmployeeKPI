import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, DollarSign, FileText, TrendingUp, Percent, Target, Users, Award } from "lucide-react";
import type { Loan, DailyActivity, CoachingNote } from "@shared/schema";
import DailyActivityLog from "./DailyActivityLog";
import LoanPipelineBoard from "./LoanPipelineBoard";
import RealtorRelationships from "./RealtorRelationships";

interface EmployeeDashboardProps {
  employeeName: string;
  onLogout: () => void;
}

export default function EmployeeDashboard({ employeeName, onLogout }: EmployeeDashboardProps) {
  const currentYear = new Date().getFullYear();

  const { data: loansData } = useQuery<{ loans: Loan[] }>({
    queryKey: ["/api/employee/loans", { year: currentYear }],
  });

  const { data: dailyActivitiesData } = useQuery<{ activities: DailyActivity[] }>({
    queryKey: ["/api/employee/daily-activities"],
  });

  const { data: coachingNotesData } = useQuery<{ notes: CoachingNote[] }>({
    queryKey: ["/api/employee/coaching-notes"],
  });

  const loans = loansData?.loans || [];
  const dailyActivities = dailyActivitiesData?.activities || [];
  const coachingNotes = coachingNotesData?.notes || [];

  // Calculate KPIs
  const applicationsCount = loans.filter(
    (l) => l.status === "application" || l.status === "processing" || l.status === "locked" || l.status === "closed"
  ).length;

  const fundedLoans = loans.filter((l) => l.status === "closed");
  const fundedCount = fundedLoans.length;
  const fundedVolume = fundedLoans.reduce((sum, l) => sum + parseFloat(l.loanAmount || "0"), 0);

  const pipelineValue = loans
    .filter((l) => l.status !== "closed")
    .reduce((sum, l) => sum + parseFloat(l.loanAmount || "0"), 0);

  const pullThroughRate = applicationsCount > 0 ? Math.round((fundedCount / applicationsCount) * 100) : 0;

  // Monthly activity totals
  const thisMonth = new Date().getMonth();
  const thisMonthActivities = dailyActivities.filter((a) => {
    const activityDate = new Date(a.activityDate);
    return activityDate.getMonth() === thisMonth;
  });

  const monthlyCallsMade = thisMonthActivities.reduce((sum, a) => sum + (a.callsMade || 0), 0);
  const monthlyAppointments = thisMonthActivities.reduce((sum, a) => sum + (a.appointmentsCompleted || 0), 0);
  const monthlyApplications = thisMonthActivities.reduce((sum, a) => sum + (a.applicationsSubmitted || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white" data-testid="text-employee-name">
              Welcome, {employeeName}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Mortgage Performance Dashboard</p>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications YTD</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-applications-count">{applicationsCount}</div>
              <p className="text-xs text-muted-foreground">
                {monthlyApplications} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funded Loans</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-funded-count">{fundedCount}</div>
              <p className="text-xs text-muted-foreground">
                ${(fundedVolume / 1000000).toFixed(2)}M in volume
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-pipeline-value">
                ${(pipelineValue / 1000000).toFixed(2)}M
              </div>
              <p className="text-xs text-muted-foreground">
                {loans.filter((l) => l.status !== "closed").length} active loans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pull-Through Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-pull-through-rate">{pullThroughRate}%</div>
              <p className="text-xs text-muted-foreground">
                {fundedCount} of {applicationsCount} closed
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pipeline" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pipeline" data-testid="tab-pipeline">Loan Pipeline</TabsTrigger>
            <TabsTrigger value="daily" data-testid="tab-daily">Daily Activity</TabsTrigger>
            <TabsTrigger value="realtors" data-testid="tab-realtors">Realtor Partners</TabsTrigger>
            <TabsTrigger value="coaching" data-testid="tab-coaching">Coaching Notes</TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity-summary">Activity Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="space-y-4">
            <LoanPipelineBoard />
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            <DailyActivityLog />
          </TabsContent>

          <TabsContent value="realtors" className="space-y-4">
            <RealtorRelationships />
          </TabsContent>

          <TabsContent value="coaching" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Coaching & Feedback</CardTitle>
                <CardDescription>Notes and feedback from your manager</CardDescription>
              </CardHeader>
              <CardContent>
                {coachingNotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No coaching notes yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {coachingNotes.map((note) => (
                      <Card key={note.id} data-testid={`card-coaching-note-${note.id}`}>
                        <CardHeader>
                          <CardTitle className="text-lg">{note.subject}</CardTitle>
                          <CardDescription>
                            {new Date(note.createdAt).toLocaleDateString()} - {note.noteType}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm">{note.content}</p>
                          {note.actionItems && (
                            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                              <p className="text-sm font-semibold mb-1">Action Items:</p>
                              <p className="text-sm">{note.actionItems}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Calls This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="text-monthly-calls">{monthlyCallsMade}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="text-monthly-appointments">{monthlyAppointments}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="text-monthly-applications">{monthlyApplications}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Daily Activities</CardTitle>
                <CardDescription>Your activity log for the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {dailyActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No activities logged yet. Start tracking your daily activities!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dailyActivities.slice(0, 7).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 border rounded-md"
                        data-testid={`activity-${activity.id}`}
                      >
                        <div>
                          <p className="font-medium">
                            {new Date(activity.activityDate).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          {activity.notes && (
                            <p className="text-sm text-muted-foreground">{activity.notes}</p>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {activity.callsMade} calls, {activity.appointmentsCompleted} appts, {activity.applicationsSubmitted} apps
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
