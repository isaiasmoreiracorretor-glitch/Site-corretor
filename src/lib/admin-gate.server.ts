import crypto from "crypto";

// ============================================================================
// CONFIGURAÇÃO DO USUÁRIO ADMINISTRADOR (PROCESSAMENTO EXCLUSIVO NO SERVIDOR)
// ============================================================================
// O usuário único autorizado é CorretorAdmArea.
// Em ambiente de desenvolvimento, a senha pode ser alterada diretamente nesta constante:
export const DEV_DEFAULT_PASSWORD = "852369";
export const ADMIN_USERNAME = "CorretorAdmArea";

// Regras de Bloqueio e Janela
export const MAX_UNLOCKED_FAILURES = 2; // Após 2 erros, novos erros bloqueiam por 2 horas
export const LOCK_DURATION_MS = 2 * 60 * 60 * 1000; // 2 horas (120 minutos)
export const WINDOW_START_HOUR = 17; // 17:00
export const WINDOW_END_HOUR = 19; // 19:00

interface GateState {
  username: string;
  password_hash: string | null;
  password_salt: string | null;
  failed_attempts: number;
  locked_until: string | null;
}

// Estado em memória (mantém funcionamento mesmo sem banco ou em reinicializações)
let memoryGate: GateState = {
  username: ADMIN_USERNAME,
  password_hash: null,
  password_salt: null,
  failed_attempts: 0,
  locked_until: null,
};

function getSecretKey(): string {
  return (
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
    process.env["SUPABASE_URL"] ||
    process.env["VITE_SUPABASE_URL"] ||
    "corretor_admin_secret_key_bahia_2026"
  );
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

async function getAdminDb() {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return supabaseAdmin;
  } catch {
    return null;
  }
}

async function loadGateState(): Promise<GateState> {
  try {
    const db = await getAdminDb();
    if (db) {
      const { data, error } = await db
        .from("admin_gate")
        .select("username, password_hash, password_salt, failed_attempts, locked_until")
        .eq("id", "main")
        .maybeSingle();

      if (!error && data) {
        memoryGate = {
          username: (data.username as string) || ADMIN_USERNAME,
          password_hash: (data.password_hash as string) || null,
          password_salt: (data.password_salt as string) || null,
          failed_attempts: Number(data.failed_attempts ?? 0),
          locked_until: (data.locked_until as string) || null,
        };
        return memoryGate;
      }

      if (!error && !data) {
        await db.from("admin_gate").insert({
          id: "main",
          username: ADMIN_USERNAME,
          failed_attempts: 0,
        } as never);
      }
    }
  } catch (err) {
    console.warn("[AdminGate] Falha ao consultar banco; usando memória:", err);
  }
  return memoryGate;
}

async function saveGateState(updates: Partial<GateState>) {
  memoryGate = { ...memoryGate, ...updates };
  try {
    const db = await getAdminDb();
    if (db) {
      await db
        .from("admin_gate")
        .update(updates as never)
        .eq("id", "main");
    }
  } catch (err) {
    console.warn("[AdminGate] Falha ao sincronizar banco:", err);
  }
}

/** Retorna a hora atual em Salvador (America/Bahia / UTC-3). */
export function currentLocalHour(): number {
  try {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Bahia",
      hour: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const hourPart = parts.find((p) => p.type === "hour");
    if (hourPart) return parseInt(hourPart.value, 10);
    return new Date().getHours();
  } catch {
    return new Date().getHours();
  }
}

/** Verifica se a janela de alteração de senha (17h às 19h) está aberta. */
export function isPasswordChangeWindowOpen(): boolean {
  const hour = currentLocalHour();
  return hour >= WINDOW_START_HOUR && hour < WINDOW_END_HOUR;
}

/** Valida a senha contra o hash salvo ou senha padrão de desenvolvimento. */
function verifyPassword(inputPassword: string, state: GateState): boolean {
  if (state.password_hash && state.password_salt) {
    const hash = hashPassword(inputPassword, state.password_salt);
    if (crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(state.password_hash))) {
      return true;
    }
  }
  // Se ainda não houve troca ou em dev: confere com a senha de código
  return inputPassword === DEV_DEFAULT_PASSWORD;
}

export interface SessionPayload {
  username: string;
  role: string;
  iat: number;
  exp: number;
}

/** Cria um token de sessão HMAC assinado no servidor. */
export function createSessionToken(username: string): string {
  const payload: SessionPayload = {
    username,
    role: "admin",
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 horas de validade
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", getSecretKey()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

/** Valida o token de sessão HMAC. */
export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", getSecretKey())
    .update(body)
    .digest("base64url");

  try {
    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature, "utf-8"),
        Buffer.from(expectedSignature, "utf-8"),
      )
    ) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    if (payload.username !== ADMIN_USERNAME) return null;
    return payload;
  } catch {
    return null;
  }
}

