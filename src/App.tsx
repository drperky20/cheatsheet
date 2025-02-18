
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import { useAuth } from "@/contexts/AuthContext";
import { Watermark } from "@/components/ui/watermark";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (profile) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Watermark />
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
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;
