
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ApiProvider } from "@/context/ApiContext";
import { AppHeader } from "@/components/layout/AppHeader";
import Index from "./pages/Index";
import MappingsList from "./pages/MappingsList";
import MappingHistory from "./pages/MappingHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => (
  <div className="min-h-screen bg-background">
    <AppHeader />
    <main className="container mx-auto py-6">
      <Routes>
        <Route path="/" element={<MappingsList />} />
        <Route path="/mappings" element={<MappingsList />} />
        <Route path="/mappings/:id" element={<Index />} />
        <Route path="/mappings/:id/_history" element={<MappingHistory />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  </div>
);

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ProtectedRoute>
            <ApiProvider>
              <AppContent />
            </ApiProvider>
          </ProtectedRoute>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