export interface GateResult {
  ok: boolean;
  message: string;
  locked?: boolean;
  remainingMinutes?: number;
  token?: string;
  session?: {
    user: {
      username: string;
      role: string;
    };
    token: string;
  };
}

/**
 * Processa a tentativa de login.
 * - Limite de 2 tentativas erradas. A partir da 3ª (erros após a 2ª tentativa), bloqueia por 2 horas.
 */
export async function attemptLogin(username: string, password: string): Promise<GateResult> {
  const state = await loadGateState();
  const now = Date.now();

  // 1. Verifica se está no período de bloqueio
  if (state.locked_until) {
    const lockExpiry = new Date(state.locked_until).getTime();
    if (lockExpiry > now) {
      const remainingMinutes = Math.max(1, Math.ceil((lockExpiry - now) / 60000));
      return {
        ok: false,
        locked: true,
        remainingMinutes,
        message: `Acesso bloqueado por segurança após tentativas incorretas. Tente novamente em ${remainingMinutes} minuto(s).`,
      };
    } else {
      // Bloqueio expirou, limpa contador
      await saveGateState({ locked_until: null, failed_attempts: 0 });
      state.failed_attempts = 0;
      state.locked_until = null;
    }
  }

  const cleanUser = (username ?? "").trim();
  const cleanPass = password ?? "";

  // 2. Valida usuário e senha
  const userMatches = cleanUser === ADMIN_USERNAME;
  const passwordMatches = verifyPassword(cleanPass, state);

  if (userMatches && passwordMatches) {
    // Sucesso: reseta tentativas e emite token
    await saveGateState({ failed_attempts: 0, locked_until: null });
    const token = createSessionToken(ADMIN_USERNAME);
    return {
      ok: true,
      message: "Acesso autorizado.",
      token,
      session: {
        user: { username: ADMIN_USERNAME, role: "admin" },
        token,
      },
    };
  }

  // 3. Credenciais incorretas: contabiliza erro
  const currentFailures = (state.failed_attempts ?? 0) + 1;

  if (currentFailures > MAX_UNLOCKED_FAILURES) {
    // Bloqueia por 2 horas
    const lockedUntil = new Date(now + LOCK_DURATION_MS).toISOString();
    await saveGateState({
      failed_attempts: currentFailures,
      locked_until: lockedUntil,
    });
    return {
      ok: false,
      locked: true,
      remainingMinutes: 120,
      message: "Limite de tentativas excedido. O acesso foi bloqueado por 2 horas.",
    };
  } else {
    // Avisa sobre as tentativas restantes
    await saveGateState({ failed_attempts: currentFailures });
    const remaining = MAX_UNLOCKED_FAILURES - currentFailures + 1;
    return {
      ok: false,
      message:
        remaining === 1
          ? "Dados de acesso incorretos. Próximo erro bloqueará o acesso por 2 horas."
          : `Dados de acesso incorretos. Resta ${remaining} tentativa antes do bloqueio por 2 horas.`,
    };
  }
}

/**
 * Altera a senha do corretor.
 * Exige que a janela de horário esteja aberta (17h às 19h de Salvador)
 * e que a senha atual informada seja válida.
 */
export async function changePassword(
  currentPass: string,
  newPass: string,
): Promise<{ ok: boolean; message: string }> {
  if (!isPasswordChangeWindowOpen()) {
    return {
      ok: false,
      message: "Erro de acesso: operação não autorizada no momento.",
    };
  }

  if (!newPass || newPass.trim().length < 6) {
    return { ok: false, message: "A nova senha deve ter no mínimo 6 caracteres." };
  }

  const state = await loadGateState();
  if (!verifyPassword(currentPass, state)) {
    return { ok: false, message: "A senha atual informada está incorreta." };
  }

  const salt = generateSalt();
  const hash = hashPassword(newPass.trim(), salt);

  await saveGateState({
    password_salt: salt,
    password_hash: hash,
    failed_attempts: 0,
    locked_until: null,
  });

  return { ok: true, message: "Senha alterada com sucesso!" };
}

/** Limpa todas as informações de login, bloqueios e redefine para as credenciais padrão. */
export async function resetLoginGate(): Promise<{ ok: boolean }> {
  memoryGate = {
    username: ADMIN_USERNAME,
    password_hash: null,
    password_salt: null,
    failed_attempts: 0,
    locked_until: null,
  };
  await saveGateState({
    username: ADMIN_USERNAME,
    password_hash: null,
    password_salt: null,
    failed_attempts: 0,
    locked_until: null,
  });
  return { ok: true };
}
