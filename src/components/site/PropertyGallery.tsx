import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye, Image as ImageIcon } from "lucide-react";
import { categoryLabels, type PropertyCategory } from "@/data/properties";

interface PropertyGalleryProps {
  mainImage: string;
  galleryImages?: string[] | undefined;
  title: string;
  category: PropertyCategory;
  minhaCasaMinhaVida?: boolean | undefined;
  acceptsFgts?: boolean | undefined;
  highlight?: string | undefined;
  neighborhood: string;
  city: string;
}

export function PropertyGallery({
  mainImage,
  galleryImages = [],
  title,
  category,
  minhaCasaMinhaVida,
  acceptsFgts,
  highlight,
  neighborhood,
  city,
}: PropertyGalleryProps) {
  const allImages = [mainImage, ...galleryImages.filter((img) => img && img !== mainImage)];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeImage = allImages[selectedIndex] || mainImage;

  function nextImage() {
    setSelectedIndex((prev) => (prev + 1) % allImages.length);
  }

  function prevImage() {
    setSelectedIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/80 bg-muted/40 shadow-sm sm:aspect-[16/9]">
        <img
          src={activeImage}
          alt={`${title} — ${neighborhood}, ${city} (Foto ${selectedIndex + 1})`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge className="bg-brand text-brand-foreground shadow-sm">
            {categoryLabels[category]}
          </Badge>
          {minhaCasaMinhaVida && (
            <Badge className="bg-emerald-600 text-white shadow-sm">Minha Casa Minha Vida</Badge>
          )}
          {acceptsFgts && (
            <Badge
              variant="outline"
              className="border-white/40 bg-black/60 text-white backdrop-blur-md"
            >
              Aceita FGTS
            </Badge>
          )}
          {highlight && <Badge className="bg-amber-500 text-white shadow-sm">{highlight}</Badge>}
        </div>

        {/* View full / counter button */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 gap-1.5 rounded-lg bg-black/70 px-3 text-xs text-white backdrop-blur-md hover:bg-black/90"
            onClick={() => setLightboxOpen(true)}
          >
            <Eye className="size-3.5" />
            <span>
              Ver fotos {allImages.length > 1 ? `(${selectedIndex + 1}/${allImages.length})` : ""}
            </span>
          </Button>
        </div>

        {/* Navigation arrows for desktop */}
        {allImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/80 group-hover:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Próxima foto"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/80 group-hover:opacity-100"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails row */}
      {allImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
          {allImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:size-20 ${
                selectedIndex === idx
                  ? "border-brand ring-2 ring-brand/30 ring-offset-1"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`${title} miniatura ${idx + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl border-none bg-black/95 p-2 text-white sm:p-4">
          <DialogTitle className="sr-only">Galeria de fotos do imóvel {title}</DialogTitle>
          <div className="relative flex min-h-[50vh] max-h-[85vh] w-full flex-col items-center justify-center">
            <img
              src={activeImage}
              alt={`${title} — foto ${selectedIndex + 1}`}
              className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
            />
            <div className="mt-3 flex items-center justify-between w-full px-2 text-xs text-white/70">
              <span className="font-medium text-white">{title}</span>
              <span>
                Foto {selectedIndex + 1} de {allImages.length}
              </span>
            </div>

            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-md hover:bg-white/40"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-md hover:bg-white/40"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
