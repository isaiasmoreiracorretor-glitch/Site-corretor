import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, ChevronDown, Menu, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/lancamentos", label: "Lançamentos" },
  { to: "/na-planta", label: "Na planta" },
  { to: "/prontos", label: "Prontos para morar" },
  { to: "/usados", label: "Usados" },
  { to: "/construtoras", label: "Construtoras" },
  { to: "/minha-casa-minha-vida", label: "Minha Casa Minha Vida" },
  { to: "/sobre-moreira", label: "Sobre Moreira" },
  { to: "/contato", label: "Contato" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const waUrl = buildWhatsAppUrl(
    `Olá ${siteConfig.brokerName}! Vim pelo site e quero informações sobre os imóveis.`,
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-1 md:gap-4">
        <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Moreira Imóveis" className="h-9 w-auto object-contain" />
          <span className="leading-tight">
            <span className="block font-display text-base font-bold">{siteConfig.brandName}</span>
            <span className="block text-[11px] text-muted-foreground">{siteConfig.creci}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.slice(0, 1).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-brand font-semibold" }}
              activeOptions={{ exact: item.to === "/" }}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-brand">
              Imóveis
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48">
              {navItems.slice(1, 5).map((item) => (
                <DropdownMenuItem key={item.to} asChild>
                  <Link
                    to={item.to}
                    activeProps={{ className: "bg-brand-soft text-brand font-semibold" }}
                    className="w-full"
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {navItems.slice(5).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-brand font-semibold" }}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-8 flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    activeProps={{ className: "bg-brand-soft text-brand font-semibold" }}
                    activeOptions={{ exact: item.to === "/" }}
                    className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Button asChild variant="whatsapp" className="mt-6 w-full">
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  <Phone /> Falar no WhatsApp
                </a>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
