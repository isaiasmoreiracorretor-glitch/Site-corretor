import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { BrokerAnalysis } from "@/data/properties";

export interface ServerPropertyValues {
  ref: string;
  slug: string;
  title: string;
  category: string;
  type: string;
  developerSlug: string;
  neighborhood: string;
  city: string;
  locationAddress?: string;
  mapQuery?: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  image?: string | null;
  imageThumb?: string | null;
  galleryImages?: string[];
  highlight?: string | null;
  deliveryDate?: string | null;
  description: string;
  features: string | string[];
  leisure?: string[];
  commercialConditions?: string | null;
  downPaymentInfo?: string | null;
  financing: string[];
  minhaCasaMinhaVida: boolean;
  acceptsFgts?: boolean;
  customWhatsAppUrl?: string | null;
  customWhatsAppMessage?: string | null;
  youtubeUrl?: string | null;
  brokerAnalysis?: BrokerAnalysis;
}

export async function serverCreateProperty(values: ServerPropertyValues) {
  const baseRow = {
    ref: values.ref,
    slug: values.slug,
    title: values.title,
    category: values.category,
    type: values.type,
    developer_slug: values.developerSlug,
    neighborhood: values.neighborhood,
    city: values.city,
    price: values.price,
    area: values.area,
    bedrooms: values.bedrooms,
    bathrooms: values.bathrooms,
    parking: values.parking,
    image: values.image?.trim() || null,
    image_thumb: values.imageThumb?.trim() || null,
    highlight: values.highlight?.trim() || null,
    delivery_date: values.deliveryDate?.trim() || null,
    description: values.description,
    features: Array.isArray(values.features)
      ? values.features
      : typeof values.features === "string"
        ? values.features
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean)
        : [],
    financing: Array.isArray(values.financing) ? values.financing : [],
    minha_casa_minha_vida: values.minhaCasaMinhaVida,
  };

  const extendedRow = {
    ...baseRow,
    location_address: values.locationAddress?.trim() || null,
    map_query: values.mapQuery?.trim() || null,
    gallery_images: Array.isArray(values.galleryImages)
      ? values.galleryImages.filter((g) => g && g.trim().length > 0)
      : [],
    leisure: values.leisure || [],
    commercial_conditions: values.commercialConditions?.trim() || null,
    down_payment_info: values.downPaymentInfo?.trim() || null,
    accepts_fgts: values.acceptsFgts ?? true,
    custom_whatsapp_url: values.customWhatsAppUrl?.trim() || null,
    custom_whatsapp_message: values.customWhatsAppMessage?.trim() || null,
    youtube_url: values.youtubeUrl?.trim() || null,
    broker_analysis: values.brokerAnalysis || {},
  };

  let res = await supabaseAdmin
    .from("properties")
    .insert(extendedRow as never)
    .select("id")
    .single();

  if (res.error && res.error.message.includes("schema cache")) {
    res = await supabaseAdmin
      .from("properties")
      .insert(baseRow as never)
      .select("id")
      .single();
  }

  if (res.error) throw new Error(res.error.message);
  const inserted = res.data as { id: string } | null;
  return { ok: true, id: inserted?.id ?? "" };
}

export async function serverDeleteProperty(id: string) {
  const { data: row } = await supabaseAdmin
    .from("properties")
    .select("image, image_thumb")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabaseAdmin.from("properties").delete().eq("id", id);
  if (error) throw new Error(error.message);

  const target = row as { image: string | null; image_thumb: string | null } | null;
  if (target) {
    const urls: string[] = [];
    for (const url of [target.image, target.image_thumb]) {
      if (!url) continue;
      const match = url.match(/\/api\/public\/imagem\/([^?#]+)$/);
      if (match) {
        const path = decodeURIComponent(match[1]!);
        const { count } = await supabaseAdmin
          .from("properties")
          .select("id", { count: "exact", head: true })
          .or(`image.eq.${url},image_thumb.eq.${url}`);
        if (!count) urls.push(path);
      }
    }
    if (urls.length > 0) {
      try {
        await supabaseAdmin.storage.from("imoveis").remove(urls);
      } catch (err) {
        console.warn("[AdminActions] Erro ao remover fotos do storage:", err);
      }
    }
  }

  return { ok: true };
}

export async function serverClearAllLeads() {
  const { error } = await supabaseAdmin
    .from("leads")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function serverDeleteLead(id: string) {
  const { error } = await supabaseAdmin.from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export interface ServerAboutValues {
  name: string;
  roleLine: string;
  bio: string;
  photo: string;
  photoThumb: string;
  photos: Array<{ url: string; thumbUrl: string }>;
  content: string;
}

export async function serverUpdateAboutProfile(values: ServerAboutValues) {
  const { error } = await supabaseAdmin.from("about_profile").upsert({
    id: "main",
    name: values.name.trim(),
    role_line: values.roleLine.trim(),
    bio: values.bio.trim(),
    photo: values.photo.trim() || null,
    photo_thumb: values.photoThumb.trim() || null,
    photos: values.photos.filter((p) => p.url.trim() !== ""),
    content: values.content,
  } as never);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function serverUploadImage(name: string, base64Data: string, contentType: string) {
  const buffer = Buffer.from(base64Data, "base64");
  const { error } = await supabaseAdmin.storage.from("imoveis").upload(name, buffer, {
    contentType: contentType || "image/webp",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export interface ServerLeadsPage {
  rows: Record<string, string | number | boolean | null>[];
  total: number;
}

/** Lista leads com a chave de serviço (o gate do corretor não usa sessão Supabase). */
export async function serverListLeads(page: number, pageSize: number): Promise<ServerLeadsPage> {
  const from = Math.max(0, page) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await supabaseAdmin
    .from("leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as ServerLeadsPage["rows"], total: count ?? 0 };
}
