import { createFileRoute } from "@tanstack/react-router";
import {
  BadgePercent,
  Banknote,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Landmark,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LeadDialog } from "@/components/site/LeadDialog";
import { PageHeader } from "@/components/site/PageHeader";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { siteConfig } from "@/config/site";

const title = `Minha Casa Minha Vida em Salvador | ${siteConfig.brandName}`;
const description =
  "Entenda como funciona o financiamento Minha Casa Minha Vida, quem tem direito, subsídios e como simular. Atendimento pelo WhatsApp.";

export const Route = createFileRoute("/minha-casa-minha-vida")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      {
        property: "og:url",
        content: "https://imovel-zap-link.lovable.app/minha-casa-minha-vida",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://imovel-zap-link.lovable.app/minha-casa-minha-vida",
      },
    ],
  }),
  component: MinhaCasaMinhaVidaPage,
});

function MinhaCasaMinhaVidaPage() {
  return (
    <>
      <PageHeader
        eyebrow="Financiamento habitacional"
        title="Minha Casa Minha Vida"
        description="Saiba como usar o programa para comprar seu imóvel com condições especiais, subsídios e entrada facilitada."
      />

      <section className="container-page py-12" aria-labelledby="guia-mcmv">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">Guia prático</p>
            <h2 id="guia-mcmv" className="mt-2 font-display text-2xl font-bold md:text-3xl">
              Entenda o Minha Casa Minha Vida sem complicação
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              O programa usa recursos do FGTS para oferecer taxas e descontos conforme a renda da
              família e a localização do imóvel. A elegibilidade e as condições finais sempre
              dependem da análise da CAIXA, do imóvel escolhido e das regras vigentes na
              contratação.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem icon={<Users />} title="Quem pode participar">
              Famílias que moram em área urbana e têm renda familiar mensal bruta de até R$ 13 mil
              nas modalidades atualmente divulgadas pela CAIXA. É preciso também atender às regras
              do programa, não ter impedimentos cadastrais e passar pela análise de crédito.
            </InfoItem>
            <InfoItem icon={<Banknote />} title="Faixas de renda">
              A renda bruta familiar define a faixa, a taxa de juros e a possibilidade de desconto.
              A CAIXA informa operações de habitação popular até R$ 9.600 e a modalidade Classe
              Média até R$ 13 mil; os limites e enquadramentos podem ser atualizados pelo programa.
            </InfoItem>
            <InfoItem icon={<BadgePercent />} title="Subsídios">
              O subsídio é um desconto que reduz o valor a financiar ou a entrada e não precisa ser
              devolvido quando concedido dentro das regras. O valor não é igual para todos: depende
              principalmente da renda, da cidade, do imóvel e da disponibilidade de recursos.
            </InfoItem>
            <InfoItem icon={<Landmark />} title="FGTS">
              O saldo do FGTS pode ajudar na entrada, na redução do saldo devedor ou no pagamento de
              parte das prestações, desde que o trabalhador e o imóvel cumpram as regras de uso do
              fundo. A CAIXA confirma a possibilidade durante a simulação e a análise.
            </InfoItem>
            <InfoItem icon={<Banknote />} title="Entrada">
              Não existe uma entrada única para todo mundo. Ela resulta do preço do imóvel menos o
              financiamento, o subsídio e, quando permitido, o FGTS. Custos como avaliação,
              cartório, impostos e seguros também devem entrar no planejamento financeiro.
            </InfoItem>
            <InfoItem icon={<Building2 />} title="Financiamento">
              É possível financiar imóvel residencial novo ou usado, construir ou comprar terreno e
              construir. As taxas são diferenciadas por renda e localidade; na página consultada da
              CAIXA, a taxa nominal varia de 4% a 10% ao ano. O prazo e a parcela dependem da
              capacidade de pagamento.
            </InfoItem>
            <InfoItem icon={<Landmark />} title="Papel da CAIXA">
              A CAIXA recebe a proposta, confere o comprador e avalia o imóvel. A contratação pode
              começar por simulação, construtora, Correspondente CAIXA Aqui ou agência. O banco é
              quem define o valor aprovado e as condições do contrato.
            </InfoItem>
            <InfoItem icon={<FileText />} title="Documentação">
              Separe documento de identificação, CPF, comprovantes de renda e residência, estado
              civil e, se for usar, comprovante do FGTS. Também serão analisados os documentos do
              imóvel e do vendedor; a lista pode mudar conforme o perfil e o tipo de operação.
            </InfoItem>
            <InfoItem icon={<ClipboardCheck />} title="Como funciona a aprovação">
              Primeiro, fazemos a simulação e reunimos os documentos. Depois, a CAIXA analisa renda,
              cadastro, capacidade de pagamento e a documentação do imóvel. Com tudo validado e
              aprovado, comprador e vendedor assinam o contrato; a liberação segue as etapas
              previstas pela instituição.
            </InfoItem>
          </div>

          <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" />
            Informações gerais consultadas nas páginas oficiais da CAIXA sobre Minha Casa Minha
            Vida. Limites, taxas, subsídios, documentos e condições podem mudar; a simulação e a
            análise oficial são as que definem o enquadramento de cada família.
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-10">
            <div className="mt-8 rounded-xl bg-secondary/50 p-6">
              <h3 className="font-display text-lg font-bold">Quero saber se posso comprar!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Deixe seus dados e fale direto comigo pelo WhatsApp. Posso explicar as regras,
                verificar se você se enquadra e fazer uma simulação personalizada sem custo.
              </p>
              <LeadDialog
                defaultInterest="Página Minha Casa Minha Vida"
                trigger={
                  <Button variant="whatsapp" size="xl" className="mt-5">
                    <WhatsAppIcon /> Falar no WhatsApp
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoItem({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
          {icon}
        </span>
        <h3 className="font-display text-base font-bold">{title}</h3>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </article>
  );
}
