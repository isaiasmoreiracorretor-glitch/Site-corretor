import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_CATEGORIES,
  OPEN_PREFERENCES_EVENT,
  acceptAll,
  getStoredConsent,
  rejectNonEssential,
  saveConsent,
  type ConsentCategories,
} from "@/lib/cookie-consent";

const categoryInfo: Array<{
  key: keyof ConsentCategories;
  title: string;
  description: string;
  locked?: boolean;
}> = [
  {
    key: "necessary",
    title: "Necessários",
    description:
      "Essenciais para o site funcionar: autenticação da área do corretor, segurança e o registro desta escolha. Não podem ser desativados.",
    locked: true,
  },
  {
    key: "functional",
    title: "Funcionais",
    description: "Guardam preferências de navegação, como filtros e buscas recentes de imóveis.",
  },
  {
    key: "analytics",
    title: "Análise",
    description: "Métricas anônimas de uso (páginas mais visitadas) que ajudam a melhorar o site.",
  },
  {
    key: "marketing",
    title: "Marketing",
    description: "Permitem medir campanhas e exibir anúncios relevantes em outras plataformas.",
  },
];

export function CookieConsent() {
  // null = ainda não sabemos (SSR); false = sem consentimento salvo; true = já decidiu
  const [decided, setDecided] = useState<boolean | null>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [draft, setDraft] = useState<ConsentCategories>(DEFAULT_CATEGORIES);

  useEffect(() => {
    setDecided(getStoredConsent() !== null);

    const openPreferences = () => {
      const stored = getStoredConsent();
      setDraft(stored?.categories ?? DEFAULT_CATEGORIES);
      setPreferencesOpen(true);
    };
    window.addEventListener(OPEN_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, openPreferences);
  }, []);

  function handleAcceptAll() {
    acceptAll();
    setDecided(true);
    setPreferencesOpen(false);
  }

  function handleReject() {
    rejectNonEssential();
    setDecided(true);
    setPreferencesOpen(false);
  }

  function handleSavePreferences() {
    saveConsent(draft);
    setDecided(true);
    setPreferencesOpen(false);
  }

  function openPreferencesFromBanner() {
    setDraft(getStoredConsent()?.categories ?? DEFAULT_CATEGORIES);
    setPreferencesOpen(true);
  }

  return (
    <>
      {decided === false && (
        <div
          role="region"
          aria-label="Aviso de cookies"
          className="fixed inset-x-0 bottom-0 z-[90] border-t border-border bg-background/95 shadow-lg backdrop-blur"
        >
          <div className="container-page flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <Cookie className="size-5" />
              </span>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Usamos cookies para melhorar sua experiência e, com sua permissão, medir o uso do
                site e campanhas. Você pode aceitar, rejeitar ou personalizar conforme a{" "}
                <Link
                  to="/privacidade"
                  className="font-medium text-brand underline-offset-2 hover:underline"
                >
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" onClick={openPreferencesFromBanner}>
                <Settings2 /> Personalizar
              </Button>
              <Button variant="outline" size="sm" onClick={handleReject}>
                Rejeitar
              </Button>
              <Button size="sm" onClick={handleAcceptAll}>
                Aceitar todos
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Preferências de cookies</DialogTitle>
            <DialogDescription>
              Escolha quais tipos de cookies você autoriza. Sua decisão pode ser alterada a qualquer
              momento no rodapé do site.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {categoryInfo.map((category) => (
              <div
                key={category.key}
                className="flex items-start justify-between gap-4 rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{category.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{category.description}</p>
                </div>
                <Switch
                  aria-label={`Cookies de ${category.title}`}
                  checked={category.key === "necessary" ? true : draft[category.key]}
                  disabled={category.locked}
                  onCheckedChange={(checked) =>
                    setDraft((prev) => ({ ...prev, [category.key]: checked }))
                  }
                />
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" onClick={handleReject}>
              Rejeitar todos
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleSavePreferences}>
                Salvar preferências
              </Button>
              <Button onClick={handleAcceptAll}>Aceitar todos</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
