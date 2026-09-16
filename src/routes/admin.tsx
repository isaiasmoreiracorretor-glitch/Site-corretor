import { useState } from "react";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  LogOut,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SobreForm } from "@/components/admin/SobreForm";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { PageHeader } from "@/components/site/PageHeader";
import { categoryLabels, developers, neighborhoods, typeLabels } from "@/data/properties";
import type { PropertyCategory, PropertyType } from "@/data/properties";
import { useAdminSession } from "@/hooks/useAdminSession";
import { supabase } from "@/integrations/supabase/client";
import { adminChangePassword } from "@/lib/admin-gate.functions";
import { formatCurrency } from "@/lib/format";
import { LEADS_PAGE_SIZE, clearAllLeads, deleteLead, leadsQueryOptions } from "@/lib/leads.api";
import {
  createProperty,
  deleteProperty,
  propertiesQueryOptions,
  slugify,
  type PropertyFormValues,
} from "@/lib/properties.api";
import {
  FEATURE_OPTIONS,
  FINANCING_OPTIONS,
  MCMV_OPTION,
  featureCheckedInText,
  toggle,
  toggleFeatureInText,
} from "@/lib/property-filters";
import { siteConfig } from "@/config/site";

const title = `Painel de imóveis | ${siteConfig.brandName}`;
const description = "Área administrativa para cadastrar e remover imóveis do site.";

export const Route = createFileRoute("/admin")({
  staticData: { sitemap: "exclude-subtree" },
  ssr: false,
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
  component: AdminPage,
});

const emptyForm: PropertyFormValues = {
  ref: "",
  slug: "",
  title: "",
  category: "lancamento",
  type: "apartamento",
  developerSlug: "mrv",
  neighborhood: "",
  city: "Salvador",
  locationAddress: "",
  mapQuery: "",
  price: 0,
  area: 0,
  bedrooms: 2,
  bathrooms: 1,
  parking: 1,
  image: "",
  imageThumb: "",
  galleryImages: [],
  highlight: "",
  deliveryDate: "",
  description: "",
  features: "",
  leisure: [],
  commercialConditions: "",
  downPaymentInfo: "",
  financing: [],
  minhaCasaMinhaVida: false,
  acceptsFgts: true,
  customWhatsAppUrl: "",
  customWhatsAppMessage: "",
  youtubeUrl: "",
  brokerAnalysis: {
    recommendedFor: "",
    positivePoints: "",
    attentionPoints: "",
    idealBuyerProfile: "",
    locationEvaluation: "",
    costBenefit: "",
    financingPotential: "",
    checkedItems: [],
    brokerNotes: "",
  },
};

const types: PropertyType[] = ["apartamento", "casa", "cobertura", "terreno"];
const categories: PropertyCategory[] = ["lancamento", "na-planta", "pronto", "usado"];

