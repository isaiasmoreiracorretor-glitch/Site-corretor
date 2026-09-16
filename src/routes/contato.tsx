import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { LeadDialog } from "@/components/site/LeadDialog";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const title = `Contato — ${siteConfig.brokerName} | ${siteConfig.brandName}`;
const description =
  "Fale direto com o corretor pelo WhatsApp. Atendimento em Salvador, Lauro de Freitas, Camaçari e Simões Filho.";

export const Route = createFileRoute("/contato")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://imovel-zap-link.lovable.app/contato" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://imovel-zap-link.lovable.app/contato" }],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Atendimento direto"
        title="Vamos conversar sobre o seu imóvel"
        description="Me conte o que você procura: valor de entrada, região preferida e número de quartos. Eu envio as melhores opções pelo WhatsApp."
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-2">
        <div className="space-y-6">
          <h2 className="font-display text-2xl font-bold">Como falar comigo</h2>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 size-5 text-brand" />
              <span>
                <strong className="block">WhatsApp / Telefone</strong>
                {siteConfig.whatsappDisplay}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 size-5 text-brand" />
              <span>
                <strong className="block">E-mail</strong>
                {siteConfig.email}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 text-brand" />
              <span>
                <strong className="block">Regiões atendidas</strong>
                {siteConfig.serviceAreas.join(" • ")}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 size-5 text-brand" />
              <span>
                <strong className="block">Horário</strong>
                Segunda a sábado, das 8h às 20h
              </span>
            </li>
          </ul>

          <Button asChild variant="whatsapp" size="xl">
            <a
              href={buildWhatsAppUrl(
                `Olá ${siteConfig.brokerName}! Quero atendimento para comprar um imóvel.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon /> Abrir conversa no WhatsApp
            </a>
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h2 className="font-display text-2xl font-bold">Prefere que eu te chame?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Deixe seus dados e o que você procura. A conversa segue no WhatsApp com as opções que
            fazem sentido para o seu perfil.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>• Simulação de financiamento e subsídio</li>
            <li>• Análise de crédito sem custo</li>
            <li>• Visitas agendadas conforme sua agenda</li>
            <li>• Documentação acompanhada até a escritura</li>
          </ul>
          <LeadDialog
            defaultInterest="Contato pelo site"
            trigger={
              <Button variant="hero" size="xl" className="mt-6 w-full">
                Quero ser atendido
              </Button>
            }
          />
        </div>
      </div>
    </>
  );
}
