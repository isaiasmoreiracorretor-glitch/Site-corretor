import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { insertLead, type LeadPropertyContext } from "@/lib/leads.api";
import { buildLeadMessage, openWhatsApp } from "@/lib/whatsapp";

interface LeadDialogProps {
  trigger: ReactNode;
  /** Dados do imóvel de origem — quando presente, o lead fica associado a ele. */
  property?: LeadPropertyContext;
  defaultInterest?: string;
}

export function LeadDialog({ trigger, property, defaultInterest }: LeadDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [householdIncome, setHouseholdIncome] = useState("");
  const [age, setAge] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [fgts, setFgts] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const leadInput = {
      name: name.trim(),
      phone: phone.trim(),
      message: message.trim(),
      financing: {
        householdIncome: householdIncome.trim(),
        age: age.trim(),
        downPayment: downPayment.trim(),
        fgts: fgts.trim(),
      },
      source: property ? "Página do imóvel" : (defaultInterest ?? "Site"),
      ...(property ? { property } : {}),
    };

    // O redirecionamento para o WhatsApp nunca é bloqueado: se o registro
    // falhar, avisamos mas deixamos o usuário prosseguir.
    setSaving(true);
    try {
      await insertLead(leadInput);
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
    } catch (error) {
      console.error("[LeadDialog] Erro ao inserir lead:", error);
      toast.error("Não foi possível registrar seu interesse agora.", {
        description:
          error instanceof Error ? error.message : "Você já pode falar com o corretor normalmente.",
      });
    } finally {
      setSaving(false);
    }

    const text = buildLeadMessage(
      {
        ...(leadInput.name ? { name: leadInput.name } : {}),
        ...(leadInput.phone ? { phone: leadInput.phone } : {}),
        ...(leadInput.message ? { message: leadInput.message } : {}),
        financing: leadInput.financing,
        ...(defaultInterest ? { interest: defaultInterest } : {}),
      },
      property?.title,
      property?.ref,
    );
    openWhatsApp(text);
    setOpen(false);
    setName("");
    setPhone("");
    setHouseholdIncome("");
    setAge("");
    setDownPayment("");
    setFgts("");
    setMessage("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Falar com o corretor</DialogTitle>
          <DialogDescription>
            {property
              ? `Deixe seu nome (opcional) e continue a conversa sobre ${property.title} no WhatsApp.`
              : "Deixe seu nome (opcional) e continue a conversa no WhatsApp."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lead-name">Nome (opcional)</Label>
            <Input
              id="lead-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como podemos te chamar?"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-phone">Telefone / WhatsApp</Label>
            <Input
              id="lead-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(71) 90000-0000"
              autoComplete="tel"
              inputMode="tel"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lead-household-income">Renda Familiar</Label>
              <Input
                id="lead-household-income"
                value={householdIncome}
                onChange={(e) => setHouseholdIncome(e.target.value)}
                placeholder="Ex.: R$ 6.500"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-age">Idade</Label>
              <Input
                id="lead-age"
                type="number"
                min="18"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ex.: 32"
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-down-payment">Valor entrada</Label>
              <Input
                id="lead-down-payment"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                placeholder="Ex.: R$ 30.000"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-fgts">Fgts</Label>
              <Input
                id="lead-fgts"
                value={fgts}
                onChange={(e) => setFgts(e.target.value)}
                placeholder="Ex.: R$ 15.000"
                inputMode="decimal"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-message">Mensagem (opcional)</Label>
            <Textarea
              id="lead-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex.: quero saber sobre entrada e financiamento."
              rows={3}
            />
          </div>
          <Button type="submit" variant="whatsapp" size="lg" className="w-full" disabled={saving}>
            <WhatsAppIcon /> {saving ? "Registrando…" : "Continuar no WhatsApp"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Seus dados são usados apenas para o atendimento.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
