import { useEffect, useState } from "react";

import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { siteConfig } from "@/config/site";
import { insertLead } from "@/lib/leads.api";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppFloat() {
  const [bottomOffset, setBottomOffset] = useState(20);

  useEffect(() => {
    const updateBottomOffset = () => {
      const footer = document.getElementById("site-footer");
      if (!footer) return;

      const footerTop = footer.getBoundingClientRect().top;
      setBottomOffset(Math.max(20, window.innerHeight - footerTop + 20));
    };

    updateBottomOffset();
    window.addEventListener("scroll", updateBottomOffset, { passive: true });
    window.addEventListener("resize", updateBottomOffset);

    return () => {
      window.removeEventListener("scroll", updateBottomOffset);
      window.removeEventListener("resize", updateBottomOffset);
    };
  }, []);

  return (
    <a
      href={buildWhatsAppUrl(
        `Olá ${siteConfig.brokerName}! Estou no site e gostaria de falar sobre imóveis.`,
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      onClick={() => {
        insertLead({
          name: "",
          message: "Clique no botão flutuante do WhatsApp",
          source: "Botão Flutuante (WhatsApp)",
        }).catch((e) => console.warn("Erro ao registrar lead do botão flutuante:", e));
      }}
      style={{ bottom: bottomOffset }}
      className="fixed right-5 z-50 flex items-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-sm font-semibold text-whatsapp-foreground shadow-xl transition-[bottom,transform] hover:scale-105"
    >
      <WhatsAppIcon className="size-5" />
      <span className="hidden sm:inline">Falar no WhatsApp</span>
    </a>
  );
}
