import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import Overview from "./pages/admin/Overview.tsx";
import BrandingEditor from "./pages/admin/BrandingEditor.tsx";
import ContentEditor from "./pages/admin/ContentEditor.tsx";
import ServicesEditor from "./pages/admin/ServicesEditor.tsx";
import CarsEditor from "./pages/admin/CarsEditor.tsx";
import ReviewsEditor from "./pages/admin/ReviewsEditor.tsx";
import PaymentEditor from "./pages/admin/PaymentEditor.tsx";
import WhatsAppEditor from "./pages/admin/WhatsAppEditor.tsx";
import ContactEditor from "./pages/admin/ContactEditor.tsx";
import AccessControl from "./pages/admin/AccessControl.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Overview />} />
              <Route path="branding" element={<BrandingEditor />} />
              <Route path="content" element={<ContentEditor />} />
              <Route path="services" element={<ServicesEditor />} />
              <Route path="cars" element={<CarsEditor />} />
              <Route path="reviews" element={<ReviewsEditor />} />
              <Route path="payment" element={<PaymentEditor />} />
              <Route path="whatsapp" element={<WhatsAppEditor />} />
              <Route path="contact" element={<ContactEditor />} />
              <Route path="access" element={<AccessControl />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
