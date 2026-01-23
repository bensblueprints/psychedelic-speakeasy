import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Join from "./pages/Join";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OptIn from "./pages/OptIn";
import Community from "./pages/Community";
import PostDetail from "./pages/PostDetail";
import VendorDetail from "./pages/VendorDetail";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/optin"} component={OptIn} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/articles"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogPost} />
      <Route path={"/articles/:slug"} component={BlogPost} />
      <Route path={"/join"} component={Join} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/community"} component={Community} />
      <Route path={"/community/space/:slug"} component={Community} />
      <Route path={"/community/post/:id"} component={PostDetail} />
      <Route path={"/vendors/:slug"} component={VendorDetail} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
