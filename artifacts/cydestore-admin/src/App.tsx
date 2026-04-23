import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";

import { AdminAuthGuard } from "./components/auth-guard";
import { AdminLayout } from "./components/layout";

// Pages
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Categories from "./pages/categories";
import Brands from "./pages/brands";
import Faqs from "./pages/faqs";
import Banners from "./pages/banners";
import Testimonials from "./pages/testimonials";
import Settings from "./pages/settings";
import Products from "./pages/products";
import ProductForm from "./pages/product-form";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  return (
    <AdminAuthGuard>
      <AdminLayout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/categories" component={Categories} />
          <Route path="/brands" component={Brands} />
          <Route path="/banners" component={Banners} />
          <Route path="/faqs" component={Faqs} />
          <Route path="/testimonials" component={Testimonials} />
          <Route path="/settings" component={Settings} />
          <Route path="/products" component={Products} />
          <Route path="/products/new" component={ProductForm} />
          <Route path="/products/:id/edit" component={ProductForm} />
          {/* Add more routes here */}
          <Route component={NotFound} />
        </Switch>
      </AdminLayout>
    </AdminAuthGuard>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/*" component={ProtectedRoutes} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="cydestore-admin-theme">
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
