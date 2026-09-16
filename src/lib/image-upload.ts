import { supabase } from "@/integrations/supabase/client";
import { adminUploadImage } from "./admin-actions.functions";

export const BUCKET = "imoveis";
export const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB
export const ACCEPTED_MIME = ["image/webp", "image/jpeg", "image/png"] as const;
export const ACCEPTED_EXT = [".webp", ".jpg", ".jpeg", ".png"] as const;

/** Public URL served by the app's own image endpoint (private storage bucket). */
export const publicImageUrl = (path: string) => `/api/public/imagem/${path}`;

/** Storage object path for images uploaded through this app ("" for external URLs). */
export function storagePathFromUrl(url?: string | null) {
  if (!url) return "";
  const match = url.match(/\/api\/public\/imagem\/([^?#]+)$/);
  return match ? decodeURIComponent(match[1]!) : "";
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export class ImageUploadError extends Error {}

export function validateImageFile(file: File) {
  const name = file.name.toLowerCase();
  const extOk = ACCEPTED_EXT.some((ext) => name.endsWith(ext));
  const mimeOk = (ACCEPTED_MIME as readonly string[]).includes(file.type);
  if (!extOk || !mimeOk) {
    throw new ImageUploadError(
      "Formato não suportado. Envie uma imagem WebP (recomendado), JPG, JPEG ou PNG — de preferência já convertida para .webp.",
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ImageUploadError(
      `Esta imagem é muito grande (${formatBytes(file.size)}). O tamanho máximo permitido é de 20 MB. Selecione uma imagem menor.`,
    );
  }
}

async function loadBitmap(file: File) {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new ImageUploadError(
      "Não foi possível ler esta imagem. O arquivo pode estar corrompido ou não ser uma imagem válida.",
    );
  }
}

async function toWebp(
  bitmap: ImageBitmap,
  maxSide: number,
  quality: number,
): Promise<{ blob: Blob; width: number; height: number }> {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageUploadError("Não foi possível otimizar a imagem neste navegador.");
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob) throw new ImageUploadError("Não foi possível converter a imagem para WebP.");
  return { blob, width, height };
}

function uniqueName(suffix: string) {
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `imovel-${uuid}-${Date.now()}${suffix}.webp`;
}

export interface UploadedImage {
  url: string;
  thumbUrl: string;
  fileName: string;
  originalBytes: number;
  optimizedBytes: number;
  width: number;
  height: number;
}

/**
 * Validates, converts to WebP (main 1600px + thumbnail 640px) and uploads to storage.
 * Returns the app-served public URLs saved in the database.
 */
export async function uploadPropertyImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadedImage> {
  validateImageFile(file);
  onProgress?.(10);

  const bitmap = await loadBitmap(file);
  if (bitmap.width < 200 || bitmap.height < 200) {
    throw new ImageUploadError("Imagem muito pequena. Use uma foto com pelo menos 200x200 pixels.");
  }

  const main = await toWebp(bitmap, 1600, 0.82);
  const thumb = await toWebp(bitmap, 640, 0.75);
  bitmap.close?.();
  onProgress?.(40);

  if (main.blob.size > MAX_FILE_BYTES) {
    throw new ImageUploadError(
      "Esta imagem é muito grande. O tamanho máximo permitido é de 20 MB.",
    );
  }

  const mainName = uniqueName("");
  const thumbName = mainName.replace(/\.webp$/, "-thumb.webp");

  const upload = async (name: string, blob: Blob) => {
    try {
      const buffer = await blob.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]!);
      }
      const base64Data = btoa(binary);
      await adminUploadImage({
        data: {
          name,
          base64Data,
          contentType: "image/webp",
        },
      });
    } catch (serverErr) {
      console.warn("[image-upload] Falha no upload via servidor, tentando cliente:", serverErr);
      const { error } = await supabase.storage.from(BUCKET).upload(name, blob, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      });
      if (error) {
        throw new ImageUploadError(
          "Não foi possível enviar a imagem. Verifique sua conexão e tente novamente.",
        );
      }
    }
  };

  await upload(mainName, main.blob);
  onProgress?.(80);
  await upload(thumbName, thumb.blob);
  onProgress?.(100);

  return {
    url: publicImageUrl(mainName),
    thumbUrl: publicImageUrl(thumbName),
    fileName: file.name,
    originalBytes: file.size,
    optimizedBytes: main.blob.size,
    width: main.width,
    height: main.height,
  };
}

/** Removes uploaded objects from storage (best effort). */
export async function removeStorageImages(urls: (string | null | undefined)[]) {
  const paths = urls.map(storagePathFromUrl).filter(Boolean);
  if (paths.length === 0) return;
  await supabase.storage.from(BUCKET).remove(paths);
}
