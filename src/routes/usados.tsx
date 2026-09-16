import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { PropertyExplorer } from "@/components/site/PropertyExplorer";
import { propertiesQueryOptions } from "@/lib/properties.api";
import { siteConfig } from "@/config/site";

const title = `Imóveis usados em Salvador e região | ${siteConfig.brandName}`;
const description =
  "Casas e apartamentos usados com documentação verificada, aceitando financiamento bancário e FGTS. Fale direto comigo no WhatsApp.";

export const Route = createFileRoute("/usados")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://imovel-zap-link.lovable.app/usados" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://imovel-zap-link.lovable.app/usados" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(propertiesQueryOptions),
  component: UsadosPage,
});

function UsadosPage() {
  const { data: all } = useSuspenseQuery(propertiesQueryOptions);
  const properties = all.filter((p) => p.category === "usado");

  return (
    <>
      <PageHeader
        eyebrow="Seminovos e usados"
        title="Imóveis usados selecionados"
        description="Oportunidades de proprietários em bairros consolidados, com documentação analisada e possibilidade de financiamento."
      />
      <div className="container-page py-12">
        <PropertyExplorer properties={properties} />
      </div>
    </>
  );
}
