import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink, MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";

interface PropertyMapProps {
  neighborhood: string;
  city: string;
  locationAddress?: string | undefined;
  mapQuery?: string | undefined;
  title: string;
}

export function PropertyMap({
  neighborhood,
  city,
  locationAddress,
  mapQuery,
  title,
}: PropertyMapProps) {
  const [copied, setCopied] = useState(false);

  // LÓGICA DE LOCALIZAÇÃO DO MAPA:
  // 1. Se o administrador informar um endereço específico no mapa (mapQuery), usamos como termo de busca prioritário.
  // 2. Se houver endereço completo (locationAddress), usamos ele concatenado à cidade.
  // 3. Caso contrário, usamos o bairro + cidade + Salvador/BA para garantir o posicionamento exato.
  // 4. Montamos a URL do Google Maps Embed de forma limpa e segura (sem expor chaves públicas nem estourar cotas).
  const effectiveQuery =
    mapQuery?.trim() ||
    (locationAddress?.trim()
      ? `${locationAddress.trim()}, ${neighborhood}, ${city}, BA`
      : `${neighborhood}, ${city}, BA, Brasil`);

  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(effectiveQuery)}&output=embed`;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(effectiveQuery)}`;
  const wazeSearchUrl = `https://waze.com/ul?q=${encodeURIComponent(effectiveQuery)}&navigate=yes`;

  const displayAddress = locationAddress?.trim()
    ? `${locationAddress.trim()} — ${neighborhood}, ${city}`
    : `${neighborhood}, ${city}`;

  async function handleCopyAddress() {
    try {
      await navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      toast.success("Endereço copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Não foi possível copiar o endereço.");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border/80 p-5 sm:flex sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
            <MapPin className="size-4 text-brand" />
            <span>Localização no Mapa</span>
          </div>
          <h3 className="font-display text-lg font-bold text-foreground sm:text-xl">
            {neighborhood}, {city}
          </h3>
          <p className="text-sm text-muted-foreground">{displayAddress}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyAddress}
            className="h-8 gap-1.5 text-xs"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-600" />
            ) : (
              <Copy className="size-3.5" />
            )}
            <span>{copied ? "Copiado" : "Copiar endereço"}</span>
          </Button>

          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <a href={googleMapsSearchUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" />
              <span>Google Maps</span>
            </a>
          </Button>

          <Button asChild variant="secondary" size="sm" className="h-8 gap-1.5 text-xs">
            <a href={wazeSearchUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="size-3.5 text-brand" />
              <span>Abrir no Waze</span>
            </a>
          </Button>
        </div>
      </div>

      <div className="relative aspect-[16/9] w-full min-h-[280px] bg-muted/50 sm:min-h-[340px]">
        <iframe
          title={`Mapa de localização de ${title}`}
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen={false}
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full grayscale-[0.15] contrast-[1.05]"
        />
      </div>

      <div className="bg-secondary/40 px-5 py-3 text-xs text-muted-foreground">
        <p>
          💡 <strong>Dica do corretor:</strong> Você pode clicar em &ldquo;Abrir no Waze&rdquo; ou
          &ldquo;Google Maps&rdquo; para traçar rotas partindo da sua localização atual e calcular o
          tempo de deslocamento até o empreendimento.
        </p>
      </div>
    </div>
  );
}
