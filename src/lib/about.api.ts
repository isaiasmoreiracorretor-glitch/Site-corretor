import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/config/site";

export interface AboutPhoto {
  url: string;
  thumbUrl: string;
}

export interface AboutProfile {
  name: string;
  roleLine: string;
  bio: string;
  photo: string;
  photoThumb: string;
  photos: AboutPhoto[];
  content: string;
}

interface AboutRow {
  id: string;
  name: string;
  role_line: string;
  bio: string;
  photo: string | null;
  photo_thumb: string | null;
  photos: unknown;
  content: string;
}

export const defaultAboutProfile: AboutProfile = {
  name: siteConfig.brokerName,
  roleLine: `Corretor de Imóveis · ${siteConfig.creci}`,
  bio: siteConfig.tagline,
  photo: "",
  photoThumb: "",
  photos: [],
  content: "",
};

function mapRow(row: AboutRow): AboutProfile {
  const photos = Array.isArray(row.photos) ? (row.photos as AboutPhoto[]) : [];
  return {
    name: row.name || defaultAboutProfile.name,
    roleLine: row.role_line || defaultAboutProfile.roleLine,
    bio: row.bio,
    photo: row.photo ?? "",
    photoThumb: row.photo_thumb ?? row.photo ?? "",
    photos: photos.filter((p) => p && typeof p.url === "string" && p.url !== ""),
    content: row.content,
  };
}

export const aboutQueryOptions = queryOptions({
  queryKey: ["about-profile"],
  queryFn: async (): Promise<AboutProfile> => {
    const { data, error } = await supabase
      .from("about_profile")
      .select("*")
      .eq("id", "main")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return defaultAboutProfile;
    return mapRow(data as unknown as AboutRow);
  },
});

import { adminUpdateAbout } from "./admin-actions.functions";

export async function updateAboutProfile(values: AboutProfile) {
  try {
    await adminUpdateAbout({ data: values });
  } catch (serverErr) {
    console.warn("[about.api] Falha na atualização via servidor, tentando cliente:", serverErr);
    const { error } = await supabase.from("about_profile").upsert({
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
  }
}