function AdminPage() {
  const { loading, session, isAdmin, logout } = useAdminSession();
  const navigate = useNavigate();

  if (loading) {
    return <p className="container-page py-24 text-center text-muted-foreground">Carregando…</p>;
  }

  if (!session || !isAdmin) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Acesso restrito</h1>
        <p className="mt-2 text-muted-foreground">
          Entre com seu nome e senha para acessar o painel de imóveis.
        </p>
        <Button asChild className="mt-6">
          <Link to="/auth">Fazer login</Link>
        </Button>
      </div>
    );
  }

  return <AdminDashboard onLogout={logout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: properties } = useSuspenseQuery(propertiesQueryOptions);
  const [form, setForm] = useState<PropertyFormValues>(emptyForm);

  const create = useMutation({
    mutationFn: () =>
      createProperty({
        ...form,
        slug: slugify(form.title),
        minhaCasaMinhaVida: form.financing.includes(MCMV_OPTION),
      }),
    onSuccess: async () => {
      toast.success("Imóvel publicado no site!");
      setForm(emptyForm);
      await queryClient.invalidateQueries({ queryKey: propertiesQueryOptions.queryKey });
    },
    onError: (error: Error) =>
      toast.error("Não foi possível salvar", { description: error.message }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: async () => {
      toast.success("Imóvel removido");
      await queryClient.invalidateQueries({ queryKey: propertiesQueryOptions.queryKey });
    },
    onError: (error: Error) =>
      toast.error("Não foi possível remover", { description: error.message }),
  });

  function set<K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <PageHeader
        eyebrow="Área administrativa"
        title="Painel de imóveis"
        description="Cadastre novos imóveis e remova os desatualizados — as mudanças aparecem no site na hora."
      />

      <div className="container-page py-12">
        <Tabs defaultValue="imoveis">
          <TabsList>
            <TabsTrigger value="imoveis">Imóveis</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="sobre">Sobre</TabsTrigger>
            <TabsTrigger value="senha">Senha</TabsTrigger>
          </TabsList>

          <TabsContent value="imoveis" className="mt-6">
            <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
              <section className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-6 flex items-center justify-between border-b border-border/80 pb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold">Cadastrar Novo Imóvel</h2>
                    <p className="text-xs text-muted-foreground">
                      Preencha os dados organizados em seções lógicas para publicação imediata no
                      site.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold text-brand">
                    Admin Corretor
                  </Badge>
                </div>

                <PropertyForm
                  form={form}
                  setForm={setForm}
                  isPending={create.isPending}
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!form.neighborhood) {
                      toast.error("Selecione o bairro do imóvel");
                      return;
                    }
                    if (!form.title.trim()) {
                      toast.error("Informe o nome do empreendimento");
                      return;
                    }
                    create.mutate();
                  }}
                />
              </section>

              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-bold">
                    Imóveis publicados ({properties.length})
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onLogout();
                      void navigate({ to: "/auth" });
                    }}
                  >
                    <LogOut /> Sair
                  </Button>
                </div>

                <ul className="mt-5 space-y-3">
                  {properties.map((property) => (
                    <li
                      key={property.id}
                      className="flex items-center gap-4 rounded-xl border border-border bg-card p-3"
                    >
                      <img
                        src={property.imageThumb ?? property.image}
                        alt={property.title}
                        loading="lazy"
                        className="size-16 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{property.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          Ref. {property.ref} · {property.neighborhood}, {property.city}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-brand">
                          {formatCurrency(property.price)}
                          <Badge variant="secondary">{categoryLabels[property.category]}</Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`Remover ${property.title}`}
                        disabled={remove.isPending}
                        onClick={() => {
                          if (window.confirm(`Remover "${property.title}" do site?`)) {
                            remove.mutate(property.id);
                          }
                        }}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <LeadsTable />
          </TabsContent>

          <TabsContent value="sobre" className="mt-6">
            <SobreForm />
          </TabsContent>

          <TabsContent value="senha" className="mt-6">
            <ChangePasswordCard />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function LeadsTable() {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();
  const { data, isPending, isError, error, isPlaceholderData, refetch, isFetching } = useQuery(
    leadsQueryOptions(page),
  );

  const clearAll = useMutation({
    mutationFn: () => clearAllLeads(),
    onSuccess: async () => {
      toast.success("Tabela de leads limpa com sucesso!");
      setPage(0);
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error: Error) =>
      toast.error("Não foi possível limpar a tabela", { description: error.message }),
  });

  const deleteSingleLead = useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: async () => {
      toast.success("Lead removido com sucesso!");
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error: Error) =>
      toast.error("Não foi possível excluir o lead", { description: error.message }),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / LEADS_PAGE_SIZE)) : 1;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl font-bold">
            Leads capturados{data ? ` (${data.total})` : ""}
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            disabled={isFetching}
            onClick={() => refetch()}
            title="Atualizar lista de leads"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Atualizando…" : "Atualizar"}
          </Button>
          {data && data.total > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={clearAll.isPending}
              onClick={() => {
                if (
                  window.confirm(
                    "Tem certeza de que deseja limpar toda a tabela de leads? Esta ação não pode ser desfeita.",
                  )
                ) {
                  clearAll.mutate();
                }
              }}
            >
              <Trash2 className="size-4" />
              {clearAll.isPending ? "Limpando…" : "Limpar tabela"}
            </Button>
          )}
        </div>
        {data && data.total > LEADS_PAGE_SIZE && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft /> Anteriores
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={isPlaceholderData || page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próximos <ChevronRight />
            </Button>
          </div>
        )}
      </div>

      {isPending && <p className="mt-6 text-sm text-muted-foreground">Carregando leads…</p>}

      {isError && (
        <p className="mt-6 text-sm text-destructive">
          Não foi possível carregar os leads: {error.message}
        </p>
      )}

      {data && data.leads.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          Nenhum lead registrado ainda. Eles aparecem aqui quando um visitante clicar em “Tenho
          interesse” em um imóvel.
        </p>
      )}

      {data && data.leads.length > 0 && (
        <div className="mt-4 max-w-[85%] overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Data/Hora</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Imóvel</TableHead>
                <TableHead className="whitespace-nowrap">Informações de Financiamento</TableHead>
                <TableHead className="whitespace-nowrap">WhatsApp</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead className="w-12 text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(new Date(lead.createdAt), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{lead.name || "Não informado"}</span>
                    {lead.message && (
                      <span className="mt-0.5 block max-w-52 truncate text-xs text-muted-foreground">
                        {lead.message}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.propertyTitle ? (
                      <>
                        {lead.propertySlug ? (
                          <Link
                            to="/imovel/$slug"
                            params={{ slug: lead.propertySlug }}
                            className="font-medium text-brand hover:underline"
                          >
                            {lead.propertyTitle}
                          </Link>
                        ) : (
                          <span className="font-medium">{lead.propertyTitle}</span>
                        )}
                        {lead.propertyRef && (
                          <span className="block text-xs text-muted-foreground">
                            Ref. {lead.propertyRef}
                          </span>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    <FinancingInfo lead={lead} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{lead.phone || "—"}</TableCell>

                  <TableCell className="whitespace-nowrap">{lead.source}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      title="Excluir lead"
                      disabled={deleteSingleLead.isPending}
                      onClick={() => {
                        if (window.confirm("Deseja realmente excluir este lead?")) {
                          deleteSingleLead.mutate(lead.id);
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Excluir lead</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

function FinancingInfo({
  lead,
}: {
  lead: { householdIncome: string; age: string; downPayment: string; fgts: string };
}) {
  const items = [
    { label: "Renda familiar", value: lead.householdIncome },
    { label: "Idade", value: lead.age },
    { label: "Entrada", value: lead.downPayment },
    { label: "FGTS", value: lead.fgts },
  ].filter((item) => item.value?.trim());

  if (items.length === 0) return <span className="text-muted-foreground">—</span>;

  return (
    <ul className="space-y-0.5 whitespace-nowrap">
      {items.map((item) => (
        <li key={item.label}>
          <span className="text-muted-foreground">{item.label}: </span>
          <span className="font-medium">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

function Field({
  label,
  id,
  hint,
  children,
}: {
  label: string;
  id: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!currentPassword) {
      toast.error("Informe a senha atual.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("A confirmação da nova senha não confere.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await adminChangePassword({
        data: { currentPassword, newPassword },
      });
      setIsSubmitting(false);
      if (result.ok) {
        toast.success(result.message || "Senha alterada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(result.message || "Não foi possível alterar a senha.");
      }
    } catch {
      setIsSubmitting(false);
      toast.error("Ocorreu um erro ao tentar alterar a senha. Tente novamente.");
    }
  }

  return (
    <section className="max-w-xl">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <KeyRound className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Alterar senha de acesso</h2>
            <p className="text-sm text-muted-foreground">
              Atualize a senha de acesso administrativo.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" autoComplete="off">
          <Field label="Senha atual" id="current-password">
            <Input
              id="current-password"
              name="current-password"
              type="password"
              required
              disabled={isSubmitting}
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Digite a senha atual"
            />
          </Field>

          <Field label="Nova senha" id="new-password" hint="Mínimo de 6 caracteres">
            <Input
              id="new-password"
              name="new-password"
              type="password"
              required
              disabled={isSubmitting}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha"
            />
          </Field>

          <Field label="Confirmar nova senha" id="confirm-password">
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              disabled={isSubmitting}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
            />
          </Field>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Salvando…" : "Salvar nova senha"}
          </Button>
        </form>
      </div>
    </section>
  );
}
