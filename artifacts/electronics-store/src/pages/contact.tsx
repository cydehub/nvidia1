import { useState } from "react";
import { useGetSettings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/format";
import { SEO } from "@/components/seo";

export default function Contact() {
  const { data: settings } = useGetSettings({ query: { queryKey: ["/api/settings"] } });
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings?.whatsappNumber) return;
    
    const waMessage = `*New Contact Form Inquiry*\n\n*Name:* ${name}\n*Email:* ${email}\n\n*Message:*\n${message}`;
    window.open(buildWhatsAppUrl(settings.whatsappNumber, waMessage), '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <SEO title="Contact Us" />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Us</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Have a question about a product? Need help with an order? We're here for you. 
          Visit our store in Nairobi or reach out via WhatsApp for the fastest response.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div className="space-y-8">
          <div className="bg-card border rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Store Information</h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground">{settings?.address || "Tom Mboya Street, Rural Urban Building, Shop B4 (off Moi Avenue), Nairobi, Kenya"}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Phone / WhatsApp</p>
                  <p className="text-muted-foreground">{settings?.whatsappNumber || settings?.contactPhone || "+254..."}</p>
                </div>
              </li>
              {settings?.contactEmail && (
                <li className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">{settings.contactEmail}</p>
                  </div>
                </li>
              )}
              <li className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Business Hours</p>
                  <div className="text-muted-foreground text-sm space-y-1 mt-1">
                    <p className="flex justify-between w-48"><span>Mon - Fri:</span> <span>9:00 AM - 6:00 PM</span></p>
                    <p className="flex justify-between w-48"><span>Saturday:</span> <span>9:00 AM - 4:00 PM</span></p>
                    <p className="flex justify-between w-48"><span>Sunday:</span> <span>Closed</span></p>
                  </div>
                </div>
              </li>
            </ul>

            <div className="mt-8 pt-8 border-t">
              <a href={buildWhatsAppUrl(settings?.whatsappNumber, "Hello Cydestore, I have a question.")} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold h-12 text-base">
                  <MessageCircle className="mr-2 w-5 h-5" /> Chat on WhatsApp
                </Button>
              </a>
              <p className="text-xs text-center text-muted-foreground mt-3">Fastest way to reach us!</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input 
                id="name" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                required 
                rows={5}
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                placeholder="How can we help you?"
              />
            </div>
            <Button type="submit" className="w-full h-12">Submit Inquiry via WhatsApp</Button>
          </form>
        </div>
      </div>
      
      {/* Map Placeholder */}
      <div className="mt-16 max-w-5xl mx-auto rounded-2xl overflow-hidden border bg-muted aspect-[21/9] relative flex items-center justify-center">
         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
         <div className="bg-background/90 backdrop-blur p-6 rounded-xl border shadow-lg relative z-10 text-center max-w-sm">
           <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
           <h3 className="font-bold text-lg mb-1">Cydestore</h3>
           <p className="text-sm text-muted-foreground">Rural Urban Building, Shop B4<br/>Tom Mboya Street, Nairobi</p>
         </div>
      </div>
    </div>
  );
}
