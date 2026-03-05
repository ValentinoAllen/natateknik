import { MessageCircle } from "lucide-react";
import { useAppData } from "./data-provider";
import { sanitizeWhatsAppNumber } from "./api";

export function WhatsAppFloat() {
  const { settings } = useAppData();
  const waNumber = sanitizeWhatsAppNumber(settings.wa_number || "6282277775595");

  return (
    <a
      href={`https://wa.me/${waNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat via WhatsApp"
      className="fixed right-7 bottom-7 z-[999] flex h-[60px] w-[60px] cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all hover:scale-110 hover:shadow-[0_6px_28px_rgba(37,211,102,0.55)]"
    >
      <MessageCircle className="h-7 w-7" />
      <span
        className="absolute inset-0 -z-[1] rounded-full bg-[#25D366]"
        style={{ animation: "waPulse 2s ease-out infinite" }}
      />
    </a>
  );
}
