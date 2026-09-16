import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { ADMIN_TOKEN_KEY } from "@/hooks/useAdminSession";
import { adminClearAllLeads, adminDeleteLead, adminListLeads } from "./admin-actions.functions";

export const LEADS_PAGE_SIZE = 20;

export interface LeadPropertyContext {
  id: string;
  ref: string;
  title: string;
  slug: string;
  developer?: string;
  neighborhood?: string;
  city?: string;
}

export interface Lead {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  message: string;
  householdIncome: string;
  age: string;
  downPayment: string;
  fgts: string;
  propertyId: string | null;
  propertyRef: string;
  propertyTitle: string;
  propertySlug: string;
  developer: string;
  neighborhood: string;
  city: string;
  pageUrl: string;
  userAgent: string;
  source: string;
}

interface LeadRow {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  message: string;
  household_income: string | null;
  age: string | null;
  down_payment: string | null;
  fgts: string | null;
  property_id: string | null;
  property_ref: string;
  property_title: string;
  property_slug: string;
  developer: string;
  neighborhood: string;
  city: string;
  page_url: string;
  user_agent: string;
  source: string;
}

function mapRow(row: LeadRow): Lead {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    phone: row.phone ?? "",
    message: row.message,
    householdIncome: row.household_income ?? "",
    age: row.age ?? "",
    downPayment: row.down_payment ?? "",
    fgts: row.fgts ?? "",
    propertyId: row.property_id,
    propertyRef: row.property_ref,
    propertyTitle: row.property_title,
    propertySlug: row.property_slug,
    developer: row.developer,
    neighborhood: row.neighborhood,
    city: row.city,
    pageUrl: row.page_url,
    userAgent: row.user_agent,
    source: row.source,
  };
}

export interface LeadFinancingInfo {
  householdIncome?: string;
  age?: string;
  downPayment?: string;
  fgts?: string;
}

export interface NewLeadInput {
  name: string;
  phone?: string;
  message: string;
  source: string;
  property?: LeadPropertyContext;
  financing?: LeadFinancingInfo;
}

/**
 * Registra um lead vindo do formulário de interesse.
 * Funciona para visitantes anônimos (policy pública de insert).
 */
export async function insertLead(input: NewLeadInput) {
  const isUuid =
    input.property?.id &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.property.id);

  const row = {
    name: input.name,
    phone: input.phone ?? "",
    message: input.message,
    household_income: input.financing?.householdIncome ?? "",
    age: input.financing?.age ?? "",
    down_payment: input.financing?.downPayment ?? "",
    fgts: input.financing?.fgts ?? "",
    source: input.source,
    property_id: isUuid ? input.property!.id : null,
    property_ref: input.property?.ref ?? "",
    property_title: input.property?.title ?? "",
    property_slug: input.property?.slug ?? "",
    developer: input.property?.developer ?? "",
    neighborhood: input.property?.neighborhood ?? "",
    city: input.property?.city ?? "",
    page_url: typeof window !== "undefined" ? window.location.href : "",
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  };
  const { error } = await supabase.from("leads").insert(row as never);
  if (error) throw new Error(error.message);
}

function adminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function leadsQueryOptions(page: number) {
  return queryOptions({
    queryKey: ["leads", page],
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
    queryFn: async (): Promise<{ leads: Lead[]; total: number }> => {
      const res = await adminListLeads({
        data: { token: adminToken(), page, pageSize: LEADS_PAGE_SIZE },
      });
      return {
        leads: (res.rows as unknown as LeadRow[]).map(mapRow),
        total: res.total,
      };
    },
  });
}

export async function clearAllLeads() {
  await adminClearAllLeads({ data: { token: adminToken() } });
}

export async function deleteLead(id: string) {
  await adminDeleteLead({ data: { id, token: adminToken() } });
}
