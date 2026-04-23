import { useGetSettings } from "@workspace/api-client-react";
import { SEO } from "@/components/seo";
import { CheckCircle2, MapPin, Store, Shield } from "lucide-react";

export default function About() {
  const { data: settings } = useGetSettings({ query: { queryKey: ["/api/settings"] } });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEO title="About Us" />
      
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">About Cydestore</h1>
        <p className="text-xl text-muted-foreground">
          {settings?.storeTagline || "Nairobi's most trusted neighborhood electronics store."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div className="aspect-square rounded-2xl overflow-hidden bg-muted relative">
          <img src="/src/assets/banner-laptops.png" alt="Cydestore Shop" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed">
            Located in the heart of Nairobi, Cydestore was founded with a simple mission: to provide genuine, high-quality electronics with unmatched customer service. We understand that buying electronics is an investment, which is why we prioritize trust and authenticity above all else.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Unlike faceless online marketplaces, we are a real shop with real people. You can visit us, talk to our experts, and inspect your device before purchase. We combine the convenience of WhatsApp ordering with the security of a physical retail presence.
          </p>
        </div>
      </div>

      <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 mb-20">
        <h2 className="text-2xl font-bold mb-8 text-center">Why Nairobi Trusts Us</h2>
        <div className="grid sm:grid-cols-2 gap-8">
          <div className="flex gap-4">
            <CheckCircle2 className="w-8 h-8 shrink-0 text-primary-foreground/80" />
            <div>
              <h3 className="font-semibold text-lg mb-1">100% Genuine Products</h3>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">We source directly from authorized distributors. Every item comes with a valid manufacturer warranty.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <MapPin className="w-8 h-8 shrink-0 text-primary-foreground/80" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Local & Accessible</h3>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">Centrally located on Tom Mboya Street. Easy to find, easy to return to if you need support.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Store className="w-8 h-8 shrink-0 text-primary-foreground/80" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Expert Advice</h3>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">We don't just sell boxes. We help you choose the exact spec that matches your needs and budget.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Shield className="w-8 h-8 shrink-0 text-primary-foreground/80" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Secure Shopping</h3>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">No online card payments required. Order via WhatsApp, pay upon delivery or collection.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
