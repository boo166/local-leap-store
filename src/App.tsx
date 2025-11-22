import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailVerification from "./pages/EmailVerification";
import Marketplace from "./pages/Marketplace";
import Products from "./pages/Products";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import Dashboard from "./pages/Dashboard";
import CreateStore from "./pages/CreateStore";
import AddProduct from "./pages/AddProduct";
import EditStore from "./pages/EditStore";
import EditProduct from "./pages/EditProduct";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import SellerOrders from "./pages/SellerOrders";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Subscription from "./pages/Subscription";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/products" element={<Products />} />
            <Route path="/store/:storeId" element={<Store />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-store" element={<CreateStore />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/edit-store/:storeId" element={<EditStore />} />
            <Route path="/edit-product/:productId" element={<EditProduct />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/wishlist" element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            } />
            <Route path="/seller/orders" element={
              <ProtectedRoute>
                <SellerOrders />
              </ProtectedRoute>
            } />
            <Route path="/subscription" element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
