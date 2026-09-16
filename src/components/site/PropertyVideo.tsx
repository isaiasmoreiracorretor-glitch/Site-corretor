import { Youtube } from "lucide-react";

/** Extrai o ID do vídeo de qualquer formato de link do YouTube. */
export function getYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const value = url.trim();
  if (value.length === 0) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?[^#]*\bv=)([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
    /youtube\.com\/live\/([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }
  return /^[\w-]{11}$/.test(value) ? value : null;
}

interface PropertyVideoProps {
  url?: string | undefined;
  title: string;
}

export function PropertyVideo({ url, title }: PropertyVideoProps) {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  return (
    <section aria-labelledby="video-imovel">
      <h2
        id="video-imovel"
        className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl"
      >
        <Youtube className="size-5 text-brand" /> Vídeo do imóvel
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Faça um tour pelo empreendimento antes de agendar a visita.
      </p>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-black shadow-md">
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
            title={`Vídeo do imóvel ${title}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </section>
  );
}
