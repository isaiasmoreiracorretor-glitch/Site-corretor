import { Link } from "@tanstack/react-router";
import { Building2, Instagram, Mail, MapPin, Phone } from "lucide-react";

import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { openCookiePreferences } from "@/lib/cookie-consent";

export function Footer() {
  return (
    <footer id="site-footer" className="mt-20 border-t border-border bg-secondary/40">
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand text-brand-foreground">
              <Building2 className="size-5" />
            </span>
            <span className="font-display text-base font-bold">{siteConfig.brandName}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            {siteConfig.tagline}. Atendimento personalizado do primeiro contato até a entrega das
            chaves.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{siteConfig.creci}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Navegação</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/imoveis" className="hover:text-brand">
                Todos os imóveis
              </Link>
            </li>
            <li>
              <Link to="/lancamentos" className="hover:text-brand">
                Lançamentos
              </Link>
            </li>
            <li>
              <Link to="/na-planta" className="hover:text-brand">
                Na planta
              </Link>
            </li>
            <li>
              <Link to="/prontos" className="hover:text-brand">
                Prontos para morar
              </Link>
            </li>
            <li>
              <Link to="/usados" className="hover:text-brand">
                Imóveis usados
              </Link>
            </li>
            <li>
              <Link to="/construtoras" className="hover:text-brand">
                Construtoras e incorporadoras
              </Link>
            </li>
            <li>
              <Link to="/minha-casa-minha-vida" className="hover:text-brand">
                Minha Casa Minha Vida
              </Link>
            </li>
            <li>
              <Link to="/sobre-moreira" className="hover:text-brand">
                Sobre Moreira
              </Link>
            </li>
            <li>
              <Link to="/contato" className="hover:text-brand">
                Contato
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Fale comigo</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <a
                href={buildWhatsAppUrl("Olá! Vim pelo site e quero informações sobre imóveis.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-brand"
              >
                <Phone className="size-4" /> {siteConfig.whatsappDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4" /> {siteConfig.email}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4" /> {siteConfig.city}
            </li>
            <li>
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-brand"
              >
                <Instagram className="size-4" /> Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">
        <Link to="/admin" className="hover:text-brand">
          Área do corretor
        </Link>
        © {new Date().getFullYear()} {siteConfig.brandName}. Todos os direitos reservados.
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        <span>Desenvolvido por</span>
        <a
          href="https://wa.me/5546991327984?text=Ol%C3%A1!%20Gostaria%20de%20falar%20sobre%20o%20desenvolvimento%20de%20uma%20aplica%C3%A7%C3%A3o."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar com a Lummio pelo WhatsApp"
          className="block w-fit overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-transform hover:scale-105"
        >
          <img src="/Logo-Lumio-serpente.webp" alt="Lummio" className="size-20 object-cover" />
        </a>
        <span aria-hidden="true">·</span>
        <Link to="/privacidade" className="hover:text-brand">
          Política de Privacidade
        </Link>
        <span aria-hidden="true">·</span>
        <button type="button" onClick={openCookiePreferences} className="hover:text-brand">
          Preferências de cookies
        </button>
      </div>
    </footer>
  );
}
