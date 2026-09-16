import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Award,
  Building2,
  CalendarClock,
  CalendarIcon,
  Check,
  CheckCircle2,
  Coins,
  Compass,
  CreditCard,
  FileCheck,
  Image as ImageIcon,
  Landmark,
  Layers,
  MapPin,
  MessageCircle,
  Percent,
  Plus,
  Ruler,
  ShieldCheck,
  Sparkles,
  Target,
  ThumbsUp,
  Trash2,
  TreePine,
  UserCheck,
  X,
  Youtube,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/site/ImageUploadField";
import { getYouTubeId } from "@/components/site/PropertyVideo";
import {
  BROKER_CHECKLIST_OPTIONS,
  DIFFERENTIAL_OPTIONS,
  LEISURE_OPTIONS,
  categoryLabels,
  cities,
  developers,
  getNeighborhoodsForCity,
  typeLabels,
  type PropertyCategory,
  type PropertyType,
} from "@/data/properties";
import type { PropertyFormValues } from "@/lib/properties.api";
import { slugify } from "@/lib/properties.api";
import { FINANCING_OPTIONS } from "@/lib/property-filters";

interface PropertyFormProps {
  form: PropertyFormValues;
  setForm: React.Dispatch<React.SetStateAction<PropertyFormValues>>;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function PropertyForm({ form, setForm, onSubmit, isPending }: PropertyFormProps) {
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const cityNeighborhoods = getNeighborhoodsForCity(form.city);
  const videoId = getYouTubeId(form.youtubeUrl);

  function set<K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setBrokerAnalysis<K extends keyof PropertyFormValues["brokerAnalysis"]>(
    key: K,
    value: PropertyFormValues["brokerAnalysis"][K],
  ) {
    setForm((prev) => ({
      ...prev,
      brokerAnalysis: {
        ...prev.brokerAnalysis,
        [key]: value,
      },
    }));
  }

  function toggleLeisure(item: string) {
    setForm((prev) => {
      const current = prev.leisure || [];
      const updated = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      return { ...prev, leisure: updated };
    });
  }

  function toggleBrokerChecklistItem(item: string) {
    setForm((prev) => {
      const current = prev.brokerAnalysis?.checkedItems || [];
      const updated = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      return {
        ...prev,
        brokerAnalysis: {
          ...prev.brokerAnalysis,
          checkedItems: updated,
        },
      };
    });
  }

  function toggleDifferential(item: string) {
    setForm((prev) => {
      const currentList = prev.features
        ? prev.features
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean)
        : [];
      const hasItem = currentList.includes(item);
      const updatedList = hasItem ? currentList.filter((i) => i !== item) : [...currentList, item];
      return { ...prev, features: updatedList.join(", ") };
    });
  }

