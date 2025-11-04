import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/components/LoginPage";
import AdminDashboard from "@/components/AdminDashboard";
import EmployeeDashboard from "@/components/EmployeeDashboard";

function Router() {
  //todo: remove mock functionality - will be replaced with real auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "employee" | null>(null);
  const [userName, setUserName] = useState("");

  const handleLogin = (username: string, password: string) => {
    console.log('Login attempt:', username);
    
    // Mock login logic - to be replaced with real authentication
    if (username === "admin" && password === "admin") {
      setIsAuthenticated(true);
      setUserRole("admin");
      setUserName("Admin User");
    } else if (username === "employee" && password === "employee") {
      setIsAuthenticated(true);
      setUserRole("employee");
      setUserName("Sarah Johnson");
    } else {
      alert("Invalid credentials. Try admin/admin or employee/employee");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName("");
    console.log('User logged out');
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (userRole === "admin") {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (userRole === "employee") {
    return <EmployeeDashboard employeeName={userName} onLogout={handleLogout} />;
  }

  return (
    <Switch>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
