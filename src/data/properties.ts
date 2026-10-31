import lancamentoImg from "@/assets/imovel-lancamento.jpg";
import prontoImg from "@/assets/imovel-pronto.jpg";
import usadoImg from "@/assets/imovel-usado.jpg";

export type PropertyCategory = "lancamento" | "na-planta" | "pronto" | "usado";
export type PropertyType = "apartamento" | "casa" | "cobertura" | "terreno";

export interface Developer {
  slug: string;
  name: string;
  kind: "Construtora" | "Incorporadora";
  description: string;
}

export interface BrokerAnalysis {
  recommendedFor?: string;
  positivePoints?: string;
  attentionPoints?: string;
  idealBuyerProfile?: string;
  locationEvaluation?: string;
  costBenefit?: string;
  financingPotential?: string;
  checkedItems?: string[];
  brokerNotes?: string;
}

export interface Property {
  id: string;
  ref: string;
  slug: string;
  title: string;
  category: PropertyCategory;
  type: PropertyType;
  developerSlug: string;
  developerName?: string | undefined;
  neighborhood: string;
  city: string;
  locationAddress?: string | undefined;
  mapQuery?: string | undefined;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  image: string;
  imageThumb?: string | undefined;
  galleryImages?: string[] | undefined;
  highlight?: string | undefined;
  deliveryDate?: string | undefined;
  description: string;
  features: string[];
  leisure?: string[] | undefined;
  commercialConditions?: string | undefined;
  downPaymentInfo?: string | undefined;
  financing: string[];
  minhaCasaMinhaVida?: boolean | undefined;
  acceptsFgts?: boolean | undefined;
  customWhatsAppUrl?: string | undefined;
  customWhatsAppMessage?: string | undefined;
  youtubeUrl?: string | undefined;

  brokerAnalysis?: BrokerAnalysis | undefined;
}

export const BROKER_CHECKLIST_OPTIONS: string[] = [
  "Documentação 100% regularizada e pronta para repasse",
  "Excelente potencial de valorização a curto e médio prazo",
  "Planta inteligente com aproveitamento total de espaço",
  "Localização estratégica com transporte e metrô próximos",
  "Alta liquidez para locação tradicional ou Airbnb",
  "Relação custo/m² muito competitiva na região",
  "Condomínio com lazer completo e taxa reduzida",
  "Áreas comuns entregues equipadas e decoradas",
  "Construção de alto padrão com garantia da construtora",
  "Aprovado no programa Minha Casa Minha Vida",
  "Aceita utilização do FGTS na entrada",
  "Vaga de garagem privativa e demarcada",
  "Bairro com infraestrutura completa de serviços e escolas",
  "Excelente ventilação cruzada e iluminação natural",
];

export const LEISURE_OPTIONS: string[] = [
  "Piscina adulto e infantil",
  "Academia equipada",
  "Salão de festas gourmet",
  "Churrasqueira a carvão",
  "Playground infantil",
  "Pet place / Espaço pet",
  "Quadra poliesportiva",
  "Bicicletário",
  "Brinquedoteca",
  "Rooftop com vista panorâmica",
  "Deck molhado e solarium",
  "Espaço coworking",
  "Praça de convivência",
  "Salão de jogos",
];

export const DIFFERENTIAL_OPTIONS: string[] = [
  "Varanda gourmet",
  "Piso em porcelanato",
  "Previsão para split nos quartos",
  "Energia solar nas áreas comuns",
  "Fechadura digital / eletrônica",
  "Portaria 24h com guarita",
  "Elevadores inteligentes",
  "Tomadas USB nas unidades",
  "Medição individual de água e gás",
  "Vaga para carro elétrico",
  "Vista panorâmica para o mar / verde",
];

export const categoryLabels: Record<PropertyCategory, string> = {
  lancamento: "Lançamento",
  "na-planta": "Na planta",
  pronto: "Pronto para morar",
  usado: "Usado",
};

export const typeLabels: Record<PropertyType, string> = {
  apartamento: "Apartamento",
  casa: "Casa",
  cobertura: "Cobertura",
  terreno: "Terreno",
};

