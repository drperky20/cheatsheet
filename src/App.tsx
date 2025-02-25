import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/contexts/QueryProvider";
import { useAuth } from "@/contexts/AuthContext";
import { Watermark } from "@/components/ui/watermark";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/ui/page-transition";
import { CardSkeleton } from "@/components/ui/lazy-load";
import { ErrorBoundary } from "@/components/ui/lazy-load";

// Lazy load pages for code splitting
const Index = lazy(() => import("@/pages/Index"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Settings = lazy(() => import("@/pages/Settings"));
const Profile = lazy(() => import("@/pages/Profile"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Loading component for auth state
const AuthLoader = () => (
  <div className="w-full min-h-screen flex items-center justify-center">
    <div className="w-full max-w-md px-4">
      <CardSkeleton />
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="w-full min-h-screen flex items-center justify-center p-4">
    <div className="neo-glass p-6 rounded-xl w-full max-w-md">
      <h2 className="text-xl font-semibold mb-2 text-gradient-teal">Something went wrong</h2>
      <p className="text-white/70 mb-4">{error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-[#00B2A9] hover:bg-[#00a099] text-white px-4 py-2 rounded-lg transition-all"
      >
        Refresh page
      </button>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <AuthLoader />;
  }
  
  if (!profile) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, isLoading } = useAuth();
  
  if (isLoading) {
    return <AuthLoader />;
  }
  
  if (profile) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <PageTransition routeKey={location.pathname} className="w-full min-h-screen">
        <Routes location={location}>
          <Route
            path="/auth"
            element={
              <AuthRoute>
                <Suspense fallback={<AuthLoader />}>
                  <Index />
                </Suspense>
              </AuthRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Suspense fallback={<AuthLoader />}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Suspense fallback={<AuthLoader />}>
                  <Settings />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Suspense fallback={<AuthLoader />}>
                  <Profile />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="*" element={
            <Suspense fallback={<AuthLoader />}>
              <NotFound />
            </Suspense>
          } />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <ErrorBoundary fallback={(error) => <ErrorFallback error={error} />}>
      <QueryProvider>
        <Router>
          <AuthProvider>
            <Watermark />
            <AnimatedRoutes />
            <Toaster />
          </AuthProvider>
        </Router>
      </QueryProvider>
    </ErrorBoundary>
  );
};

export default App;
