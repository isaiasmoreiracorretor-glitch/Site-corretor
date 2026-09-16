import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, LogIn, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { saveAdminSessionToken, useAdminSession } from "@/hooks/useAdminSession";
import { adminLogin, adminResetGate } from "@/lib/admin-gate.functions";
import { siteConfig } from "@/config/site";

const title = `Acesso restrito | ${siteConfig.brandName}`;
const description = "Acesso restrito ao corretor para gerenciamento de imóveis.";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: "exclude-subtree" },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, isAdmin, loading: sessionLoading } = useAdminSession();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (!sessionLoading && session && isAdmin) {
      void navigate({ to: "/admin" });
    }
  }, [session, isAdmin, sessionLoading, navigate]);

  // Limpa bloqueios anteriores na inicialização
  useEffect(() => {
    void adminResetGate();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !password) {
      setError("Informe o nome de acesso e a senha.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await adminLogin({
        data: {
          username: name.trim(),
          password,
        },
      });

      if (!result.ok || !result.token) {
        setPassword("");
        setError(result.message || "Dados de acesso incorretos.");
        setIsLocked(Boolean(result.locked));
        setLoading(false);
        return;
      }

      saveAdminSessionToken(result.token);
      toast.success("Acesso autorizado!");
      setPassword("");
      setLoading(false);
      void navigate({ to: "/admin" });
    } catch (err) {
      console.error("[Auth] Erro na requisição:", err);
      setPassword("");
      setLoading(false);
      setError("Não foi possível validar o acesso agora. Tente novamente.");
    }
  }

  return (
    <div
      id="auth-page-container"
      className="container-page flex min-h-[70vh] items-center justify-center py-12"
    >
      <Card id="auth-card" className="w-full max-w-md shadow-sm">
        <CardHeader id="auth-card-header" className="space-y-1 text-left">
          <div className="flex items-center gap-2 text-primary">
            <Lock className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Área Administrativa
            </span>
          </div>
          <CardTitle id="auth-card-title" className="font-display text-2xl font-bold">
            Acesso do corretor
          </CardTitle>
          <CardDescription id="auth-card-description">
            Área restrita ao usuário autorizado. Informe seu nome de acesso e a senha.
          </CardDescription>
        </CardHeader>

        <CardContent id="auth-card-content">
          <form id="auth-login-form" onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name-input">Nome</Label>
              <Input
                id="admin-name-input"
                name="username"
                type="text"
                autoComplete="username"
                required
                disabled={loading || isLocked}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome de acesso"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password-input">Senha</Label>
              <Input
                id="admin-password-input"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={loading || isLocked}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha de acesso"
              />
            </div>

            {error && (
              <Alert id="auth-error-alert" variant="destructive" className="py-2.5 text-sm">
                {isLocked && <ShieldAlert className="h-4 w-4" />}
                <AlertDescription id="auth-error-description">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              id="auth-submit-btn"
              type="submit"
              className="w-full gap-2"
              disabled={loading || isLocked}
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Verificando…" : "Entrar"}
            </Button>

            <p className="text-xs text-muted-foreground text-center pt-2">
              Após duas tentativas incorretas, novos erros bloqueiam o acesso por 2 horas.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
