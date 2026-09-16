import { developers, typeLabels, type Property } from "@/data/properties";

export const ALL = "todos";
export const MCMV_OPTION = "Minha Casa Minha Vida";

/** Opções de financiamento oferecidas no formulário administrativo. */
export const FINANCING_OPTIONS = [
  MCMV_OPTION,
  "Financiamento bancário",
  "FGTS",
  "Consórcio",
  "À vista",
] as const;

export interface FeatureOption {
  id: string;
  label: string;
}

/** Características exibidas como checkbox nos filtros do site. */
export const FEATURE_OPTIONS: FeatureOption[] = [
  { id: "vaga", label: "Vaga" },
  { id: "varanda", label: "Varanda" },
  { id: "elevador", label: "Elevador" },
  { id: "piscina", label: "Piscina" },
  { id: "condominio-fechado", label: "Condomínio fechado" },
];

export interface PropertyFilterState {
  query: string;
  city: string;
  developer: string;
  bedrooms: string;
  priceLimit: number;
  types: string[];
  neighborhoods: string[];
  features: string[];
  financing: string[];
}

export function createEmptyFilters(maxPrice: number): PropertyFilterState {
  return {
    query: "",
    city: ALL,
    developer: ALL,
    bedrooms: ALL,
    priceLimit: maxPrice,
    types: [],
    neighborhoods: [],
    features: [],
    financing: [],
  };
}

export function maxPriceOf(properties: Property[]): number {
  return Math.max(...properties.map((p) => p.price), 100000);
}

export function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Financiamentos de um imóvel, incluindo MCMV legado (campo booleano). */
export function financingOf(property: Property): string[] {
  const list = [...(property.financing ?? [])];
  if (property.minhaCasaMinhaVida && !list.includes(MCMV_OPTION)) list.push(MCMV_OPTION);
  return list;
}

function featuresText(property: Property): string {
  return property.features.join(" ").toLowerCase();
}

export function hasFeature(property: Property, featureId: string): boolean {
  const text = featuresText(property);
  switch (featureId) {
    case "vaga":
      return property.parking > 0 || text.includes("vaga");
    case "varanda":
      return text.includes("varanda");
    case "elevador":
      return text.includes("elevador");
    case "piscina":
      return text.includes("piscina");
    case "condominio-fechado":
      return text.includes("condomínio fechado") || text.includes("condominio fechado");
    default:
      return false;
  }
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface DerivedFilterOptions {
  cities: string[];
  developers: typeof developers;
  types: FilterOption[];
  neighborhoods: FilterOption[];
  financing: FilterOption[];
}

const byLabel = (a: FilterOption, b: FilterOption) => a.label.localeCompare(b.label, "pt-BR");

/** Opções de filtro derivadas dos imóveis carregados (só o que existe no banco). */
export function deriveFilterOptions(properties: Property[]): DerivedFilterOptions {
  const cities = Array.from(new Set(properties.map((p) => p.city))).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const devs = developers.filter((d) => properties.some((p) => p.developerSlug === d.slug));
  const types = Array.from(new Set(properties.map((p) => p.type)))
    .map((t) => ({ value: t, label: typeLabels[t] ?? t }))
    .sort(byLabel);
  const neighborhoods = Array.from(new Set(properties.map((p) => p.neighborhood)))
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((n) => ({ value: n, label: n }));
  const financing = Array.from(new Set(properties.flatMap((p) => financingOf(p))))
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((f) => ({ value: f, label: f }));
  return { cities, developers: devs, types, neighborhoods, financing };
}

export function applyPropertyFilters(
  properties: Property[],
  state: PropertyFilterState,
): Property[] {
  const term = state.query.trim().toLowerCase();
  return properties.filter((property) => {
    const matchesTerm =
      !term ||
      `${property.title} ${property.neighborhood} ${property.city} ${property.ref}`
        .toLowerCase()
        .includes(term);
    const matchesCity = state.city === ALL || property.city === state.city;
    const matchesDeveloper = state.developer === ALL || property.developerSlug === state.developer;
    const matchesBedrooms = state.bedrooms === ALL || property.bedrooms >= Number(state.bedrooms);
    const matchesPrice = property.price <= state.priceLimit;
    const matchesTypes = state.types.length === 0 || state.types.includes(property.type);
    const matchesNeighborhoods =
      state.neighborhoods.length === 0 || state.neighborhoods.includes(property.neighborhood);
    const matchesFeatures = state.features.every((f) => hasFeature(property, f));
    const availableFinancing = financingOf(property);
    const matchesFinancing = state.financing.every((f) => availableFinancing.includes(f));
    return (
      matchesTerm &&
      matchesCity &&
      matchesDeveloper &&
      matchesBedrooms &&
      matchesPrice &&
      matchesTypes &&
      matchesNeighborhoods &&
      matchesFeatures &&
      matchesFinancing
    );
  });
}

/** Marca/desmarca uma característica dentro do campo de diferenciais (texto com vírgulas). */
export function toggleFeatureInText(text: string, label: string, checked: boolean): string {
  const items = text
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);
  const has = items.some((i) => i.toLowerCase() === label.toLowerCase());
  if (checked && !has) return [...items, label].join(", ");
  if (!checked && has)
    return items.filter((i) => i.toLowerCase() !== label.toLowerCase()).join(", ");
  return text;
}

export function featureCheckedInText(text: string, label: string): boolean {
  return text
    .split(",")
    .map((i) => i.trim().toLowerCase())
    .includes(label.toLowerCase());
}
