import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Sourcing from "@/pages/Sourcing";
import Prospects from "@/pages/Prospects";
import ProspectDetail from "@/pages/ProspectDetail";
import Exports from "@/pages/Exports";
import Regions from "@/pages/Regions";
import ScanPage from "@/pages/ScanPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/scan/:scan_slug" element={<ScanPage />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sourcing" element={<Sourcing />} />
              <Route path="/prospects" element={<Prospects />} />
              <Route path="/prospects/:id" element={<ProspectDetail />} />
              <Route path="/exports" element={<Exports />} />
              <Route path="/regions" element={<Regions />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

