import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import Missions from "./pages/Missions";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Ranks from "./pages/Ranks";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { useProfile } from "@/hooks/useProfile";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (loading || profileLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><span className="text-primary font-display text-xl animate-pulse">Carregando...</span></div>;
  if (!user) return <Navigate to="/auth" replace />;

  // If user still has auto-generated name (contains #), redirect to onboarding
  // Auto-generated names follow pattern "Word Word #1234"
  if (profile && /^[A-Z][a-z]+ [A-Z][a-z]+ #\d{4}$/.test(profile.hunter_name)) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (loading || profileLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  // If user already has a custom name, go to dashboard
  if (profile && !/^[A-Z][a-z]+ [A-Z][a-z]+ #\d{4}$/.test(profile.hunter_name)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
            <Route path="*" element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/missoes" element={<Missions />} />
                    <Route path="/progresso" element={<Progress />} />
                    <Route path="/ranking" element={<Ranks />} />
                    <Route path="/perfil" element={<Profile />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
