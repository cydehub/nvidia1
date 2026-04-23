import { useGetSettings } from "@workspace/api-client-react";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/format";

export function WhatsAppFloatingButton() {
  const { data: settings } = useGetSettings({ query: { queryKey: ["/api/settings"] } });

  if (!settings?.whatsappNumber) return null;

  return (
    <a
      href={buildWhatsAppUrl(settings.whatsappNumber, "Hello Cydestore! I need help.")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 transition-transform hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/50"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
