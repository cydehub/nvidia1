import { Link } from "wouter";
import { useGetSettings } from "@workspace/api-client-react";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  const { data: settings } = useGetSettings({ query: { queryKey: ["/api/settings"] } });

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Cydestore" className="h-8 grayscale brightness-200" />
              ) : (
                <span className="text-xl font-bold tracking-tight">Cydestore</span>
              )}
            </Link>
            <p className="text-secondary-foreground/70 text-sm mb-6">
              {settings?.storeTagline || "Your trustworthy neighborhood electronics store with flagship-grade polish."}
            </p>
            <div className="flex gap-4">
              {settings?.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings?.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings?.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li><Link href="/shop" className="hover:text-primary transition-colors">Shop Products</Link></li>
              <li><Link href="/categories" className="hover:text-primary transition-colors">All Categories</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-lg">Contact Us</h3>
            <ul className="space-y-3 text-sm text-secondary-foreground/70">
              {settings?.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-primary" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings?.contactPhone && (
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 shrink-0 text-primary" />
                  <span>{settings.contactPhone}</span>
                </li>
              )}
              {settings?.contactEmail && (
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-primary" />
                  <span>{settings.contactEmail}</span>
                </li>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-lg">Store Hours</h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li className="flex justify-between"><span>Mon - Fri</span> <span>9:00 AM - 6:00 PM</span></li>
              <li className="flex justify-between"><span>Saturday</span> <span>9:00 AM - 4:00 PM</span></li>
              <li className="flex justify-between"><span>Sunday</span> <span>Closed</span></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-secondary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-secondary-foreground/50">
          <p>{settings?.footerText || `© ${new Date().getFullYear()} Cydestore. All rights reserved.`}</p>
          <p>Designed for Tom Mboya Street, Nairobi.</p>
        </div>
      </div>
    </footer>
  );
}
