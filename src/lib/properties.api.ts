import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import {
  propertyImage,
  type BrokerAnalysis,
  type Property,
  type PropertyCategory,
  type PropertyType,
} from "@/data/properties";

interface PropertyRow {
  id: string;
  ref: string;
  slug: string;
  title: string;
  category: string;
  type: string;
  developer_slug: string;
  neighborhood: string;
  city: string;
  location_address?: string | null;
  map_query?: string | null;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  image: string | null;
  image_thumb: string | null;
  gallery_images?: string[] | null;
  highlight: string | null;
  delivery_date: string | null;
  description: string;
  features: string[];
  leisure?: string[] | null;
  commercial_conditions?: string | null;
  down_payment_info?: string | null;
  financing: string[] | null;
  minha_casa_minha_vida: boolean;
  accepts_fgts?: boolean | null;
  custom_whatsapp_url?: string | null;
  custom_whatsapp_message?: string | null;
  youtube_url?: string | null;
  broker_analysis?: BrokerAnalysis | null;
}

function mapRow(row: PropertyRow): Property {
  const category = row.category as PropertyCategory;
  return {
    id: row.id,
    ref: row.ref,
    slug: row.slug,
    title: row.title,
    category,
    type: row.type as PropertyType,
    developerSlug: row.developer_slug,
    neighborhood: row.neighborhood,
    city: row.city,
    locationAddress: row.location_address ?? undefined,
    mapQuery: row.map_query ?? undefined,
    price: Number(row.price),
    area: Number(row.area),
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    parking: row.parking,
    image: propertyImage(category, row.image),
    imageThumb: propertyImage(category, row.image_thumb ?? row.image),
    galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
    ...(row.highlight ? { highlight: row.highlight } : {}),
    ...(row.delivery_date ? { deliveryDate: row.delivery_date } : {}),
    description: row.description,
    features: row.features ?? [],
    leisure: row.leisure ?? [],
    commercialConditions: row.commercial_conditions ?? undefined,
    downPaymentInfo: row.down_payment_info ?? undefined,
    financing: row.financing ?? [],
    minhaCasaMinhaVida: row.minha_casa_minha_vida,
    acceptsFgts: row.accepts_fgts ?? true,
    customWhatsAppUrl: row.custom_whatsapp_url ?? undefined,
    customWhatsAppMessage: row.custom_whatsapp_message ?? undefined,
    youtubeUrl: row.youtube_url ?? undefined,
    brokerAnalysis:
      row.broker_analysis && typeof row.broker_analysis === "object"
        ? row.broker_analysis
        : undefined,
  };
}

export const propertiesQueryOptions = queryOptions({
  queryKey: ["properties"],
  queryFn: async (): Promise<Property[]> => {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as unknown as PropertyRow[]).map(mapRow);
  },
});

export interface PropertyFormValues {
  ref: string;
  slug: string;
  title: string;
  category: PropertyCategory;
  type: PropertyType;
  developerSlug: string;
  neighborhood: string;
  city: string;
  locationAddress: string;
  mapQuery: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  image: string;
  imageThumb: string;
  galleryImages: string[];
  highlight: string;
  deliveryDate: string;
  description: string;
  features: string;
  leisure: string[];
  commercialConditions: string;
  downPaymentInfo: string;
  financing: string[];
  minhaCasaMinhaVida: boolean;
  acceptsFgts: boolean;
  customWhatsAppUrl: string;
  customWhatsAppMessage: string;
  youtubeUrl: string;
  brokerAnalysis: BrokerAnalysis;
}

import { adminCreateProperty, adminDeleteProperty } from "./admin-actions.functions";

export async function createProperty(values: PropertyFormValues) {
  try {
    await adminCreateProperty({ data: values });
  } catch (serverErr) {
    console.warn("[properties.api] Falha na função de servidor, tentando cliente:", serverErr);
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
      image: values.image.trim() || null,
      image_thumb: values.imageThumb.trim() || null,
      highlight: values.highlight.trim() || null,
      delivery_date: values.deliveryDate.trim() || null,
      description: values.description,
      features: Array.isArray(values.features)
        ? values.features
        : typeof values.features === "string"
          ? values.features
              .split(",")
              .map((f) => f.trim())
              .filter(Boolean)
          : [],
      financing: values.financing,
      minha_casa_minha_vida: values.minhaCasaMinhaVida,
    };

    const extendedRow = {
      ...baseRow,
      location_address: values.locationAddress?.trim() || null,
      map_query: values.mapQuery?.trim() || null,
      gallery_images: values.galleryImages.filter((g) => g.trim().length > 0),
      leisure: values.leisure,
      commercial_conditions: values.commercialConditions?.trim() || null,
      down_payment_info: values.downPaymentInfo?.trim() || null,
      accepts_fgts: values.acceptsFgts,
      custom_whatsapp_url: values.customWhatsAppUrl?.trim() || null,
      custom_whatsapp_message: values.customWhatsAppMessage?.trim() || null,
      youtube_url: values.youtubeUrl?.trim() || null,
      broker_analysis: values.brokerAnalysis,
    };

    let { error } = await supabase.from("properties").insert(extendedRow as never);
    if (error && error.message.includes("schema cache")) {
      const retry = await supabase.from("properties").insert(baseRow as never);
      error = retry.error;
    }
    if (error) throw new Error(error.message);
  }
}

export async function deleteProperty(id: string) {
  try {
    await adminDeleteProperty({ data: { id } });
  } catch (serverErr) {
    console.warn("[properties.api] Falha no delete via servidor, tentando cliente:", serverErr);
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
