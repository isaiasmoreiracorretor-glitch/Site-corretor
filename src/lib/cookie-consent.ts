/**
 * Gestão de consentimento de cookies (LGPD).
 *
 * O consentimento é salvo no navegador do usuário e qualquer script não
 * essencial (analytics, marketing) só pode ser ativado após verificar
 * `hasConsent(categoria)`. Cookies estritamente necessários (autenticação,
 * preferência de consentimento) não dependem de permissão.
 */

export interface ConsentCategories {
  /** Sempre true — autenticação, segurança e o próprio registro de consentimento. */
  necessary: true;
  /** Melhorias de experiência (ex.: lembrar filtros). */
  functional: boolean;
  /** Métricas de uso anônimas (ex.: Google Analytics). */
  analytics: boolean;
  /** Publicidade e remarketing (ex.: Meta Pixel, Google Ads). */
  marketing: boolean;
}

export interface ConsentRecord {
  version: 1;
  timestamp: string;
  categories: ConsentCategories;
}

const STORAGE_KEY = "izl-cookie-consent";

/** Evento disparado na janela sempre que o consentimento muda. */
export const CONSENT_CHANGED_EVENT = "izl:consent-changed";
/** Evento para reabrir o painel de preferências (ex.: link no rodapé). */
export const OPEN_PREFERENCES_EVENT = "izl:open-cookie-preferences";

export const DEFAULT_CATEGORIES: ConsentCategories = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStoredConsent(): ConsentRecord | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed?.version !== 1 || !parsed.categories) return null;
    return { ...parsed, categories: { ...parsed.categories, necessary: true } };
  } catch {
    return null;
  }
}

export function saveConsent(categories: ConsentCategories): ConsentRecord {
  const record: ConsentRecord = {
    version: 1,
    timestamp: new Date().toISOString(),
    categories: { ...categories, necessary: true },
  };
  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    window.dispatchEvent(new CustomEvent<ConsentRecord>(CONSENT_CHANGED_EVENT, { detail: record }));
  }
  return record;
}

export function acceptAll(): ConsentRecord {
  return saveConsent({ necessary: true, functional: true, analytics: true, marketing: true });
}

export function rejectNonEssential(): ConsentRecord {
  return saveConsent({ ...DEFAULT_CATEGORIES });
}

/** Verifica se uma categoria não essencial foi autorizada. */
export function hasConsent(category: Exclude<keyof ConsentCategories, "necessary">): boolean {
  return getStoredConsent()?.categories[category] === true;
}

/** Reabre o painel de preferências a partir de qualquer ponto do site. */
export function openCookiePreferences() {
  if (isBrowser()) window.dispatchEvent(new CustomEvent(OPEN_PREFERENCES_EVENT));
}
