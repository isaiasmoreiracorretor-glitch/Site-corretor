import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Bath,
  BedDouble,
  Building2,
  CalendarClock,
  Car,
  CheckCircle,
  Coins,
  Compass,
  CreditCard,
  FileCheck,
  Landmark,
  MapPin,
  Percent,
  Ruler,
  ShieldCheck,
  Sparkles,
  TreePine,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrokerAnalysisSection } from "@/components/site/BrokerAnalysisSection";
import { LeadDialog } from "@/components/site/LeadDialog";
import { PropertyGallery } from "@/components/site/PropertyGallery";
import { PropertyGrid } from "@/components/site/PropertyGrid";
import { PropertyMap } from "@/components/site/PropertyMap";
import { PropertyVideo } from "@/components/site/PropertyVideo";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { siteConfig } from "@/config/site";
import { categoryLabels, getDeveloper } from "@/data/properties";
import { formatArea, formatCurrency } from "@/lib/format";
import { insertLead } from "@/lib/leads.api";
import { propertiesQueryOptions } from "@/lib/properties.api";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const SITE_URL = "https://imovel-zap-link.lovable.app";

export const Route = createFileRoute("/imovel/$slug")({
  staticData: { sitemap: true },
  loader: async ({ context, params }) => {
    const all = await context.queryClient.ensureQueryData(propertiesQueryOptions);
    const property = all.find((p) => p.slug === params.slug);
    if (!property) throw notFound();
    return { property };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Imóvel não encontrado" }, { name: "robots", content: "noindex" }],
      };
    }
    const { property } = loaderData;
    const title = `${property.title} — ${formatCurrency(property.price)} | ${siteConfig.brandName}`;
    const description = `${categoryLabels[property.category]} em ${property.neighborhood}, ${property.city}. ${property.bedrooms} quartos, ${formatArea(property.area)}. Fale no WhatsApp com o corretor.`;
    const propertyUrl = `${SITE_URL}/imovel/${encodeURIComponent(property.slug)}`;
    const categoryUrl = `${SITE_URL}/imoveis`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: propertyUrl },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: propertyUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "@id": `${propertyUrl}#breadcrumb`,
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Início",
                item: `${SITE_URL}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: categoryLabels[property.category],
                item: categoryUrl,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: property.title,
                item: propertyUrl,
              },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: ImovelNotFound,
  component: ImovelPage,
});

function ImovelNotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Imóvel não encontrado</h1>
      <p className="mt-3 text-muted-foreground">
        Este imóvel pode ter sido vendido ou saído do catálogo.
      </p>
      <Button asChild variant="default" className="mt-6">
        <Link to="/lancamentos">Ver imóveis disponíveis</Link>
      </Button>
    </div>
  );
}

function ImovelPage() {
  const { slug } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const { data: allProperties } = useSuspenseQuery(propertiesQueryOptions);
  const property = allProperties.find((p) => p.slug === slug) ?? loaderData.property;
  const developer = getDeveloper(property.developerSlug);
  const developerDisplayName = developer?.name || property.developerName || "Construtora Parceira";

  const similar = allProperties
    .filter((p) => p.id !== property.id && p.category === property.category)
    .slice(0, 3);

  // LOGICA DO BOTAO DE WHATSAPP:
  // Se o Corretor Adm tiver configurado uma URL personalizada ou mensagem específica para esta página, usamos ela.
  // Caso contrário, montamos a mensagem padrão contendo a referência e o título do imóvel.
  const defaultWaText =
    property.customWhatsAppMessage?.trim() ||
    `Olá ${siteConfig.brokerName}! Tenho interesse no imóvel *${property.title}* (Ref. ${property.ref}) por ${formatCurrency(property.price)}. Vim pela página do site e gostaria de mais informações e simulação.`;

  const waHref = property.customWhatsAppUrl?.trim()
    ? property.customWhatsAppUrl.trim()
    : buildWhatsAppUrl(defaultWaText);

  // Lista de itens de lazer (se não houver itens específicos de lazer, extrai dos features ou usa padrões modernos)
  const leisureItems =
    property.leisure && property.leisure.length > 0
      ? property.leisure
      : property.features.filter((f) =>
          /piscina|academia|salão|gourmet|churrasqueira|playground|pet|quadra|bicicletário|rooftop|brinquedoteca/i.test(
            f,
          ),
        );

  const differentialItems = property.features.filter((f) => !leisureItems.includes(f));

  return (
    <article className="pb-16">
      {/* Breadcrumbs */}
      <div className="container-page pt-6">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
          <Link to="/" className="hover:text-brand">
            Início
          </Link>
          <span>/</span>
          <Link to="/imoveis" className="hover:text-brand">
            {categoryLabels[property.category]}
          </Link>
          <span>/</span>
          <span className="truncate max-w-[200px] sm:max-w-none text-foreground font-medium">
            {property.title}
          </span>
        </nav>
      </div>

      <div className="container-page grid gap-10 py-6 lg:grid-cols-[1.65fr_1fr]">
        <div className="space-y-10">
          {/* Gallery / Photos Component */}
          <PropertyGallery
            mainImage={property.image}
            galleryImages={property.galleryImages}
            title={property.title}
            category={property.category}
            minhaCasaMinhaVida={property.minhaCasaMinhaVida}
            acceptsFgts={property.acceptsFgts}
            highlight={property.highlight}
            neighborhood={property.neighborhood}
            city={property.city}
          />

          {/* Header Title & Basic Info */}
          <header className="border-b border-border/80 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand sm:text-sm">
                <Building2 className="size-4" /> {developerDisplayName} · Ref. {property.ref}
              </p>
              <Badge variant="outline" className="text-xs">
                {categoryLabels[property.category]}
              </Badge>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {property.title}
            </h1>

            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground sm:text-base">
              <MapPin className="size-4 text-brand shrink-0" />
              <span>
                {property.locationAddress
                  ? `${property.locationAddress} — ${property.neighborhood}, ${property.city}`
                  : `${property.neighborhood}, ${property.city}`}
              </span>
            </p>
          </header>

          {/* Key Specs Bar */}
          <section>
            <h2 className="sr-only">Especificações principais</h2>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Spec
                icon={<BedDouble className="size-5 text-brand" />}
                label="Quartos"
                value={`${property.bedrooms} ${property.bedrooms === 1 ? "quarto" : "quartos"}`}
              />
              <Spec
                icon={<Bath className="size-5 text-brand" />}
                label="Banheiros"
                value={`${property.bathrooms} ${property.bathrooms === 1 ? "banheiro" : "banheiros"}`}
              />
              <Spec
                icon={<Car className="size-5 text-brand" />}
                label="Vagas"
                value={
                  property.parking === 0
                    ? "Sem vaga"
                    : `${property.parking} ${property.parking === 1 ? "vaga" : "vagas"}`
                }
              />
              <Spec
                icon={<Ruler className="size-5 text-brand" />}
                label="Área privativa"
                value={formatArea(property.area)}
              />
            </dl>
          </section>

          {/* Commercial & Financial Conditions Banner */}
          <section className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 via-card to-emerald-500/5 p-6 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
              <Coins className="size-4" />
              <span>Condições Comerciais e Financiamento</span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {/* Entrada */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
                  <CreditCard className="size-4 text-brand" />
                  <span>Entrada Facilitada</span>
                </div>
                <p className="mt-1 text-base font-bold text-foreground">
                  {property.downPaymentInfo || "Entrada parcelada e facilitada pela construtora"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Possibilidade de parcelamento do sinal durante o período de obras.
                </p>
              </div>

              {/* Previsão de Entrega */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
                  <CalendarClock className="size-4 text-brand" />
                  <span>Previsão de Entrega</span>
                </div>
                <p className="mt-1 text-base font-bold text-foreground">
                  {property.deliveryDate ||
                    (property.category === "pronto" ? "Pronto para Morar" : "Consulte cronograma")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {property.category === "pronto"
                    ? "Chave na mão imediata após financiamento"
                    : "Obras com garantia e acompanhamento"}
                </p>
              </div>
            </div>

            {/* Condições comerciais adicionais */}
            {property.commercialConditions && (
              <div className="mt-4 rounded-xl border border-brand/20 bg-brand/10 p-4 text-sm text-foreground">
                <p className="font-semibold text-brand flex items-center gap-1.5">
                  <Sparkles className="size-4" /> Condições Especiais:
                </p>
                <p className="mt-1 leading-relaxed">{property.commercialConditions}</p>
              </div>
            )}

            {/* Badges de Programas (MCMV / FGTS / Financiamentos) */}
            <div className="mt-4 flex flex-wrap gap-2 pt-2">
              {property.minhaCasaMinhaVida && (
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <Percent className="size-3.5" />
                  <span>Programa Minha Casa Minha Vida (Subsídio de até R$ 55 mil)</span>
                </div>
              )}

              {property.acceptsFgts && (
                <div className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-800 dark:text-indigo-300">
                  <FileCheck className="size-3.5" />
                  <span>Aceita uso do saldo do FGTS na entrada</span>
                </div>
              )}

              {property.financing && property.financing.length > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground">
                  <Landmark className="size-3.5 text-brand" />
                  <span>Financiamento: {property.financing.join(", ")}</span>
                </div>
              )}
            </div>
          </section>

          {/* Description */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              Sobre o empreendimento
            </h2>
            <p className="leading-relaxed text-muted-foreground whitespace-pre-line text-sm sm:text-base">
              {property.description}
            </p>
          </section>

          {/* Lazer */}
          {leisureItems.length > 0 && (
            <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <TreePine className="size-5 text-brand" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Lazer e Convivência
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Espaços pensados para o bem-estar e diversão de toda a sua família.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {leisureItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-secondary/30 p-2.5 text-sm font-medium text-foreground"
                  >
                    <CheckCircle className="size-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Diferenciais */}
          {(differentialItems.length > 0 || property.features.length > 0) && (
            <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-amber-500" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Diferenciais do Imóvel
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Qualidade de acabamento, tecnologia e itens que valorizam o seu patrimônio.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {(differentialItems.length > 0 ? differentialItems : property.features).map(
                  (feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-secondary/30 p-2.5 text-sm font-medium text-foreground"
                    >
                      <CheckCircle className="size-4 text-brand shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ),
                )}
              </ul>
            </section>
          )}

          {/* Vídeo do YouTube (oculto quando não há vídeo) */}
          <PropertyVideo url={property.youtubeUrl} title={property.title} />

          {/* Minha Análise como Corretor */}
          <BrokerAnalysisSection
            analysis={property.brokerAnalysis}
            propertyTitle={property.title}
            propertyRef={property.ref}
            customWhatsAppUrl={property.customWhatsAppUrl}
            property={{
              id: property.id,
              ref: property.ref,
              title: property.title,
              slug: property.slug,
              developer: developerDisplayName,
              neighborhood: property.neighborhood,
              city: property.city,
            }}
          />

          {/* Localização no Mapa */}
          <PropertyMap
            neighborhood={property.neighborhood}
            city={property.city}
            locationAddress={property.locationAddress}
            mapQuery={property.mapQuery}
            title={property.title}
          />
        </div>

        {/* Sticky Aside CTA Card */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                {property.category === "lancamento" || property.category === "na-planta"
                  ? "A partir de"
                  : "Valor de Venda"}
              </p>
              {property.highlight && (
                <Badge className="bg-amber-500 text-white text-[11px] font-semibold">
                  {property.highlight}
                </Badge>
              )}
            </div>

            <p className="mt-2 text-3xl font-bold text-brand tracking-tight">
              {formatCurrency(property.price)}
            </p>

            {property.downPaymentInfo && (
              <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                💰 {property.downPaymentInfo}
              </p>
            )}

            {property.deliveryDate && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5 text-brand" /> Previsão: {property.deliveryDate}
              </p>
            )}

            <div className="mt-6 space-y-3">
              <LeadDialog
                property={{
                  id: property.id,
                  ref: property.ref,
                  title: property.title,
                  slug: property.slug,
                  developer: developerDisplayName,
                  neighborhood: property.neighborhood,
                  city: property.city,
                }}
                defaultInterest={categoryLabels[property.category]}
                trigger={
                  <Button variant="whatsapp" size="xl" className="w-full shadow-md gap-2 font-bold">
                    <WhatsAppIcon className="size-5" />
                    <span>Tenho interesse / Simular</span>
                  </Button>
                }
              />

              {/* Botão de direcionamento direto para WhatsApp com link configurado pelo corretor */}
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full gap-2 text-xs font-semibold"
              >
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    insertLead({
                      name: "",
                      message: `Clique direto no WhatsApp para o imóvel ${property.title} (Ref. ${property.ref})`,
                      source: "Botão WhatsApp Direto",
                      property: {
                        id: property.id,
                        ref: property.ref,
                        title: property.title,
                        slug: property.slug,
                        developer: developerDisplayName,
                        neighborhood: property.neighborhood,
                        city: property.city,
                      },
                    }).catch((err) => console.warn("Erro ao registrar lead:", err));
                  }}
                >
                  <WhatsAppIcon className="size-4 text-whatsapp" />
                  <span>Falar no WhatsApp agora</span>
                </a>
              </Button>
            </div>

            <div className="mt-5 space-y-2 border-t border-border/80 pt-4 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <ShieldCheck className="size-4 text-brand" />
                <span>Atendimento com {siteConfig.brokerName}</span>
              </p>
              <p>• CRECI-BA 32.373 — Atendimento regulamentado e seguro.</p>
              <p>• Análise de crédito Caixa e simulação sem custo.</p>
              <p>• Suporte do primeiro contato até a entrega das chaves.</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Similar Properties */}
      {similar.length > 0 && (
        <section className="container-page mt-16 border-t border-border/80 pt-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Imóveis similares</h2>
              <p className="text-sm text-muted-foreground">
                Outras opções que podem combinar com o que você procura
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/imoveis">Ver catálogo completo</Link>
            </Button>
          </div>
          <div className="mt-6">
            <PropertyGrid properties={similar} />
          </div>
        </section>
      )}
    </article>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3.5 transition-colors hover:bg-secondary/50">
      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} <span>{label}</span>
      </dt>
      <dd className="mt-1 text-base font-bold text-foreground">{value}</dd>
    </div>
  );
}
