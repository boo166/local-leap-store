import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import SellerRoute from "./components/SellerRoute";

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
const Security = lazy(() => import("./pages/Security"));
const Compare = lazy(() => import("./pages/Compare"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const BecomeSeller = lazy(() => import("./pages/BecomeSeller"));

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
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:productId" element={<ProductDetails />} />
                <Route path="/store/:storeId" element={<Store />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/become-seller" element={<BecomeSeller />} />
                
                {/* Protected routes (any authenticated user) */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } />
                <Route path="/orders/:orderId" element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                } />
                <Route path="/my-dashboard" element={
                  <ProtectedRoute>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                } />
                <Route path="/security" element={
                  <ProtectedRoute>
                    <Security />
                  </ProtectedRoute>
                } />
                
                {/* Seller routes (seller or admin only) */}
                <Route path="/dashboard" element={
                  <SellerRoute>
                    <Dashboard />
                  </SellerRoute>
                } />
                <Route path="/create-store" element={
                  <SellerRoute>
                    <CreateStore />
                  </SellerRoute>
                } />
                <Route path="/add-product" element={
                  <SellerRoute>
                    <AddProduct />
                  </SellerRoute>
                } />
                <Route path="/edit-store/:storeId" element={
                  <SellerRoute>
                    <EditStore />
                  </SellerRoute>
                } />
                <Route path="/edit-product/:productId" element={
                  <SellerRoute>
                    <EditProduct />
                  </SellerRoute>
                } />
                <Route path="/seller/orders" element={
                  <SellerRoute>
                    <SellerOrders />
                  </SellerRoute>
                } />
                <Route path="/subscription" element={
                  <SellerRoute>
                    <Subscription />
                  </SellerRoute>
                } />
                
                {/* Admin routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } />
                
                {/* Catch-all */}
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
