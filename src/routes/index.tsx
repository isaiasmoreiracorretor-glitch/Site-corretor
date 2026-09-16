import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Handshake, MessageCircle, Search, ShieldCheck } from "lucide-react";

import heroImg from "@/assets/hero-condominio.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FinancingSimulator } from "@/components/site/FinancingSimulator";
import { LeadDialog } from "@/components/site/LeadDialog";
import { PropertyGrid } from "@/components/site/PropertyGrid";
import { siteConfig } from "@/config/site";
import { developers } from "@/data/properties";
import { propertiesQueryOptions } from "@/lib/properties.api";

const title = `${siteConfig.brandName} — Imóveis em Salvador: lançamentos, prontos e usados`;
const description =
  "Lançamentos MRV e Tenda, imóveis prontos para morar e usados em Salvador e região. Veja fotos, valores e fale direto com o corretor no WhatsApp.";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://imovel-zap-link.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://imovel-zap-link.lovable.app/" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(propertiesQueryOptions),
  component: Index,
});

function Index() {
  const { data: properties } = useSuspenseQuery(propertiesQueryOptions);
  const destaques = properties.filter((p) => p.category !== "usado").slice(0, 6);
  const lancamentos = properties.filter((p) => p.category === "lancamento").slice(0, 3);

  return (
    <>
      <section className="relative isolate">
        <img
          src={heroImg}
          alt="Condomínios residenciais modernos em Salvador ao fim da tarde"
          width={1600}
          height={900}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="overlay-hero absolute inset-0 -z-10" />

        <div className="container-page flex min-h-[560px] flex-col justify-center py-20 text-primary-foreground">
          <Badge className="w-fit bg-accent text-[#fff2e8]">
            Lançamentos • Prontos para morar • Usados
          </Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Encontre seu imóvel em Salvador e região
          </h1>
          <p className="mt-5 max-w-2xl text-base text-primary-foreground/85 md:text-lg">
            Encontre seu imóvel, compare opções, simule seu financiamento e fale diretamente com
            Moreira pelo WhatsApp.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="whatsapp" size="xl">
              <Link to="/imoveis">
                <Search /> Encontrar meu imóvel
              </Link>
            </Button>
            <Button asChild variant="hero" size="xl">
              <Link to="/" hash="simulacao-financiamento">
                Simule seu Financiamento
              </Link>
            </Button>
          </div>

          <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-6 text-primary-foreground">
            <div>
              <dt className="text-2xl font-bold md:text-3xl">{properties.length}+</dt>
              <dd className="text-xs text-primary-foreground/75">imóveis no catálogo</dd>
            </div>
            <div>
              <dt className="text-2xl font-bold md:text-3xl">{developers.length}</dt>
              <dd className="text-xs text-primary-foreground/75">construtoras parceiras</dd>
            </div>
            <div>
              <dt className="text-2xl font-bold md:text-3xl">100%</dt>
              <dd className="text-xs text-primary-foreground/75">atendimento pelo WhatsApp</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Destaques</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Imóveis em destaque</h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/lancamentos">Ver todos</Link>
          </Button>
        </div>
        <div className="mt-8">
          <PropertyGrid properties={destaques} />
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="container-page">
          <h2 className="font-display text-3xl font-bold">Como funciona</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Step
              icon={<Search className="size-5" />}
              step="1"
              title="Escolha o imóvel"
              text="Navegue por lançamentos, prontos para morar ou usados e filtre por bairro, quartos e valor."
            />
            <Step
              icon={<MessageCircle className="size-5" />}
              step="2"
              title="Deixe seus dados"
              text="Preencha nome e telefone no imóvel que gostou. A conversa abre direto no meu WhatsApp."
            />
            <Step
              icon={<Handshake className="size-5" />}
              step="3"
              title="Feche com segurança"
              text="Simulo o financiamento, agendo a visita e acompanho toda a documentação até as chaves."
            />
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Na planta</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Últimos lançamentos</h2>
          </div>
          <Button asChild variant="soft">
            <Link to="/construtoras">Ver construtoras</Link>
          </Button>
        </div>
        <div className="mt-8">
          <PropertyGrid properties={lancamentos} />
        </div>
      </section>

      <section className="container-page pb-8">
        <FinancingSimulator />
      </section>
    </>
  );
}

function Step({
  icon,
  step,
  title: stepTitle,
  text,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-brand-foreground">
          {icon}
        </span>
        <span className="font-display text-3xl font-bold text-brand-soft">{step}</span>
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">{stepTitle}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
