import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense } from "react";
import ProtectedRoute from "./components/ProtectedRoute";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Marketplace from "./pages/Marketplace";

// Lazy load secondary pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateStore = lazy(() => import("./pages/CreateStore"));
const AddProduct = lazy(() => import("./pages/AddProduct"));
const Store = lazy(() => import("./pages/Store"));
const Products = lazy(() => import("./pages/Products"));
const EditProduct = lazy(() => import("./pages/EditProduct"));
const EditStore = lazy(() => import("./pages/EditStore"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const Cart = lazy(() => import("./pages/Cart"));
const Orders = lazy(() => import("./pages/Orders"));
const SellerOrders = lazy(() => import("./pages/SellerOrders"));
const EmailVerification = lazy(() => import("./pages/EmailVerification"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Admin = lazy(() => import("./pages/Admin"));
const Wishlist = lazy(() => import("./pages/Wishlist"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="glass rounded-xl p-8">
      <div className="animate-pulse text-center space-y-4">
        <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto animate-bounce"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
