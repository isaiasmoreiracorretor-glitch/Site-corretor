import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { PropertyExplorer } from "@/components/site/PropertyExplorer";
import { propertiesQueryOptions } from "@/lib/properties.api";
import { siteConfig } from "@/config/site";

const title = `Todos os imóveis em Salvador | ${siteConfig.brandName}`;
const description =
  "Lançamentos, imóveis na planta, prontos para morar e usados em Salvador e região metropolitana. Veja fotos, valores e fale no WhatsApp.";

export const Route = createFileRoute("/imoveis")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://imovel-zap-link.lovable.app/imoveis" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://imovel-zap-link.lovable.app/imoveis" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(propertiesQueryOptions),
  component: ImoveisPage,
});

function ImoveisPage() {
  const { data: properties } = useSuspenseQuery(propertiesQueryOptions);

  return (
    <>
      <PageHeader
        eyebrow="Catálogo completo"
        title="Todos os imóveis disponíveis"
        description="Lançamentos, na planta, prontos para morar e usados. Use os filtros para encontrar o imóvel ideal e fale comigo pelo WhatsApp."
      />
      <div className="container-page py-12">
        <PropertyExplorer properties={properties} />
      </div>
    </>
  );
}
