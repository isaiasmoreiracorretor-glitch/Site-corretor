import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ACCEPTED_EXT,
  formatBytes,
  ImageUploadError,
  removeStorageImages,
  uploadPropertyImage,
  type UploadedImage,
} from "@/lib/image-upload";

export interface ImageUploadValue {
  url: string;
  thumbUrl: string;
}

interface Props {
  value: ImageUploadValue;
  onChange: (value: ImageUploadValue) => void;
}

export function ImageUploadField({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [meta, setMeta] = useState<UploadedImage | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file || uploading) return;
    setUploading(true);
    setProgress(5);
    const previous = value.url && value.url !== "" ? [value.url, value.thumbUrl] : [];
    try {
      const uploaded = await uploadPropertyImage(file, setProgress);
      onChange({ url: uploaded.url, thumbUrl: uploaded.thumbUrl });
      setMeta(uploaded);
      // Só remove a imagem antiga depois que a nova foi armazenada com sucesso.
      await removeStorageImages(previous);
      toast.success("Imagem enviada e otimizada com sucesso.");
    } catch (error) {
      const message =
        error instanceof ImageUploadError
          ? error.message
          : "Não foi possível enviar a imagem. Verifique sua conexão e tente novamente.";
      toast.error(message);
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    const previous = [value.url, value.thumbUrl];
    onChange({ url: "", thumbUrl: "" });
    setMeta(null);
    await removeStorageImages(previous);
    toast.success("Imagem removida.");
  }

  const isExternal = Boolean(value.url) && !value.url.startsWith("/api/public/imagem/");

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXT.join(",")}
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {value.url ? (
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <img
            src={value.thumbUrl || value.url}
            alt="Prévia da foto do imóvel"
            width={640}
            height={480}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
          <div className="mt-3 space-y-0.5 text-xs text-muted-foreground">
            {meta ? (
              <>
                <p className="truncate font-medium text-foreground">{meta.fileName}</p>
                <p>Original: {formatBytes(meta.originalBytes)}</p>
                <p>
                  Otimizada (WebP {meta.width}×{meta.height}): {formatBytes(meta.optimizedBytes)}
                </p>
              </>
            ) : (
              <p>{isExternal ? "Imagem externa (URL já cadastrada)" : "Imagem já enviada"}</p>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <RefreshCw /> Substituir
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => void handleRemove()}
            >
              <Trash2 className="text-destructive" /> Remover
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void handleFile(event.dataTransfer.files?.[0]);
          }}
          className={`flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            dragging ? "border-brand bg-brand/5" : "border-border bg-muted/20 hover:border-brand"
          }`}
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin text-brand" />
          ) : (
            <ImagePlus className="size-6 text-brand" />
          )}
          <span className="font-semibold">Adicionar imagem</span>
          <span className="text-xs text-muted-foreground">
            Clique para selecionar ou arraste uma imagem para esta área
          </span>
          <span className="text-xs text-muted-foreground">WebP recomendado • Máx. 20 MB</span>
        </button>
      )}

      {uploading && <Progress value={progress} className="h-1.5" />}
    </div>
  );
}
