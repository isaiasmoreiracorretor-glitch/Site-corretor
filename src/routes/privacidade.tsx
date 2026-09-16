import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { openCookiePreferences } from "@/lib/cookie-consent";

const title = `Política de Privacidade e Cookies | ${siteConfig.brandName}`;
const description =
  "Saiba como tratamos seus dados pessoais e cookies neste site, em conformidade com a LGPD (Lei nº 13.709/2018).";

export const Route = createFileRoute("/privacidade")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://imovel-zap-link.lovable.app/privacidade" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://imovel-zap-link.lovable.app/privacidade" }],
  }),
  component: PrivacidadePage,
});

function Section({ title: heading, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-xl font-bold text-foreground">{heading}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function PrivacidadePage() {
  return (
    <div className="container-page py-10">
      <PageHeader
        title="Política de Privacidade e Cookies"
        description={`Última atualização: agosto de 2026 — ${siteConfig.brandName} (${siteConfig.creci})`}
      />

      <div className="mx-auto mt-8 max-w-3xl space-y-8">
        <Section title="1. Quem é o controlador dos dados">
          <p>
            O responsável pelo tratamento dos dados pessoais coletados neste site é{" "}
            <strong className="text-foreground">
              {siteConfig.brokerName} — {siteConfig.creci}
            </strong>
            , corretor de imóveis em {siteConfig.city}. Contato do encarregado:{" "}
            <strong className="text-foreground">{siteConfig.email}</strong>.
          </p>
        </Section>

        <Section title="2. Quais dados coletamos">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">Dados fornecidos por você:</strong> nome e
              telefone/WhatsApp informados nos formulários de interesse em imóveis.
            </li>
            <li>
              <strong className="text-foreground">Dados de navegação:</strong> páginas visitadas e
              preferências de uso, somente mediante seu consentimento (cookies de análise).
            </li>
            <li>
              <strong className="text-foreground">Dados técnicos essenciais:</strong> registros de
              segurança e sessão da área administrativa.
            </li>
          </ul>
        </Section>

        <Section title="3. Finalidade e base legal">
          <p>
            Os dados de contato são usados exclusivamente para atender sua solicitação e conversar
            com você sobre o imóvel de interesse, por meio do WhatsApp ou telefone (base legal:
            execução de procedimentos preliminares a pedido do titular — art. 7º, V, da LGPD).
          </p>
          <p>
            Cookies de análise, funcionais e de marketing só são utilizados após o seu{" "}
            <strong className="text-foreground">consentimento</strong> (art. 7º, I, da LGPD), que
            pode ser retirado a qualquer momento.
          </p>
        </Section>

        <Section title="4. Cookies utilizados">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">Necessários:</strong> autenticação da área do
              corretor e registro da sua escolha de cookies. Não exigem consentimento.
            </li>
            <li>
              <strong className="text-foreground">Funcionais:</strong> lembram preferências de
              navegação, como filtros de busca.
            </li>
            <li>
              <strong className="text-foreground">Análise:</strong> estatísticas anônimas de
              visitação para melhorar o site.
            </li>
            <li>
              <strong className="text-foreground">Marketing:</strong> medição de campanhas e
              anúncios em outras plataformas.
            </li>
          </ul>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={openCookiePreferences}>
              Alterar minhas preferências de cookies
            </Button>
          </div>
        </Section>

        <Section title="5. Compartilhamento">
          <p>
            Ao clicar em “Falar no WhatsApp”, você é direcionado ao aplicativo do WhatsApp (Meta
            Platforms), que possui política de privacidade própria. Não vendemos nem compartilhamos
            seus dados com terceiros para outros fins.
          </p>
        </Section>

        <Section title="6. Seus direitos (art. 18 da LGPD)">
          <p>
            Você pode solicitar, a qualquer momento, a confirmação, o acesso, a correção, a
            anonimização, a portabilidade ou a eliminação dos seus dados pessoais, bem como revogar
            o consentimento. Basta escrever para{" "}
            <strong className="text-foreground">{siteConfig.email}</strong>.
          </p>
        </Section>

        <Section title="7. Segurança e retenção">
          <p>
            Adotamos medidas técnicas e administrativas para proteger seus dados. Os dados de
            contato são mantidos apenas pelo período necessário ao atendimento e às obrigações
            legais.
          </p>
        </Section>
      </div>
    </div>
  );
}
