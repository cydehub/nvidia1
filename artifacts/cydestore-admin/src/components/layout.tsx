import { Link, useLocation } from "wouter";
import { useGetAdminMe, useAdminLogout, getGetAdminMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Package,
  Tags,
  Image as ImageIcon,
  MessageSquareQuote,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  Sun,
  Moon,
  Monitor
} from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "./theme-provider";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/brands", label: "Brands", icon: Tags },
  { href: "/banners", label: "Banners", icon: ImageIcon },
  { href: "/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

function ThemeToggle() {
  const { setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarContent({ isMobile, onClose }: { isMobile?: boolean; onClose?: () => void }) {
  const [location] = useLocation();
  const { data: user } = useGetAdminMe();
  const logout = useAdminLogout();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout.mutateAsync({});
    queryClient.invalidateQueries({ queryKey: getGetAdminMeQueryKey() });
    setLocation("/login");
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-sidebar-primary">CydeAdmin</h2>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-2">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <div
                className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70"}`} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-9 w-9 bg-sidebar-accent">
            <AvatarFallback className="text-sidebar-accent-foreground font-semibold">
              {user?.username?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const currentItem = navItems.find((item) => location === item.href || (item.href !== "/" && location.startsWith(item.href))) || { label: "Admin" };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6 bg-card">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SidebarContent isMobile />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold">{currentItem.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
