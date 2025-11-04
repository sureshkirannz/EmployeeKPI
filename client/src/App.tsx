import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import LoginPage from "@/components/LoginPage";
import AdminDashboard from "@/components/AdminDashboard";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import { login, logout, getCurrentUser, type User } from "@/lib/auth";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    getCurrentUser()
      .then((response) => {
        if (response) {
          setIsAuthenticated(true);
          setUser(response.user);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await login(username, password);
      setIsAuthenticated(true);
      setUser(response.user);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${response.user.employeeName}`,
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (user.role === "admin") {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (user.role === "employee") {
    return <EmployeeDashboard employeeName={user.employeeName} onLogout={handleLogout} />;
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
