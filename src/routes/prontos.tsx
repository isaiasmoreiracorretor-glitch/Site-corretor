import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { PropertyExplorer } from "@/components/site/PropertyExplorer";
import { propertiesQueryOptions } from "@/lib/properties.api";
import { siteConfig } from "@/config/site";

const title = `Imóveis prontos para morar em Salvador | ${siteConfig.brandName}`;
const description =
  "Apartamentos, casas e coberturas novas com entrega imediata. Chave na mão, financiamento aprovado e atendimento pelo WhatsApp.";

export const Route = createFileRoute("/prontos")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://imovel-zap-link.lovable.app/prontos" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://imovel-zap-link.lovable.app/prontos" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(propertiesQueryOptions),
  component: ProntosPage,
});

function ProntosPage() {
  const { data: all } = useSuspenseQuery(propertiesQueryOptions);
  const properties = all.filter((p) => p.category === "pronto");

  return (
    <>
      <PageHeader
        eyebrow="Chave na mão"
        title="Novos e prontos para morar"
        description="Imóveis novos já entregues: você visita, aprova o financiamento e muda logo em seguida. Sem esperar obra."
      />
      <div className="container-page py-12">
        <PropertyExplorer properties={properties} />
      </div>
    </>
  );
}
