import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TripProvider } from "@/contexts/TripContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import Navigation from "@/components/Navigation";
import GlobalChatbot from "@/components/GlobalChatbot";
import NewHome from "./pages/NewHome";
import Search from "./pages/Search";
import Explore from "./pages/Explore";
import Saved from "./pages/Saved";
import Map from "./pages/Map";
import ItineraryView from "./pages/ItineraryView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="travel-app-theme">
      <TripProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ThemeToggle />
            <Navigation />
            <GlobalChatbot />
            <div className="pt-16">
              <Routes>
                <Route path="/" element={<NewHome />} />
                <Route path="/search" element={<Search />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/map" element={<Map />} />
                <Route path="/itinerary" element={<ItineraryView />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </TripProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
