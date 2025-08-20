import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./lib/cart";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Admin from "@/pages/admin";
import AdminAccessDenied from "@/pages/admin-access-denied";
import Checkout from "@/pages/checkout";
import ProductDetail from "@/pages/product-detail";
import NotFound from "@/pages/not-found";
import "./lib/i18n"; // Initialize i18n

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/landing" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      {/* Admin route - check authentication within component to avoid 404 */}
      <Route path="/admin" component={Admin} />
      <Route path="/checkout" component={Checkout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Router />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
