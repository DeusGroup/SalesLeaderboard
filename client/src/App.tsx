import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";

// Pages
import LeaderboardPage from "@/pages/leaderboard";
import AdminLoginPage from "@/pages/admin/login";
import NotFound from "@/pages/not-found";
import { AdminDashboard } from "@/pages/admin/dashboard";
import { UserProfile } from "@/pages/admin/profile";

// Components
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LeaderboardPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} />
      <ProtectedRoute path="/admin/profile/:id" component={UserProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;