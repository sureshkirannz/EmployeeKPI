import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, BarChart3, Settings, LogOut, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import KPICard from "./KPICard";
import EmployeeTable from "./EmployeeTable";
import EmployeeFormDialog from "./EmployeeFormDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import KPITargetDialog from "./KPITargetDialog";
import ProgressChart from "./ProgressChart";
import AdminReports from "./AdminReports";
import CoachingFeedback from "./CoachingFeedback";

interface AdminDashboardProps {
  onLogout: () => void;
}

interface Employee {
  id: string;
  username: string;
  employeeName: string;
  role: string;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeView, setActiveView] = useState("employees");
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [employeeForTargets, setEmployeeForTargets] = useState<Employee | null>(null);
  const { toast } = useToast();

  const { data: employeesData, isLoading } = useQuery<{ employees: Employee[] }>({
    queryKey: ["/api/admin/employees"],
    enabled: activeView === "employees",
  });

  const { data: statsData } = useQuery<{ stats: any }>({
    queryKey: ["/api/admin/stats"],
    enabled: activeView === "dashboard",
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (employee: any) => {
      const response = await apiRequest("POST", "/api/admin/employees", employee);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/employees"] });
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create employee",
        variant: "destructive",
      });
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async (employee: any) => {
      const { id, ...data } = employee;
      const response = await apiRequest("PUT", `/api/admin/employees/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/employees"] });
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/employees"] });
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive",
      });
    },
  });

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setEmployeeDialogOpen(true);
  };

  const handleEditEmployee = (id: string) => {
    const employee = employeesData?.employees.find((e: Employee) => e.id === id);
    if (employee) {
      setSelectedEmployee(employee);
      setEmployeeDialogOpen(true);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployeeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleSetTargets = (id: string) => {
    const employee = employeesData?.employees.find((e: Employee) => e.id === id);
    if (employee) {
      setEmployeeForTargets(employee);
      setTargetDialogOpen(true);
    }
  };

  const handleSubmitEmployee = async (employee: any) => {
    if (employee.id) {
      await updateEmployeeMutation.mutateAsync(employee);
    } else {
      await createEmployeeMutation.mutateAsync(employee);
    }
  };

  const handleConfirmDelete = async () => {
    if (employeeToDelete) {
      await deleteEmployeeMutation.mutateAsync(employeeToDelete);
      setEmployeeToDelete(null);
    }
  };

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, view: "dashboard" },
    { title: "Employees", icon: Users, view: "employees" },
    { title: "Coaching", icon: MessageSquare, view: "coaching" },
    { title: "Reports", icon: BarChart3, view: "reports" },
    { title: "Settings", icon: Settings, view: "settings" },
  ];

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const employees = employeesData?.employees || [];
  const stats = statsData?.stats;
  const chartData = stats?.monthlyData || [];
  
  const tableEmployees = employees.map((e: Employee) => ({
    ...e,
    name: e.employeeName,
    volumeProgress: 0,
    unitsProgress: 0,
    status: "on-track" as const,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatus = (progress: number): "on-track" | "at-risk" | "behind" => {
    if (progress >= 80) return "on-track";
    if (progress >= 60) return "at-risk";
    return "behind";
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-lg font-bold px-4 py-4">
                KPI Tracker
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => setActiveView(item.view)}
                        isActive={activeView === item.view}
                        data-testid={`nav-${item.view}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4 border-t">
              <Button variant="outline" className="w-full" onClick={onLogout} data-testid="button-logout">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="text-sm text-muted-foreground">Welcome, Admin</div>
          </header>

          <main className="flex-1 overflow-auto p-8">
            {activeView === "dashboard" && (
              <div className="space-y-6">
                {!stats ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading dashboard...</div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <KPICard
                        title="Total Volume (All Employees)"
                        value={formatCurrency(stats.totalVolumeCompleted)}
                        target={formatCurrency(stats.totalVolumeGoal)}
                        progress={stats.volumeProgress}
                        status={getStatus(stats.volumeProgress)}
                      />
                      <KPICard
                        title="Avg. Units Closed (Monthly)"
                        value={stats.totalUnitsCompleted.toString()}
                        target={stats.totalUnitsTarget.toString()}
                        progress={stats.unitsProgress}
                        status={getStatus(stats.unitsProgress)}
                      />
                      <KPICard
                        title="Total Employees"
                        value={stats.employeeCount.toString()}
                        subtitle="Active employees"
                      />
                      <KPICard
                        title="Team Performance"
                        value={`${Math.round((stats.volumeProgress + stats.unitsProgress) / 2)}%`}
                        subtitle="Overall target achievement"
                        status={getStatus(Math.round((stats.volumeProgress + stats.unitsProgress) / 2))}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <ProgressChart
                        title="Monthly Team Performance"
                        data={chartData}
                        type="bar"
                      />
                      <ProgressChart
                        title="Volume Trend"
                        data={chartData}
                        type="area"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {activeView === "employees" && (
              <div>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading employees...</div>
                  </div>
                ) : (
                  <EmployeeTable
                    employees={tableEmployees}
                    onEdit={handleEditEmployee}
                    onDelete={handleDeleteEmployee}
                    onAdd={handleAddEmployee}
                    onSetTargets={handleSetTargets}
                  />
                )}
              </div>
            )}

            {activeView === "coaching" && (
              <CoachingFeedback />
            )}

            {activeView === "reports" && (
              <AdminReports />
            )}

            {activeView === "settings" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Settings</h2>
                <p className="text-muted-foreground">Configure system settings and preferences here.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <EmployeeFormDialog
        open={employeeDialogOpen}
        onClose={() => setEmployeeDialogOpen(false)}
        onSubmit={handleSubmitEmployee}
        employee={selectedEmployee}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        description="Are you sure you want to delete this employee? This action cannot be undone and will remove all associated KPI data."
        isDeleting={deleteEmployeeMutation.isPending}
      />

      {employeeForTargets && (
        <KPITargetDialog
          open={targetDialogOpen}
          onClose={() => {
            setTargetDialogOpen(false);
            setEmployeeForTargets(null);
          }}
          employeeId={employeeForTargets.id}
          employeeName={employeeForTargets.employeeName}
        />
      )}
    </SidebarProvider>
  );
}