export const developers: Developer[] = [
  {
    slug: "mrv",
    name: "MRV",
    kind: "Construtora",
    description:
      "Maior construtora de moradias populares do Brasil, forte no programa Minha Casa Minha Vida.",
  },
  {
    slug: "tenda",
    name: "Tenda",
    kind: "Construtora",
    description: "Especialista em apartamentos econômicos com entrada facilitada e subsídio.",
  },
  {
    slug: "direcional",
    name: "Direcional",
    kind: "Construtora",
    description: "Empreendimentos de médio padrão com área de lazer completa.",
  },
  {
    slug: "cury",
    name: "Cury",
    kind: "Incorporadora",
    description: "Projetos compactos bem localizados, ótimos para investimento e locação.",
  },
  {
    slug: "jc-gomes",
    name: "JC Gomes",
    kind: "Incorporadora",
    description: "Incorporadora baiana com foco em bairros consolidados de Salvador.",
  },
  {
    slug: "particular",
    name: "Proprietário particular",
    kind: "Incorporadora",
    description: "Imóveis usados de proprietários, com documentação avaliada e pronta para venda.",
  },
];

export function propertyImage(category: PropertyCategory, image?: string | null) {
  if (image && image.trim().length > 0) return image;
  if (category === "lancamento" || category === "na-planta") return lancamentoImg;
  if (category === "pronto") return prontoImg;
  return usadoImg;
}

export function getDeveloper(slug: string) {
  return developers.find((d) => d.slug === slug);
}

const sortPtBR = (list: string[]) => [...list].sort((a, b) => a.localeCompare(b, "pt-BR"));

/** Bairros disponíveis por cidade atendida. */
export const neighborhoodsByCity: Record<string, string[]> = {
  Salvador: sortPtBR([
    "Barra",
    "Massaranduba",
    "Boca do Rio",
    "Brotas",
    "Cabula",
    "Caminho das Árvores",
    "Campo Grande",
    "Canela",
    "Centro",
    "Cosme de Farias",
    "Costa Azul",
    "Federação",
    "Graça",
    "Horto Florestal",
    "Imbuí",
    "Itaigara",
    "Itapuã",
    "Liberdade",
    "Mussurunga",
    "Ondina",
    "Paralela",
    "Patamares",
    "Periperi",
    "Piatã",
    "Pirajá",
    "Pituba",
    "Rio Vermelho",
    "Santo Antônio",
    "São Cristóvão",
    "São Marcos",
    "Stella Maris",
    "Stiep",
    "Sussuarana",
    "Vila Laura",
  ]),
  "Lauro de Freitas": sortPtBR([
    "Alphaville",
    "Buraquinho",
    "Caji",
    "Centro",
    "Ipitanga",
    "Itinga",
    "Portão",
    "Vilas do Atlântico",
  ]),
  Camaçari: sortPtBR([
    "Areia Branca",
    "Barra do Jacuípe",
    "Busca Vida",
    "Catu de Abrantes",
    "Centro",
    "Gleba B",
    "Guarajuba",
    "Jauá",
    "Monte Gordo",
    "Parque Florestal",
    "Vila de Abrantes",
  ]),
  "Simões Filho": sortPtBR([
    "Bom Viver",
    "CIA",
    "Centro",
    "Cotegipe",
    "Jardim Limoeiro",
    "Mapele",
    "Palmares",
    "Pitanguinha",
    "Pitanguinha de Cotegipe",
    "Vila de Palmares",
  ]),
};

/** Cidades atendidas, em ordem alfabética. */
export const cities: string[] = sortPtBR(Object.keys(neighborhoodsByCity));

export function getNeighborhoodsForCity(city: string): string[] {
  return neighborhoodsByCity[city] ?? [];
}

/** Lista completa de bairros (usada nos filtros do site). */
export const neighborhoods: string[] = sortPtBR([
  ...new Set(Object.values(neighborhoodsByCity).flat()),
]);

