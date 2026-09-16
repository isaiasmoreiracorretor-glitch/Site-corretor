import { useEffect, useMemo, useState } from "react";
import { Calculator, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { insertLead } from "@/lib/leads.api";
import { openWhatsApp } from "@/lib/whatsapp";

type FinancingForm = {
  rendaFamiliar: string;
  idade: string;
  entradaDisponivel: string;
  fgts: string;
  quartos: string;
  bairro: string;
  valorImovel: string;
};

type SimulationResult = {
  score: number;
  perfil: string;
  capacidade: number;
  entradaSugerida: number;
  parcela: number;
  mensagem: string;
};

const STORAGE_KEY = "moreira-financing-simulator";
const STORAGE_RESULT_KEY = "moreira-financing-simulation-result";

const defaultForm: FinancingForm = {
  rendaFamiliar: "",
  idade: "",
  entradaDisponivel: "",
  fgts: "",
  quartos: "",
  bairro: "",
  valorImovel: "",
};

const numberFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function parseCurrency(value: string) {
  const sanitized = value.replace(/[R$.\s]/g, "").replace(",", ".");
  const parsed = Number(sanitized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildSimulationMessage(form: FinancingForm, simulation: SimulationResult) {
  return [
    "Olá Moreira! Quero analisar meu perfil para financiamento.",
    "",
    `*Renda familiar:* ${numberFormatter.format(parseCurrency(form.rendaFamiliar))}`,
    `*Idade:* ${form.idade} anos`,
    `*Entrada disponível:* ${numberFormatter.format(parseCurrency(form.entradaDisponivel))}`,
    `*FGTS:* ${numberFormatter.format(parseCurrency(form.fgts))}`,
    `*Quartos:* ${form.quartos}`,
    `*Bairro desejado:* ${form.bairro}`,
    `*Valor aproximado do imóvel:* ${numberFormatter.format(parseCurrency(form.valorImovel))}`,
    "",
    `*Simulação estimada:* ${simulation.perfil} com score ${simulation.score}/100`,
    `*Capacidade estimada:* ${numberFormatter.format(simulation.capacidade)}`,
    `*Entrada sugerida:* ${numberFormatter.format(simulation.entradaSugerida)}`,
    `*Parcela aproximada:* ${numberFormatter.format(simulation.parcela)}`,
    `*Observação:* ${simulation.mensagem}`,
  ].join("\n");
}

function generateSimulation(form: FinancingForm): SimulationResult {
  const renda = parseCurrency(form.rendaFamiliar);
  const idade = Number(form.idade || 0);
  const entrada = parseCurrency(form.entradaDisponivel);
  const fgts = parseCurrency(form.fgts);
  const quartos = Number(form.quartos || 0);
  const valorImovel = parseCurrency(form.valorImovel);

  const capacidadeBase = Math.max(0, renda * 6.5);
  const score = clamp(
    (renda / 12000) * 24 +
      (entrada / 150000) * 20 +
      (fgts / 90000) * 16 +
      (idade >= 22 && idade <= 55 ? 18 : 8) +
      (quartos >= 2 ? 12 : 6) +
      (valorImovel > 0 ? 10 : 0),
    0,
    100,
  );

  const perfil =
    score >= 75 ? "Perfil forte" : score >= 55 ? "Perfil viável" : "Perfil em avaliação";
  const capacidade = Math.min(capacidadeBase, valorImovel * 0.8 || capacidadeBase);
  const entradaSugerida = Math.max(0, valorImovel * 0.2);
  const parcela = Math.max(0, Math.min(capacidade * 0.0085, renda * 0.35));
  const mensagem =
    score >= 75
      ? "Você aparece com boa capacidade de pagamento e pode ter mais opções de financiamento."
      : score >= 55
        ? "Seu perfil está dentro de uma faixa aceitável para análise, com ajuste de entrada ou prazo."
        : "A simulação sugere revisar a entrada, o prazo ou a faixa de imóvel para melhorar o perfil.";

  return {
    score: Math.round(score),
    perfil,
    capacidade,
    entradaSugerida,
    parcela,
    mensagem,
  };
}

export function FinancingSimulator() {
  const [form, setForm] = useState<FinancingForm>(() => {
    if (typeof window === "undefined") return defaultForm;

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultForm, ...JSON.parse(saved) } : defaultForm;
    } catch {
      return defaultForm;
    }
  });
  const [simulation, setSimulation] = useState<SimulationResult | null>(() => {
    if (typeof window === "undefined") return null;

    try {
      const saved = window.localStorage.getItem(STORAGE_RESULT_KEY);
      return saved ? (JSON.parse(saved) as SimulationResult) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    }
  }, [form]);

  const summaryText = useMemo(() => {
    if (!simulation) return "Ainda não houve simulação.";
    return `${simulation.perfil} • Score ${simulation.score}/100`;
  }, [simulation]);

  const handleFieldChange = (key: keyof FinancingForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredFields = Object.values(form).every((value) => String(value).trim() !== "");

    if (!requiredFields) {
      toast.error("Preencha todas as informações para gerar a simulação.");
      return;
    }

    const next = generateSimulation(form);
    setSimulation(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_RESULT_KEY, JSON.stringify(next));
    }
  };

  const handleContact = () => {
    if (!simulation) return;
    insertLead({
      name: "",
      message: `Simulação de financiamento realizada: Renda ${form.rendaFamiliar ? `R$ ${form.rendaFamiliar}` : ""}, Entrada R$ ${form.entradaDisponivel}, Imóvel R$ ${form.valorImovel}, Bairro ${form.bairro || "Não informado"}`,
      source: "Simulador de Financiamento",
      financing: {
        householdIncome: form.rendaFamiliar,
        age: form.idade,
        downPayment: form.entradaDisponivel,
        fgts: form.fgts,
      },
    }).catch((e) => console.warn("Erro ao registrar lead do simulador:", e));
    openWhatsApp(buildSimulationMessage(form, simulation));
  };

  return (
    <div
      id="simulacao-financiamento"
      className="gradient-brand rounded-3xl px-6 py-8 text-center text-brand-foreground md:px-8 md:py-12"
    >
      <ShieldCheck className="mx-auto size-11 text-accent" />
      <h2 className="mt-4 font-display text-3xl font-bold leading-tight md:text-4xl">
        Simulação de financiamento
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-brand-foreground/80 md:text-base">
        Descubra hoje quanto você pode financiar, se tem direito a subsídio do Minha Casa Minha Vida
        e quanto precisa de entrada.
      </p>

      <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-4xl space-y-6 text-left">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="renda-familiar" className="text-sm font-medium text-brand-foreground">
              Renda familiar
            </Label>
            <Input
              id="renda-familiar"
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.rendaFamiliar}
              onChange={(event) => handleFieldChange("rendaFamiliar", event.target.value)}
              placeholder="Ex.: 6500"
              className="border-white/25 bg-white/5 text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idade" className="text-sm font-medium text-brand-foreground">
              Idade
            </Label>
            <Input
              id="idade"
              type="number"
              min="18"
              max="80"
              value={form.idade}
              onChange={(event) => handleFieldChange("idade", event.target.value)}
              placeholder="Ex.: 32"
              className="border-white/25 bg-white/5 text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entrada" className="text-sm font-medium text-brand-foreground">
              Valor disponível para entrada
            </Label>
            <Input
              id="entrada"
              type="number"
              min="0"
              step="1000"
              value={form.entradaDisponivel}
              onChange={(event) => handleFieldChange("entradaDisponivel", event.target.value)}
              placeholder="Ex.: 30000"
              className="border-white/25 bg-white/5 text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fgts" className="text-sm font-medium text-brand-foreground">
              FGTS
            </Label>
            <Input
              id="fgts"
              type="number"
              min="0"
              step="1000"
              value={form.fgts}
              onChange={(event) => handleFieldChange("fgts", event.target.value)}
              placeholder="Ex.: 15000"
              className="border-white/25 bg-white/5 text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quartos" className="text-sm font-medium text-brand-foreground">
              Quantidade de quartos
            </Label>
            <Input
              id="quartos"
              type="number"
              min="1"
              max="6"
              value={form.quartos}
              onChange={(event) => handleFieldChange("quartos", event.target.value)}
              placeholder="Ex.: 2"
              className="border-white/25 bg-white/5 text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bairro" className="text-sm font-medium text-brand-foreground">
              Bairro desejado
            </Label>
            <Input
              id="bairro"
              type="text"
              value={form.bairro}
              onChange={(event) => handleFieldChange("bairro", event.target.value)}
              placeholder="Ex.: Itapuã"
              className="border-white/25 bg-white/5 text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2 md:col-span-2 xl:col-span-3">
            <Label htmlFor="valor-imovel" className="text-sm font-medium text-brand-foreground">
              Valor aproximado do imóvel
            </Label>
            <Input
              id="valor-imovel"
              type="number"
              min="0"
              step="10000"
              value={form.valorImovel}
              onChange={(event) => handleFieldChange("valorImovel", event.target.value)}
              placeholder="Ex.: 420000"
              className="border-white/25 bg-white/5 text-white placeholder:text-white/50"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Button type="submit" variant="whatsapp" size="xl" className="min-w-[260px]">
            <WhatsAppIcon /> Quero analisar meu perfil
          </Button>

          {simulation && (
            <div className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-brand-foreground/90 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 font-semibold">
                <Calculator className="size-4 text-accent" />
                {summaryText}
              </div>
            </div>
          )}
        </div>

        {simulation && (
          <div className="grid gap-3 rounded-2xl border border-white/20 bg-white/5 p-4 text-brand-foreground/90 md:grid-cols-3">
            <div className="rounded-xl bg-[#0f3b4d]/30 p-3">
              <div className="text-xs uppercase tracking-wide text-brand-foreground/70">
                Capacidade estimada
              </div>
              <div className="mt-2 font-display text-2xl font-bold">
                {numberFormatter.format(simulation.capacidade)}
              </div>
            </div>
            <div className="rounded-xl bg-[#0f3b4d]/30 p-3">
              <div className="text-xs uppercase tracking-wide text-brand-foreground/70">
                Entrada sugerida
              </div>
              <div className="mt-2 font-display text-2xl font-bold">
                {numberFormatter.format(simulation.entradaSugerida)}
              </div>
            </div>
            <div className="rounded-xl bg-[#0f3b4d]/30 p-3">
              <div className="text-xs uppercase tracking-wide text-brand-foreground/70">
                Parcela aproximada
              </div>
              <div className="mt-2 font-display text-2xl font-bold">
                {numberFormatter.format(simulation.parcela)}
              </div>
            </div>
          </div>
        )}

        {simulation && (
          <>
            <div className="rounded-2xl border border-white/20 bg-[#0d3240]/25 p-4 text-sm text-brand-foreground/90">
              <div className="flex items-center gap-2 font-semibold text-brand-foreground">
                <MapPin className="size-4 text-accent" />
                Resultado da simulação
              </div>
              <p className="mt-2">{simulation.mensagem}</p>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="whatsapp"
                size="xl"
                onClick={handleContact}
                className="min-w-[230px]"
              >
                <WhatsAppIcon /> Fale com o corretor
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