  function toggleFinancing(option: string) {
    setForm((prev) => {
      const current = prev.financing || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, financing: updated };
    });
  }

  function addGalleryImage() {
    if (!newGalleryUrl.trim()) return;
    setForm((prev) => ({
      ...prev,
      galleryImages: [...(prev.galleryImages || []), newGalleryUrl.trim()],
    }));
    setNewGalleryUrl("");
  }

  function removeGalleryImage(index: number) {
    setForm((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, i) => i !== index),
    }));
  }

  const types: PropertyType[] = ["apartamento", "casa", "cobertura", "terreno"];
  const categories: PropertyCategory[] = ["lancamento", "na-planta", "pronto", "usado"];

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* 1. Informações Básicas do Empreendimento */}
      <FormSection
        icon={<Building2 className="size-5 text-brand" />}
        title="1. Identificação do Empreendimento"
        description="Nome, construtora responsável, categoria e referência cadastral"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome do empreendimento" id="title" required>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ex.: Reserva Paralela Clube"
            />
          </Field>

          <Field label="Construtora / Incorporadora" id="developer">
            <Select
              value={form.developerSlug}
              onValueChange={(value) => set("developerSlug", value)}
            >
              <SelectTrigger id="developer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {developers.map((d) => (
                  <SelectItem key={d.slug} value={d.slug}>
                    {d.name} ({d.kind})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Referência" id="ref" required hint="Código interno">
            <Input
              id="ref"
              required
              value={form.ref}
              onChange={(e) => set("ref", e.target.value)}
              placeholder="Ex.: RES-204"
            />
          </Field>

          <Field label="Categoria" id="category">
            <Select
              value={form.category}
              onValueChange={(value) => set("category", value as PropertyCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {categoryLabels[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Tipo de Imóvel" id="type">
            <Select value={form.type} onValueChange={(value) => set("type", value as PropertyType)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {typeLabels[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field
          label="Link da página (Slug)"
          id="slug"
          hint="Gerado automaticamente a partir do título"
        >
          <Input
            id="slug"
            readOnly
            disabled
            tabIndex={-1}
            value={slugify(form.title || "novo-imovel")}
            className="bg-muted/50 font-mono text-xs"
          />
        </Field>
      </FormSection>

      {/* 2. Localização & Mapa */}
      <FormSection
        icon={<MapPin className="size-5 text-brand" />}
        title="2. Bairro, Localização & Mapa"
        description="Endereço detalhado e termo de busca para renderização do Google Maps"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cidade" id="city" required hint="A lista de bairros muda conforme a cidade">
            <Select
              value={form.city}
              onValueChange={(value) => {
                setForm((prev) => ({
                  ...prev,
                  city: value,
                  neighborhood: getNeighborhoodsForCity(value).includes(prev.neighborhood)
                    ? prev.neighborhood
                    : "",
                }));
              }}
            >
              <SelectTrigger id="city">
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Bairro" id="neighborhood" required>
            <Select
              value={form.neighborhood}
              onValueChange={(value) => set("neighborhood", value)}
              disabled={cityNeighborhoods.length === 0}
            >
              <SelectTrigger id="neighborhood">
                <SelectValue
                  placeholder={
                    cityNeighborhoods.length === 0
                      ? "Escolha a cidade primeiro"
                      : `Selecione o bairro em ${form.city}`
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {cityNeighborhoods.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Localização / Endereço Completo"
            id="locationAddress"
            hint="Aparece na descrição e cabeçalho do imóvel"
          >
            <Input
              id="locationAddress"
              value={form.locationAddress}
              onChange={(e) => set("locationAddress", e.target.value)}
              placeholder="Ex.: Av. Luís Viana Filho, próximo à Estação Flamboyant"
            />
          </Field>

          <Field
            label="Termo para o Mapa (Google Maps)"
            id="mapQuery"
            hint="Se vazio, usa o endereço ou bairro cadastrado"
          >
            <Input
              id="mapQuery"
              value={form.mapQuery}
              onChange={(e) => set("mapQuery", e.target.value)}
              placeholder="Ex.: Shopping Paralela, Salvador - BA"
            />
          </Field>
        </div>
      </FormSection>

      {/* 3. Dimensões, Estrutura & Valores */}
      <FormSection
        icon={<Ruler className="size-5 text-brand" />}
        title="3. Dimensões, Estrutura & Valores"
        description="Área privativa, quartos, vagas e preço de venda"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Valor (R$)" id="price" required hint="Valor de venda ou a partir de">
            <Input
              id="price"
              type="number"
              min={0}
              required
              value={form.price}
              onChange={(e) => set("price", Number(e.target.value))}
              placeholder="250000"
            />
          </Field>

          <Field label="Área Privativa (m²)" id="area" required>
            <Input
              id="area"
              type="number"
              min={0}
              required
              value={form.area}
              onChange={(e) => set("area", Number(e.target.value))}
              placeholder="55"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Número de Quartos" id="bedrooms">
            <Input
              id="bedrooms"
              type="number"
              min={0}
              value={form.bedrooms}
              onChange={(e) => set("bedrooms", Number(e.target.value))}
            />
          </Field>

          <Field label="Banheiros" id="bathrooms">
            <Input
              id="bathrooms"
              type="number"
              min={0}
              value={form.bathrooms}
              onChange={(e) => set("bathrooms", Number(e.target.value))}
            />
          </Field>

          <Field label="Vagas de Garagem" id="parking">
            <Input
              id="parking"
              type="number"
              min={0}
              value={form.parking}
              onChange={(e) => set("parking", Number(e.target.value))}
            />
          </Field>
        </div>
      </FormSection>

      {/* 4. Fotos & Galeria */}
      <FormSection
        icon={<ImageIcon className="size-5 text-brand" />}
        title="4. Fotos & Galeria do Imóvel"
        description="Foto principal de capa e fotos complementares da galeria"
      >
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Foto Principal (Capa do Imóvel)</Label>
          <ImageUploadField
            value={{ url: form.image, thumbUrl: form.imageThumb }}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                image: value.url,
                imageThumb: value.thumbUrl,
              }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Foto exibida nos cartões, destaques e cabeçalho da página.
          </p>
        </div>

        <div className="space-y-3 pt-3 border-t border-border/80">
          <Label className="text-sm font-semibold">Fotos Adicionais da Galeria</Label>
          <div className="flex gap-2">
            <Input
              value={newGalleryUrl}
              onChange={(e) => setNewGalleryUrl(e.target.value)}
              placeholder="Insira o link da foto (URL) e clique em Adicionar"
              className="text-xs"
            />
            <Button type="button" variant="outline" size="sm" onClick={addGalleryImage}>
              <Plus className="size-4" /> Adicionar
            </Button>
          </div>

          {form.galleryImages && form.galleryImages.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {form.galleryImages.map((imgUrl, idx) => (
                <div
                  key={`${imgUrl}-${idx}`}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted/40"
                >
                  <img
                    src={imgUrl}
                    alt={`Foto adicional ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute right-1.5 top-1.5 rounded-full bg-red-600 p-1 text-white opacity-90 transition-opacity hover:opacity-100"
                    title="Remover foto"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormSection>

      {/* 4b. Vídeo do YouTube */}
      <FormSection
        icon={<Youtube className="size-5 text-brand" />}
        title="Vídeo do YouTube (opcional)"
        description="Cole o link do vídeo. O quadro de vídeo fica oculto na página quando não houver link."
      >
        <Field
          label="Link do vídeo no YouTube"
          id="youtubeUrl"
          hint="Aceita youtube.com/watch?v=..., youtu.be/... ou /shorts/..."
        >
          <Input
            id="youtubeUrl"
            value={form.youtubeUrl}
            onChange={(e) => set("youtubeUrl", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
          />
        </Field>

        {form.youtubeUrl.trim().length > 0 &&
          (videoId ? (
            <div className="overflow-hidden rounded-xl border border-border bg-black">
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                  title="Pré-visualização do vídeo"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">
                Link inválido. Use um endereço de vídeo do YouTube.
              </AlertDescription>
            </Alert>
          ))}
      </FormSection>

      {/* 5. Lazer & Diferenciais */}
      <FormSection
        icon={<TreePine className="size-5 text-brand" />}
        title="5. Lazer & Diferenciais"
        description="Espaços de convivência do condomínio e acabamentos da unidade"
      >
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">
            Itens de Lazer do Condomínio
          </Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {LEISURE_OPTIONS.map((item) => {
              const isChecked = (form.leisure || []).includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleLeisure(item)}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs font-medium transition-all ${
                    isChecked
                      ? "border-brand bg-brand/10 text-brand font-semibold shadow-xs"
                      : "border-border/70 bg-card hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                      isChecked ? "border-brand bg-brand text-white" : "border-muted-foreground/40"
                    }`}
                  >
                    {isChecked && <Check className="size-3" />}
                  </div>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border/80">
          <Label className="text-sm font-semibold text-foreground">
            Diferenciais do Imóvel / Projeto
          </Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DIFFERENTIAL_OPTIONS.map((item) => {
              const featuresList = form.features
                ? form.features.split(",").map((f) => f.trim())
                : [];
              const isChecked = featuresList.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleDifferential(item)}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs font-medium transition-all ${
                    isChecked
                      ? "border-brand bg-brand/10 text-brand font-semibold shadow-xs"
                      : "border-border/70 bg-card hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                      isChecked ? "border-brand bg-brand text-white" : "border-muted-foreground/40"
                    }`}
                  >
                    {isChecked && <Check className="size-3" />}
                  </div>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>

          <Field label="Outros Diferenciais (separados por vírgula)" id="features">
            <Input
              id="features"
              value={form.features}
              onChange={(e) => set("features", e.target.value)}
              placeholder="Varanda gourmet, Piso porcelanato, Tomadas USB"
            />
          </Field>
        </div>

        <Field label="Descrição Geral do Empreendimento" id="description" required>
          <Textarea
            id="description"
            rows={4}
            required
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Apresente os detalhes do condomínio, vantagens da planta e localização..."
          />
        </Field>
      </FormSection>

      {/* 6. Condições Comerciais, Entrada & Financiamento */}
      <FormSection
        icon={<Coins className="size-5 text-brand" />}
        title="6. Condições Comerciais, Entrada & Financiamento"
        description="Previsão de entrega, parcelamento de entrada, MCMV, FGTS e modalidades"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Previsão de Entrega"
            id="delivery"
            hint="Selecione no calendário ou informe no texto"
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="delivery"
                  type="button"
                  variant="outline"
                  className="w-full justify-start font-normal"
                >
                  <CalendarIcon className="size-4 mr-2" />
                  {form.deliveryDate
                    ? format(new Date(`${form.deliveryDate}T12:00:00`), "dd/MM/yyyy")
                    : "Escolher data no calendário"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  locale={ptBR}
                  disabled={{ before: new Date() }}
                  defaultMonth={
                    form.deliveryDate ? new Date(`${form.deliveryDate}T12:00:00`) : new Date()
                  }
                  selected={
                    form.deliveryDate ? new Date(`${form.deliveryDate}T12:00:00`) : undefined
                  }
                  onSelect={(date) => set("deliveryDate", date ? format(date, "yyyy-MM-dd") : "")}
                />
              </PopoverContent>
            </Popover>
          </Field>

          <Field
            label="Destaque Promocional"
            id="highlight"
            hint="Ex.: Entrada em até 60x / ITIV Grátis"
          >
            <Input
              id="highlight"
              value={form.highlight}
              onChange={(e) => set("highlight", e.target.value)}
              placeholder="Ex.: Entrada em até 60x sem juros"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Entrada Facilitada"
            id="downPaymentInfo"
            hint="Informações sobre sinal e parcelamento"
          >
            <Input
              id="downPaymentInfo"
              value={form.downPaymentInfo}
              onChange={(e) => set("downPaymentInfo", e.target.value)}
              placeholder="Ex.: Sinal a partir de R$ 1.500 + 48x"
            />
          </Field>

          <Field
            label="Condições Comerciais"
            id="commercialConditions"
            hint="Descontos, ITIV, bônus de escritura"
          >
            <Input
              id="commercialConditions"
              value={form.commercialConditions}
              onChange={(e) => set("commercialConditions", e.target.value)}
              placeholder="Ex.: ITIV + Registro grátis pela construtora"
            />
          </Field>
        </div>

        {/* Switches para MCMV e FGTS */}
        <div className="grid gap-4 rounded-xl border border-border/80 bg-secondary/30 p-4 sm:grid-cols-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Percent className="size-4 text-emerald-600" />
                <span>Minha Casa Minha Vida (MCMV)</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Habilita o selo e condições de subsídio Caixa
              </p>
            </div>
            <Switch
              checked={form.minhaCasaMinhaVida}
              onCheckedChange={(checked) => set("minhaCasaMinhaVida", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <FileCheck className="size-4 text-indigo-600" />
                <span>Aceita FGTS</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Permite amortização ou uso do saldo na entrada
              </p>
            </div>
            <Switch
              checked={form.acceptsFgts}
              onCheckedChange={(checked) => set("acceptsFgts", checked)}
            />
          </div>
        </div>

        {/* Tipos de Financiamento */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Tipos de Financiamento Aceitos</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {FINANCING_OPTIONS.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 rounded-lg border border-border/70 bg-card p-2.5 text-xs text-foreground cursor-pointer hover:bg-muted/30"
              >
                <Checkbox
                  checked={(form.financing || []).includes(option)}
                  onCheckedChange={() => toggleFinancing(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      </FormSection>

      {/* 7. WhatsApp Personalizado por Imóvel */}
      <FormSection
        icon={<MessageCircle className="size-5 text-whatsapp" />}
        title="7. Link do Botão WhatsApp (Rastreamento de Origem)"
        description="Personalize o link ou mensagem para saber exatamente de qual anúncio ou página o cliente veio"
      >
        <Field
          label="Link Personalizado do WhatsApp (URL Completa)"
          id="customWhatsAppUrl"
          hint="Ex.: https://wa.me/5571999999999?text=Quero%20a%20tabela%20do%20Reserva%20Paralela"
        >
          <Input
            id="customWhatsAppUrl"
            value={form.customWhatsAppUrl}
            onChange={(e) => set("customWhatsAppUrl", e.target.value)}
            placeholder="Deixe em branco para usar o WhatsApp padrão automático"
          />
        </Field>

        <Field
          label="Mensagem Personalizada de Origem"
          id="customWhatsAppMessage"
          hint="Texto que virá pré-digitado quando o cliente clicar no botão"
        >
          <Textarea
            id="customWhatsAppMessage"
            rows={2}
            value={form.customWhatsAppMessage}
            onChange={(e) => set("customWhatsAppMessage", e.target.value)}
            placeholder="Olá Moreira! Vim pela página do Reserva Paralela e gostaria de simular meu financiamento..."
          />
        </Field>
      </FormSection>

      {/* 8. Minha Análise como Corretor */}
      <FormSection
        icon={<Award className="size-5 text-brand" />}
        title="8. Minha Análise como Corretor (Moreira - CRECI-BA 32.373)"
        description="Espaço de autoridade profissional com itens verificados para ticar e 7 tópicos comentados"
      >
        {/* Checklist de Itens Ticados */}
        <div className="space-y-3">
          <Label className="text-sm font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="size-4" />
            <span>Itens para Ticar e Relacionar ao Imóvel (Selo de Qualidade do Corretor)</span>
          </Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {BROKER_CHECKLIST_OPTIONS.map((item) => {
              const isChecked = (form.brokerAnalysis?.checkedItems || []).includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleBrokerChecklistItem(item)}
                  className={`flex items-center gap-2.5 rounded-lg border p-3 text-left text-xs transition-all ${
                    isChecked
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-semibold"
                      : "border-border/70 bg-card hover:bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                      isChecked
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {isChecked && <Check className="size-3" />}
                  </div>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tópicos da Análise */}
        <div className="mt-6 space-y-4 pt-4 border-t border-border/80">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* 1. Para quem o imóvel é indicado? */}
            <Field
              label="🎯 Para quem o imóvel é indicado?"
              id="recommendedFor"
              hint="Perfil de morador, investidor ou famílias"
            >
              <Textarea
                id="recommendedFor"
                rows={3}
                value={form.brokerAnalysis?.recommendedFor || ""}
                onChange={(e) => setBrokerAnalysis("recommendedFor", e.target.value)}
                placeholder="Ex.: Famílias que buscam lazer completo e segurança de condomínio fechado, ou casais comprando seu primeiro imóvel."
              />
            </Field>

            {/* 2. Perfil ideal do comprador */}
            <Field
              label="👤 Perfil ideal do comprador"
              id="idealBuyerProfile"
              hint="Renda familiar, prioridades e estilo de vida"
            >
              <Textarea
                id="idealBuyerProfile"
                rows={3}
                value={form.brokerAnalysis?.idealBuyerProfile || ""}
                onChange={(e) => setBrokerAnalysis("idealBuyerProfile", e.target.value)}
                placeholder="Ex.: Renda familiar a partir de R$ 4.000, com preferência por localização com comércio a pé."
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* 3. Pontos positivos */}
            <Field
              label="👍 Pontos positivos"
              id="positivePoints"
              hint="Vantagens construtivas, lazer, planta e valorização"
            >
              <Textarea
                id="positivePoints"
                rows={3}
                value={form.brokerAnalysis?.positivePoints || ""}
                onChange={(e) => setBrokerAnalysis("positivePoints", e.target.value)}
                placeholder="Ex.: Excelente relação custo/m², construtora com histórico de entrega rigorosamente no prazo."
              />
            </Field>

            {/* 4. Pontos de atenção */}
            <Field
              label="⚠️ Pontos de atenção (Transparência do Corretor)"
              id="attentionPoints"
              hint="Cuidados com incidência de sol, vagas ou custos extras"
            >
              <Textarea
                id="attentionPoints"
                rows={3}
                value={form.brokerAnalysis?.attentionPoints || ""}
                onChange={(e) => setBrokerAnalysis("attentionPoints", e.target.value)}
                placeholder="Ex.: Atenção na escolha das unidades poente e reserva necessária para despesas de ITIV."
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* 5. Localização */}
            <Field
              label="📍 Localização & Entorno"
              id="locationEvaluation"
              hint="Mobilidade, comércio, transporte e valorização do bairro"
            >
              <Textarea
                id="locationEvaluation"
                rows={3}
                value={form.brokerAnalysis?.locationEvaluation || ""}
                onChange={(e) => setBrokerAnalysis("locationEvaluation", e.target.value)}
                placeholder="Ex.: Região com forte crescimento imobiliário, a 5 minutos da estação de metrô e supermercados."
              />
            </Field>

            {/* 6. Relação custo-benefício */}
            <Field
              label="💰 Relação custo-benefício"
              id="costBenefit"
              hint="Preço por m² e potencial de retorno"
            >
              <Textarea
                id="costBenefit"
                rows={3}
                value={form.brokerAnalysis?.costBenefit || ""}
                onChange={(e) => setBrokerAnalysis("costBenefit", e.target.value)}
                placeholder="Ex.: Um dos melhores custos por m² da região para apartamentos novos com vaga demarcada."
              />
            </Field>
          </div>

          {/* 7. Possibilidade de financiamento */}
          <Field
            label="🏦 Possibilidade de financiamento & FGTS"
            id="financingPotential"
            hint="Dicas sobre aprovação de crédito, renda necessária e subsídios"
          >
            <Textarea
              id="financingPotential"
              rows={3}
              value={form.brokerAnalysis?.financingPotential || ""}
              onChange={(e) => setBrokerAnalysis("financingPotential", e.target.value)}
              placeholder="Ex.: Enquadramento completo no programa Minha Casa Minha Vida com subsídio governamental e uso total do FGTS."
            />
          </Field>

          {/* Observações gerais */}
          <Field
            label="📝 Nota pessoal / Comentário adicional do corretor"
            id="brokerNotes"
            hint="Mensagem personalizada de Moreira"
          >
            <Textarea
              id="brokerNotes"
              rows={2}
              value={form.brokerAnalysis?.brokerNotes || ""}
              onChange={(e) => setBrokerAnalysis("brokerNotes", e.target.value)}
              placeholder="Ex.: Recomendo agendar uma visita ao decorado para conhecer a qualidade dos acabamentos."
            />
          </Field>
        </div>
      </FormSection>

      {/* Submit Button */}
      <div className="sticky bottom-4 z-20 rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-md">
        <Button
          type="submit"
          size="xl"
          className="w-full gap-2 font-bold shadow-md"
          disabled={isPending}
        >
          <Plus className="size-5" />
          <span>{isPending ? "Publicando imóvel no site..." : "Publicar Imóvel Completo"}</span>
        </Button>
      </div>
    </form>
  );
}

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-7">
      <div className="mb-5 flex items-start gap-3 border-b border-border/80 pb-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/10">
          {icon}
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground sm:text-lg">{title}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  id,
  hint,
  required,
  children,
}: {
  label: string;
  id: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-semibold text-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
