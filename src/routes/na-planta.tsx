import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { PropertyExplorer } from "@/components/site/PropertyExplorer";
import { propertiesQueryOptions } from "@/lib/properties.api";
import { siteConfig } from "@/config/site";

const title = `Imóveis na planta em Salvador | ${siteConfig.brandName}`;
const description =
  "Apartamentos e casas na planta das principais construtoras de Salvador. Pague durante a obra, use o FGTS e fale no WhatsApp.";

export const Route = createFileRoute("/na-planta")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://imovel-zap-link.lovable.app/na-planta" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://imovel-zap-link.lovable.app/na-planta" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(propertiesQueryOptions),
  component: NaPlantaPage,
});

function NaPlantaPage() {
  const { data: all } = useSuspenseQuery(propertiesQueryOptions);
  const properties = all.filter((p) => p.category === "na-planta");

  return (
    <>
      <PageHeader
        eyebrow="Compre na planta"
        title="Imóveis na planta"
        description="Empreendimentos em fase de lançamento e obras: você compra com preço de tabela, parcela a entrada durante a obra e acompanha cada etapa até a entrega das chaves."
      />
      <div className="container-page py-12">
        <PropertyExplorer properties={properties} />
      </div>
    </>
  );
}
