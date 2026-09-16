import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { PropertyExplorer } from "@/components/site/PropertyExplorer";
import { propertiesQueryOptions } from "@/lib/properties.api";
import { siteConfig } from "@/config/site";

const title = `Lançamentos MRV, Tenda e mais | ${siteConfig.brandName}`;
const description =
  "Apartamentos e casas em lançamento e na planta das principais construtoras de Salvador. Veja plantas, valores e fale no WhatsApp.";

export const Route = createFileRoute("/lancamentos")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://imovel-zap-link.lovable.app/lancamentos" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://imovel-zap-link.lovable.app/lancamentos" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(propertiesQueryOptions),
  component: LancamentosPage,
});

function LancamentosPage() {
  const { data: all } = useSuspenseQuery(propertiesQueryOptions);
  const properties = all.filter((p) => p.category === "lancamento");

  return (
    <>
      <PageHeader
        eyebrow="Na planta e em obras"
        title="Lançamentos das melhores construtoras"
        description="Empreendimentos MRV, Tenda, Direcional e Cury com entrada facilitada, subsídio do governo e uso do FGTS. Escolha o seu e me chame no WhatsApp."
      />
      <div className="container-page py-12">
        <PropertyExplorer properties={properties} />
      </div>
    </>
  );
}
