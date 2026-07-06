import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { getFilterOptions, queryResources } from "@/lib/notion";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const queryClient = new QueryClient();

// Prefetch on app load so the quiz/search feel near-instant.
// Filter options power the quiz buttons; the base resource list warms
// the cache + edge function for the unfiltered results/search paths.
queryClient.prefetchQuery({
  queryKey: ["filter-options"],
  queryFn: getFilterOptions,
  staleTime: 60 * 60 * 1000,
});

queryClient.prefetchQuery({
  queryKey: ["resources", {}, ""],
  queryFn: () => queryResources(undefined, undefined),
  staleTime: 60 * 60 * 1000,
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
