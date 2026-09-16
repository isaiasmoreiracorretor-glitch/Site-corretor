import { useEffect, useState, useCallback } from "react";
import { adminVerifySession } from "@/lib/admin-gate.functions";

export const ADMIN_TOKEN_KEY = "corretor_admin_session_token";

export interface AdminUser {
  username: string;
  role: string;
}

export interface AdminSessionState {
  loading: boolean;
  session: { user: AdminUser; token: string } | null;
  isAdmin: boolean;
  logout: () => void;
}

export function useAdminSession(): AdminSessionState {
  const [state, setState] = useState<Omit<AdminSessionState, "logout">>({
    loading: true,
    session: null,
    isAdmin: false,
  });

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      window.dispatchEvent(new Event("admin_session_changed"));
    } catch {
      // Ignora erro de localStorage
    }
    setState({ loading: false, session: null, isAdmin: false });
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
      if (!token) {
        setState({ loading: false, session: null, isAdmin: false });
        return;
      }

      const res = await adminVerifySession({ data: { token } });
      if (res.valid && res.user) {
        setState({
          loading: false,
          session: { user: res.user, token },
          isAdmin: true,
        });
      } else {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setState({ loading: false, session: null, isAdmin: false });
      }
    } catch (err) {
      console.warn("[useAdminSession] Erro ao validar sessão:", err);
      setState({ loading: false, session: null, isAdmin: false });
    }
  }, []);

  useEffect(() => {
    void checkSession();

    const handleStorage = () => {
      void checkSession();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("admin_session_changed", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("admin_session_changed", handleStorage);
    };
  }, [checkSession]);

  return {
    ...state,
    logout,
  };
}

export function saveAdminSessionToken(token: string) {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    window.dispatchEvent(new Event("admin_session_changed"));
  } catch (err) {
    console.error("Não foi possível salvar o token de sessão:", err);
  }
}
