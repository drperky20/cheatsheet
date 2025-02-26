import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MobileNavigation } from "@/components/navigation/mobile-nav";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse-slow flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-primary/20" />
          <div className="h-2 w-24 rounded-full bg-primary/20" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse-slow flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-primary/20" />
          <div className="h-2 w-24 rounded-full bg-primary/20" />
        </div>
      </div>
    );
  }

  if (profile) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>
          <div className="min-h-screen flex flex-col"> {/* Modified to remove sidebar and use flex-col */}
            <MobileNavigation />
            <ScrollArea className="flex-1">
              <main className="container mx-auto p-6">
                <Routes>
                  <Route
                    path="/auth"
                    element={
                      <AuthRoute>
                        <Index />
                      </AuthRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/" element={<Navigate to="/auth" replace />} />
                </Routes>
              </main>
            </ScrollArea>
          </div>
          <Toaster />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;