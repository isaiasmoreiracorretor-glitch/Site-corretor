import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { aboutQueryOptions } from "@/lib/about.api";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const title = `Sobre ${siteConfig.brokerName} | ${siteConfig.brandName}`;
const description = `Conheça ${siteConfig.brokerName}, ${siteConfig.creci}: corretor de imóveis em Salvador e região metropolitana. Lançamentos, na planta, prontos para morar e usados com atendimento direto no WhatsApp.`;

export const Route = createFileRoute("/sobre-moreira")({
  staticData: { sitemap: true },
  loader: ({ context }) => context.queryClient.ensureQueryData(aboutQueryOptions),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: "https://imovel-zap-link.lovable.app/sobre-moreira" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "canonical", href: "https://imovel-zap-link.lovable.app/sobre-moreira" },
    ],
  }),
  component: SobreMoreiraPage,
});

function SobreMoreiraPage() {
  const { data: profile } = useSuspenseQuery(aboutQueryOptions);
  const waUrl = buildWhatsAppUrl(
    `Olá ${siteConfig.brokerName}! Vi seu perfil no site e quero conversar sobre imóveis.`,
  );
  const initial = (profile.name || siteConfig.brokerName).trim().charAt(0).toUpperCase();

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mx-auto max-w-2xl">
        {/* Cabeçalho estilo perfil de Instagram */}
        <header className="flex flex-col items-center text-center">
          <div className="rounded-full bg-gradient-to-tr from-brand via-brand/60 to-whatsapp p-1">
            {profile.photo ? (
              <img
                src={profile.photoThumb || profile.photo}
                alt={`Foto de perfil de ${profile.name}`}
                width={640}
                height={640}
                className="size-32 rounded-full border-4 border-background object-cover md:size-40"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-32 items-center justify-center rounded-full border-4 border-background bg-brand-soft font-display text-5xl font-bold text-brand md:size-40"
              >
                {initial}
              </span>
            )}
          </div>

          <h1 className="mt-4 flex items-center gap-2 font-display text-2xl font-bold md:text-3xl">
            {profile.name}
            <BadgeCheck className="size-6 text-brand" aria-label="Perfil verificado" role="img" />
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{profile.roleLine}</p>
          {profile.bio && (
            <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/90 md:text-base">
              {profile.bio}
            </p>
          )}
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" /> {siteConfig.city} e região metropolitana
          </p>

          <Button asChild variant="whatsapp" size="lg" className="mt-5 w-full max-w-xs">
            <a href={waUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> Falar comigo no WhatsApp
            </a>
          </Button>
        </header>

        {/* Área 1: carrossel de imagens */}
        {profile.photos.length > 0 && (
          <section aria-labelledby="galeria" className="mt-12">
            <h2 id="galeria" className="font-display text-xl font-bold">
              Galeria
            </h2>
            <Carousel className="mt-4" opts={{ loop: profile.photos.length > 1 }}>
              <CarouselContent>
                {profile.photos.map((photo, index) => (
                  <CarouselItem key={`${photo.url}-${index}`}>
                    <img
                      src={photo.url}
                      alt={`Foto ${index + 1} de ${profile.name}`}
                      width={1600}
                      height={1200}
                      loading={index === 0 ? "eager" : "lazy"}
                      className="aspect-[4/3] w-full rounded-2xl border border-border object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {profile.photos.length > 1 && (
                <>
                  <CarouselPrevious className="left-3" />
                  <CarouselNext className="right-3" />
                </>
              )}
            </Carousel>
          </section>
        )}

        {/* Área 2: texto livre */}
        {profile.content && (
          <section aria-labelledby="sobre-texto" className="mt-12">
            <h2 id="sobre-texto" className="font-display text-xl font-bold">
              Um pouco sobre mim
            </h2>
            <div className="mt-4 whitespace-pre-line rounded-2xl border border-border bg-card p-6 leading-relaxed text-foreground/90">
              {profile.content}
            </div>
          </section>
        )}

        <div className="mt-12 rounded-2xl border border-border bg-secondary/40 p-6 text-center">
          <p className="font-display text-lg font-bold">Vamos encontrar seu imóvel?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Me chame no WhatsApp e eu apresento as melhores opções para o seu perfil.
          </p>
          <Button asChild variant="whatsapp" size="lg" className="mt-4">
            <a href={waUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> Chamar no WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
