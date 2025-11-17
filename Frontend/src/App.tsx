import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import CustomerPage from "./pages/CustomerPage";
import ProductPage from "./pages/ProductPage";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Products />} />
            <Route path="/categorias" element={<Products />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/registro" element={<Auth />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute role="customer"><Checkout /></ProtectedRoute>} />
            <Route path="/payment-success" element={<ProtectedRoute role="customer"><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/payment-canceled" element={<ProtectedRoute role="customer"><PaymentCanceled /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute role="customer"><Profile /></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute role="employee"><CustomerPage /></ProtectedRoute>} />
            <Route path="/productoscontrol" element={<ProtectedRoute role="employee"><ProductPage /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
