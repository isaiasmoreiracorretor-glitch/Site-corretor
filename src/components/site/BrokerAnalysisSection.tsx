import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { siteConfig } from "@/config/site";
import type { BrokerAnalysis } from "@/data/properties";
import { insertLead, type LeadPropertyContext } from "@/lib/leads.api";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  AlertTriangle,
  Award,
  BadgeCheck,
  CheckCircle2,
  Compass,
  DollarSign,
  Landmark,
  Sparkles,
  Target,
  ThumbsUp,
  UserCheck,
} from "lucide-react";

interface BrokerAnalysisSectionProps {
  analysis?: BrokerAnalysis | undefined;
  propertyTitle: string;
  propertyRef: string;
  customWhatsAppUrl?: string | undefined;
  property?: LeadPropertyContext | undefined;
}

export function BrokerAnalysisSection({
  analysis,
  propertyTitle,
  propertyRef,
  customWhatsAppUrl,
  property,
}: BrokerAnalysisSectionProps) {
  // If no analysis is provided at all, show a default welcoming analysis note or fallback
  const checkedItems =
    analysis?.checkedItems && analysis.checkedItems.length > 0
      ? analysis.checkedItems
      : [
          "Documentação 100% regularizada e pronta para repasse",
          "Planta inteligente com excelente aproveitamento de espaço",
          "Localização com alta facilidade de mobilidade e serviços",
          "Relação custo/m² muito vantajosa para a região",
        ];

  const waText = `Olá ${siteConfig.brokerName}! Vi a sua análise do imóvel *${propertyTitle}* (Ref. ${propertyRef}) e gostaria de tirar algumas dúvidas com você.`;
  const whatsappHref = customWhatsAppUrl?.trim() ? customWhatsAppUrl : buildWhatsAppUrl(waText);

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-brand/20 bg-gradient-to-b from-card via-card to-brand/5 p-6 shadow-sm sm:p-8">
      {/* Header with Broker badge */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative flex size-12 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-md">
            <Award className="size-6" />
            <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-card">
              ✓
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                Consultoria Exclusiva
              </span>
              <Badge
                variant="outline"
                className="border-brand/30 bg-brand/10 text-xs font-semibold text-brand"
              >
                CRECI-BA 32.373
              </Badge>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Minha análise como corretor
            </h2>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-sm font-semibold text-foreground">{siteConfig.brokerName}</p>
          <p className="text-xs text-muted-foreground">
            Especialista no mercado imobiliário da Bahia
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Como especialista na região, preparei uma avaliação técnica, transparente e sincera sobre os
        pontos fortes, oportunidades e detalhes que você precisa saber antes de tomar sua decisão.
      </p>

      {/* Checklist / Itens ticados pelo corretor */}
      {checkedItems.length > 0 && (
        <div className="mt-6 rounded-xl border border-brand/15 bg-brand/5 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
            <BadgeCheck className="size-4 text-brand" />
            <span>Itens verificados e destacados pelo corretor</span>
          </div>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {checkedItems.map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tópicos da Análise */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {/* 1. Para quem o imóvel é indicado? */}
        <AnalysisCard
          icon={<Target className="size-5 text-brand" />}
          title="Para quem o imóvel é indicado?"
          content={
            analysis?.recommendedFor ||
            "Famílias e casais que buscam segurança de condomínio fechado com infraestrutura de lazer, ou compradores que desejam sair do aluguel aproveitando as melhores condições de financiamento."
          }
        />

        {/* 2. Perfil ideal do comprador */}
        <AnalysisCard
          icon={<UserCheck className="size-5 text-indigo-600 dark:text-indigo-400" />}
          title="Perfil ideal do comprador"
          content={
            analysis?.idealBuyerProfile ||
            "Pessoas que valorizam previsibilidade nas parcelas, facilidade de pagamento durante as obras ou mudança rápida com documentação descomplicada."
          }
        />

        {/* 3. Pontos positivos */}
        <AnalysisCard
          icon={<ThumbsUp className="size-5 text-emerald-600 dark:text-emerald-400" />}
          title="Pontos positivos"
          content={
            analysis?.positivePoints ||
            "Excelente custo por m², entrega no prazo com solidez de construtora reconhecida, condomínio moderno com lazer completo e custos mensais otimizados."
          }
          className="border-emerald-500/20 bg-emerald-500/5"
        />

        {/* 4. Pontos de atenção */}
        <AnalysisCard
          icon={<AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />}
          title="Pontos de atenção"
          content={
            analysis?.attentionPoints ||
            "Importante verificar a posição do sol (nascente/poente) na escolha da unidade e planejar a reserva para despesas de escritura e ITIV conforme a modalidade."
          }
          className="border-amber-500/20 bg-amber-500/5"
        />

        {/* 5. Localização */}
        <AnalysisCard
          icon={<Compass className="size-5 text-sky-600 dark:text-sky-400" />}
          title="Localização & Entorno"
          content={
            analysis?.locationEvaluation ||
            "Região com forte vetor de valorização, cercada por supermercados, farmácias, transporte público e acessos rápidos para as principais avenidas da cidade."
          }
        />

        {/* 6. Relação custo-benefício */}
        <AnalysisCard
          icon={<DollarSign className="size-5 text-emerald-600 dark:text-emerald-400" />}
          title="Relação custo-benefício"
          content={
            analysis?.costBenefit ||
            "Altíssimo retorno sobre o investimento, com valores de metro quadrado competitivos e alto potencial de valorização após a entrega das chaves."
          }
        />

        {/* 7. Possibilidade de financiamento */}
        <div className="md:col-span-2">
          <AnalysisCard
            icon={<Landmark className="size-5 text-brand" />}
            title="Possibilidade de financiamento & FGTS"
            content={
              analysis?.financingPotential ||
              "Enquadramento facilitado pela Caixa Econômica Federal e bancos parceiros. Possibilidade de compor renda com até 3 pessoas, utilizar saldo integral do FGTS e obter subsídios governamentais quando aplicável."
            }
            className="border-brand/20 bg-brand/5"
          />
        </div>
      </div>

      {/* Extra Broker Notes if any */}
      {analysis?.brokerNotes && (
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-4 text-brand" />
            <span>Nota pessoal do corretor</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground italic">
            &ldquo;{analysis.brokerNotes}&rdquo;
          </p>
        </div>
      )}

      {/* CTA directly with Broker */}
      <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-brand/20 bg-brand/10 p-5 sm:flex-row sm:p-6">
        <div>
          <h4 className="font-display font-bold text-foreground">
            Quer uma consultoria personalizada para este imóvel?
          </h4>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Fale direto comigo no WhatsApp para simular valores de parcelas e checar disponibilidade
            de unidades.
          </p>
        </div>
        <Button
          asChild
          variant="whatsapp"
          size="lg"
          className="w-full sm:w-auto shrink-0 shadow-md"
        >
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              insertLead({
                name: "",
                message: `Interesse pela Análise do Corretor — ${propertyTitle} (Ref. ${propertyRef})`,
                source: "Análise do Corretor",
                property: property ?? {
                  id: "",
                  ref: propertyRef,
                  title: propertyTitle,
                  slug: "",
                },
              }).catch((error) => {
                console.warn("[BrokerAnalysisSection] Erro ao registrar lead:", error);
              });
            }}
          >
            <WhatsAppIcon className="size-4" />
            <span>Conversar sobre este imóvel</span>
          </a>
        </Button>
      </div>
    </section>
  );
}

function AnalysisCard({
  icon,
  title,
  content,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  className?: string | undefined;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-background shadow-xs">
          {icon}
        </div>
        <h3 className="font-display text-sm font-bold text-foreground sm:text-base">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content}</p>
    </div>
  );
}
