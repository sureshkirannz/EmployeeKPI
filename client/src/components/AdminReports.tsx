import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import ProgressChart from "./ProgressChart";

interface EmployeeReportData {
  id: string;
  name: string;
  kpiTarget: any | null;
  salesTarget: any | null;
  weeklyActivityCount: number;
}

export default function AdminReports() {
  const currentYear = new Date().getFullYear();

  const { data: reportsData, isLoading } = useQuery<{ employeeData: EmployeeReportData[] }>({
    queryKey: ["/api/admin/reports/overview"],
  });

  const handleExportCSV = () => {
    if (!reportsData?.employeeData) return;

    const headers = [
      "Employee Name",
      "Annual Volume Goal",
      "Required Units Monthly",
      "Lock %",
      "Locked Loans Monthly",
      "Weekly Activities Logged",
      "Has Targets Set",
    ];

    const rows = reportsData.employeeData.map((emp) => [
      emp.name,
      emp.kpiTarget ? `$${parseFloat(emp.kpiTarget.annualVolumeGoal).toLocaleString()}` : "N/A",
      emp.kpiTarget?.requiredUnitsMonthly || "N/A",
      emp.kpiTarget ? `${parseFloat(emp.kpiTarget.lockPercentage)}%` : "N/A",
      emp.kpiTarget?.lockedLoansMonthly || "N/A",
      emp.weeklyActivityCount,
      emp.kpiTarget ? "Yes" : "No",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employee-report-${currentYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading reports...</div>
      </div>
    );
  }

  const employees = reportsData?.employeeData || [];
  const employeesWithTargets = employees.filter((e) => e.kpiTarget);
  const totalVolumeGoal = employeesWithTargets.reduce(
    (sum, emp) => sum + parseFloat(emp.kpiTarget?.annualVolumeGoal || "0"),
    0
  );

  const avgUnitsTarget = employeesWithTargets.length > 0
    ? Math.round(
        employeesWithTargets.reduce((sum, emp) => sum + (emp.kpiTarget?.requiredUnitsMonthly || 0), 0) /
          employeesWithTargets.length
      )
    : 0;

  // Employee-based chart data from actual targets
  const volumeByEmployee = employeesWithTargets.slice(0, 5).map((emp) => ({
    name: emp.name.split(" ")[0],
    value: parseFloat(emp.kpiTarget?.annualVolumeGoal || "0") / 1000000,
    target: parseFloat(emp.kpiTarget?.annualVolumeGoal || "0") / 1000000,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Performance Reports - {currentYear}</h2>
        <Button onClick={handleExportCSV} data-testid="button-export-csv">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Team Volume Goal</CardDescription>
            <CardTitle className="text-2xl font-mono">
              ${(totalVolumeGoal / 1000000).toFixed(1)}M
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Avg. Monthly Units Target</CardDescription>
            <CardTitle className="text-2xl font-mono">{avgUnitsTarget}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Employees with Targets</CardDescription>
            <CardTitle className="text-2xl font-mono">
              {employeesWithTargets.length} / {employees.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {volumeByEmployee.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProgressChart
            title="Employee Volume Goals ($M)"
            data={volumeByEmployee}
            type="bar"
            height={300}
          />
          <ProgressChart
            title="Activity Tracking Overview"
            data={employees.slice(0, 5).map((emp) => ({
              name: emp.name.split(" ")[0],
              value: emp.weeklyActivityCount,
              target: 52,
            }))}
            type="area"
            height={300}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Employee Overview</CardTitle>
          <CardDescription>
            Summary of all employee targets and activity tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Volume Goal</TableHead>
                  <TableHead className="text-right">Units/Month</TableHead>
                  <TableHead className="text-right">Lock %</TableHead>
                  <TableHead className="text-right">Activities</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id} data-testid={`report-row-${emp.id}`}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {emp.kpiTarget
                        ? `$${(parseFloat(emp.kpiTarget.annualVolumeGoal) / 1000000).toFixed(1)}M`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {emp.kpiTarget?.requiredUnitsMonthly || "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {emp.kpiTarget ? `${parseFloat(emp.kpiTarget.lockPercentage).toFixed(0)}%` : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono">{emp.weeklyActivityCount}</TableCell>
                    <TableCell>
                      {emp.kpiTarget ? (
                        <Badge variant="secondary">Configured</Badge>
                      ) : (
                        <Badge variant="outline">No Targets</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {employees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No employees found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
