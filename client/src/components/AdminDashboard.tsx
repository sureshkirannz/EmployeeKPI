import { useState } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, BarChart3, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import KPICard from "./KPICard";
import EmployeeTable from "./EmployeeTable";
import ProgressChart from "./ProgressChart";

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeView, setActiveView] = useState("dashboard");

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, view: "dashboard" },
    { title: "Employees", icon: Users, view: "employees" },
    { title: "Reports", icon: BarChart3, view: "reports" },
    { title: "Settings", icon: Settings, view: "settings" },
  ];

  //todo: remove mock functionality
  const mockEmployees = [
    { id: '1', name: 'Sarah Johnson', username: 'sjohnson', role: 'Employee', volumeProgress: 85, unitsProgress: 92, status: 'on-track' as const },
    { id: '2', name: 'Michael Chen', username: 'mchen', role: 'Employee', volumeProgress: 45, unitsProgress: 58, status: 'at-risk' as const },
    { id: '3', name: 'Emily Rodriguez', username: 'erodriguez', role: 'Employee', volumeProgress: 110, unitsProgress: 105, status: 'exceeded' as const },
  ];

  const chartData = [
    { name: 'Jan', value: 65, target: 96 },
    { name: 'Feb', value: 72, target: 96 },
    { name: 'Mar', value: 88, target: 96 },
    { name: 'Apr', value: 91, target: 96 },
  ];

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <KPICard
                    title="Total Volume (All Employees)"
                    value="$245M"
                    target="$300M"
                    progress={82}
                    status="on-track"
                  />
                  <KPICard
                    title="Avg. Units Closed"
                    value="19.5"
                    target="24"
                    progress={81}
                    status="on-track"
                  />
                  <KPICard
                    title="Total Employees"
                    value="12"
                    subtitle="Active employees"
                  />
                  <KPICard
                    title="Team Performance"
                    value="87%"
                    subtitle="Overall target achievement"
                    status="on-track"
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
              </div>
            )}

            {activeView === "employees" && (
              <EmployeeTable
                employees={mockEmployees}
                onEdit={(id) => console.log('Edit:', id)}
                onDelete={(id) => console.log('Delete:', id)}
                onAdd={() => console.log('Add employee')}
              />
            )}

            {activeView === "reports" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Performance Reports</h2>
                <div className="grid grid-cols-1 gap-4">
                  <ProgressChart
                    title="Year-to-Date Volume by Employee"
                    data={chartData}
                    type="bar"
                    height={400}
                  />
                </div>
              </div>
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
    </SidebarProvider>
  );
}
