import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { OptimizedProvider } from "@/lib/optimized-context";
import Index from "./pages/Index.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import FraudPage from "./pages/FraudPage.tsx";
import BenchmarkPage from "./pages/BenchmarkPage.tsx";
import PriorityPage from "./pages/PriorityPage.tsx";
import LsmPage from "./pages/LsmPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <OptimizedProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/fraud" element={<FraudPage />} />
            <Route path="/benchmark" element={<BenchmarkPage />} />
            <Route path="/priority" element={<PriorityPage />} />
            <Route path="/lsm" element={<LsmPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </OptimizedProvider>
  </QueryClientProvider>
);

export default App;
