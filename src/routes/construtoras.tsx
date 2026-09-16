import { useMemo, useRef, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { LeadDialog } from "@/components/site/LeadDialog";
import { PropertyGrid } from "@/components/site/PropertyGrid";
import { developers } from "@/data/properties";
import { propertiesQueryOptions } from "@/lib/properties.api";
import { siteConfig } from "@/config/site";

const title = `Construtoras e incorporadoras parceiras | ${siteConfig.brandName}`;
const description =
  "MRV, Tenda, Direcional, Cury e incorporadoras baianas reunidas em um só lugar. Compare empreendimentos e fale comigo no WhatsApp.";

export const Route = createFileRoute("/construtoras")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://imovel-zap-link.lovable.app/construtoras" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://imovel-zap-link.lovable.app/construtoras" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(propertiesQueryOptions),
  component: ConstrutorasPage,
});

function ConstrutorasPage() {
  const { data: properties } = useSuspenseQuery(propertiesQueryOptions);
  const [selected, setSelected] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const activeDevelopers = useMemo(
    () =>
      developers
        .map((developer) => ({
          developer,
          count: properties.filter((p) => p.developerSlug === developer.slug).length,
        }))
        .filter((item) => item.count > 0),
    [properties],
  );

  const selectedDeveloper = activeDevelopers.find((i) => i.developer.slug === selected)?.developer;
  const selectedProperties = selected
    ? properties.filter((p) => p.developerSlug === selected)
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Tudo em um só lugar"
        title="Construtoras e incorporadoras"
        description="Trabalho com as principais construtoras do país e incorporadoras locais. Escolha a marca e veja os empreendimentos disponíveis."
      />

      <div className="container-page py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeDevelopers.map(({ developer, count }) => {
            const isActive = developer.slug === selected;
            return (
              <article
                key={developer.slug}
                className={`card-listing p-6 ${isActive ? "ring-2 ring-brand" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-bold">{developer.name}</h2>
                  <Badge variant="secondary">{developer.kind}</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{developer.description}</p>
                <p className="mt-4 text-sm font-semibold text-brand">
                  {count} {count === 1 ? "imóvel disponível" : "imóveis disponíveis"}
                </p>
                <Button
                  variant={isActive ? "outline" : "whatsapp"}
                  className="mt-4 w-full"
                  onClick={() => {
                    setSelected(isActive ? null : developer.slug);
                    if (!isActive) {
                      requestAnimationFrame(() =>
                        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
                      );
                    }
                  }}
                >
                  {isActive ? "Ocultar imóveis" : `Quero opções da ${developer.name}`}
                </Button>
              </article>
            );
          })}
        </div>

        {selectedDeveloper && (
          <div ref={resultsRef} className="mt-12 scroll-mt-24 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Imóveis em destaque
                </p>
                <h2 className="font-display text-2xl font-bold">{selectedDeveloper.name}</h2>
              </div>
              <LeadDialog
                defaultInterest={`Imóveis da ${selectedDeveloper.name}`}
                trigger={<Button variant="whatsapp">Falar sobre esses imóveis</Button>}
              />
            </div>
            <PropertyGrid properties={selectedProperties} />
          </div>
        )}

        <div className="mt-12 rounded-2xl bg-brand-soft p-8 text-center">

          <h2 className="font-display text-2xl font-bold">Não achou a construtora que procura?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Tenho acesso a tabelas de diversas construtoras e incorporadoras. Me diga o que você
            procura e eu busco a melhor opção.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LeadDialog
              defaultInterest="Busca personalizada de imóvel"
              trigger={
                <Button variant="whatsapp" size="lg">
                  Buscar meu imóvel
                </Button>
              }
            />
            <Button asChild variant="outline" size="lg">
              <Link to="/lancamentos">Ver lançamentos</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
