import { Link } from "wouter";
import { useGetSettings } from "@workspace/api-client-react";
import { ShoppingBag, Menu, Moon, Sun, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { buildWhatsAppUrl } from "@/lib/format";

export function Header() {
  const { data: settings } = useGetSettings({ query: { queryKey: ["/api/settings"] } });
  const { setTheme, theme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Cydestore" className="h-8" />
            ) : (
              <span className="text-xl font-bold tracking-tight text-primary">Cydestore</span>
            )}
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors">Shop</Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">Categories</Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">Contact</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <div className="hidden sm:block">
            <a href={buildWhatsAppUrl(settings?.whatsappNumber, "Hello Cydestore, I would like to make an order.")} target="_blank" rel="noopener noreferrer">
              <Button>Order on WhatsApp</Button>
            </a>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-medium hover:text-primary">Home</Link>
                <Link href="/shop" className="text-lg font-medium hover:text-primary">Shop</Link>
                <Link href="/categories" className="text-lg font-medium hover:text-primary">Categories</Link>
                <Link href="/about" className="text-lg font-medium hover:text-primary">About</Link>
                <Link href="/contact" className="text-lg font-medium hover:text-primary">Contact</Link>
                <Link href="/faq" className="text-lg font-medium hover:text-primary">FAQ</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
