
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RealTimeOrderUpdates from "@/components/RealTimeOrderUpdates";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import VendorRegister from "./pages/VendorRegister";
import VendorDashboard from "./pages/VendorDashboard";
import ShopProfile from "./pages/ShopProfile";
import ProductCatalog from "./pages/ProductCatalog";
import ShoppingCart from "./pages/ShoppingCart";
import CustomerAccount from "./pages/CustomerAccount";
import OrderTracking from "./pages/OrderTracking";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RealTimeOrderUpdates />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/products" element={<ProductCatalog />} />
            <Route path="/shop/:id" element={<ShopProfile />} />
            <Route 
              path="/vendor/register" 
              element={
                <ProtectedRoute requiredRole="vendor">
                  <VendorRegister />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vendor/dashboard" 
              element={
                <ProtectedRoute requiredRole="vendor">
                  <VendorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute>
                  <ShoppingCart />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/account" 
              element={
                <ProtectedRoute>
                  <CustomerAccount />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <OrderTracking />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
