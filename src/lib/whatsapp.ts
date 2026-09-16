import { siteConfig } from "@/config/site";

export interface LeadData {
  name?: string;
  phone?: string;
  message?: string;
  interest?: string;
  financing?: {
    householdIncome?: string;
    age?: string;
    downPayment?: string;
    fgts?: string;
  };
}

export function buildWhatsAppUrl(text: string) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function buildLeadMessage(lead: LeadData, propertyTitle?: string, propertyRef?: string) {
  const lines = [`Olá ${siteConfig.brokerName}! Vi seu site e gostaria de mais informações.`, ""];

  if (lead.name) lines.push(`*Nome:* ${lead.name}`);
  if (lead.phone) lines.push(`*WhatsApp:* ${lead.phone}`);
  if (propertyTitle)
    lines.push(
      `*Nome do imóvel:* ${propertyTitle}${propertyRef ? ` (Ref. ${propertyRef})` : ""}`,
    );
  if (lead.interest) lines.push(`*Interesse:* ${lead.interest}`);
  if (lead.financing?.householdIncome)
    lines.push(`*Renda familiar:* ${lead.financing.householdIncome}`);
  if (lead.financing?.age) lines.push(`*Idade:* ${lead.financing.age}`);
  if (lead.financing?.downPayment)
    lines.push(`*Valor entrada:* ${lead.financing.downPayment}`);
  if (lead.financing?.fgts) lines.push(`*FGTS:* ${lead.financing.fgts}`);
  if (lead.message?.trim()) lines.push(`*Mensagem:* ${lead.message.trim()}`);

  return lines.join("\n");
}

export function openWhatsApp(text: string) {
  const url = buildWhatsAppUrl(text);
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
