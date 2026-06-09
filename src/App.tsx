import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Admin from './pages/Admin';
import { AdminGuard } from './components/AdminGuard';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Practice from "./pages/Practice";
import QuizPage from "./pages/QuizPage";
import OldIsGold from "./pages/OldIsGold";
import OnlineExam from "./pages/OnlineExam";
import SubjectiveQuestions from "./pages/SubjectiveQuestions";
import Syllabus from "./pages/Syllabus";
import TypingPractice from "./pages/TypingPractice";
import Notes from "./pages/Notes";
import Downloads from "./pages/Downloads";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { Navigate } from "react-router-dom";
import Leaderboard from "./pages/Leaderboard";
import AdminPanel from "./pages/AdminPanel";
import CloudAdminGuard from "./components/CloudAdminGuard";
import NepalLoadingScreen from "./components/NepalLoadingScreen";
import DailyMCQPage from "./pages/DailyMCQPage";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Separate component for the main app content
const AppContent = () => {
  const location = useLocation();
  const [showLoading, setShowLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    // Check if this is a fresh page load (not client-side navigation)
    const navigationType = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    const isReload = navigationType?.type === "reload";
    
    // Show loading only on homepage AND (first visit OR manual reload)
    if (location.pathname === "/") {
      // Check if we're coming from navigation (not full page reload)
      const isClientSideNavigation = sessionStorage.getItem("clientSideNav") === "true";
      
      if (!isClientSideNavigation || isReload) {
        setShowLoading(true);
        // Set timeout to hide loading after 3 seconds
        const timer = setTimeout(() => {
          setShowLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        setShowLoading(false);
      }
    } else {
      setShowLoading(false);
    }
    
    // Mark that we're doing client-side navigation
    sessionStorage.setItem("clientSideNav", "true");
    
    // Reset on page unload
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("clientSideNav");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [location.pathname]);

  // Prevent body scroll during loading
  useEffect(() => {
    if (showLoading) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [showLoading]);

  return (
    <>
      {showLoading && <NepalLoadingScreen onComplete={() => setShowLoading(false)} />}
      
      <div style={{ display: showLoading ? 'none' : 'block' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route 
              path="/admin" 
              element={
                <AdminGuard>
                  <Admin />
                </AdminGuard>
              } 
            />
            <Route
              path="/admin-panel"
              element={
                <CloudAdminGuard>
                  <AdminPanel />
                </CloudAdminGuard>
              }
            />
            <Route path="/auth" element={<Auth />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
              <Route path="/quiz/:category/:setId?" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
              <Route path="/old-is-gold" element={<ProtectedRoute><OldIsGold /></ProtectedRoute>} />
              <Route path="/online-exam" element={<ProtectedRoute><OnlineExam /></ProtectedRoute>} />
              <Route path="/subjective" element={<ProtectedRoute><SubjectiveQuestions /></ProtectedRoute>} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              <Route path="/syllabus" element={<Syllabus />} />
              <Route path="/typing" element={<TypingPractice />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/daily-mcq" element={<DailyMCQPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </div>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
