import { useMemo } from "react";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Slider } from "@/components/ui/slider";
import type { Property } from "@/data/properties";
import { formatCurrency } from "@/lib/format";
import {
  ALL,
  FEATURE_OPTIONS,
  deriveFilterOptions,
  toggle,
  type FilterOption,
  type PropertyFilterState,
} from "@/lib/property-filters";

interface PropertyFiltersProps {
  properties: Property[];
  state: PropertyFilterState;
  maxPrice: number;
  resultCount: number;
  onChange: (next: PropertyFilterState) => void;
  onReset: () => void;
}

export function PropertyFilters({
  properties,
  state,
  maxPrice,
  resultCount,
  onChange,
  onReset,
}: PropertyFiltersProps) {
  const options = useMemo(() => deriveFilterOptions(properties), [properties]);

  function set<K extends keyof PropertyFilterState>(key: K, value: PropertyFilterState[K]) {
    onChange({ ...state, [key]: value });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <SlidersHorizontal className="size-4 text-brand" /> Filtrar imóveis
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="busca">Bairro, cidade ou código</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="busca"
              value={state.query}
              onChange={(e) => set("query", e.target.value)}
              placeholder="Ex.: Pituba"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Cidade</Label>
          <Select value={state.city} onValueChange={(value) => set("city", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as cidades</SelectItem>
              {options.cities.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Construtora</Label>
          <Select value={state.developer} onValueChange={(value) => set("developer", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas</SelectItem>
              {options.developers.map((option) => (
                <SelectItem key={option.slug} value={option.slug}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quartos">Quartos</Label>
          <Input
            id="quartos"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Qualquer"
            value={state.bedrooms === ALL ? "" : state.bedrooms}
            onChange={(event) => {
              const nextValue = event.target.value.replace(/\D/g, "");
              set("bedrooms", nextValue ? nextValue : ALL);
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-x-8 gap-y-5 border-t border-border pt-5 md:grid-cols-2">
        <MultiSelectDropdown
          legend="Tipo de imóvel"
          placeholder="Todos os tipos"
          items={options.types}
          selected={state.types}
          onToggle={(value) => set("types", toggle(state.types, value))}
        />
        <SingleSelectDropdown
          legend="Bairro"
          placeholder="Todos os bairros"
          items={options.neighborhoods}
          selected={state.neighborhoods}
          onSelect={(value) => set("neighborhoods", value)}
        />
        <MultiSelectDropdown
          legend="Características"
          placeholder="Todas as características"
          items={FEATURE_OPTIONS.map((f) => ({ value: f.id, label: f.label }))}
          selected={state.features}
          onToggle={(value) => set("features", toggle(state.features, value))}
        />
        <SingleSelectDropdown
          legend="Tipo de financiamento"
          placeholder="Todos os financiamentos"
          items={options.financing}
          selected={state.financing}
          onSelect={(value) => set("financing", value)}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 md:flex-row md:items-center md:justify-between">
        <div className="w-full max-w-md space-y-2">
          <Label>Valor até {formatCurrency(state.priceLimit)}</Label>
          <Slider
            value={[state.priceLimit]}
            min={100000}
            max={maxPrice}
            step={5000}
            onValueChange={(value) => set("priceLimit", value[0] ?? maxPrice)}
          />
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {resultCount} de {properties.length} imóveis
          </p>
          <Button variant="soft" onClick={onReset}>
            Limpar filtros
          </Button>
        </div>
      </div>
    </div>
  );
}

function MultiSelectDropdown({
  legend,
  placeholder,
  items,
  selected,
  onToggle,
}: {
  legend: string;
  placeholder: string;
  items: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (items.length === 0) return null;

  const summary =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? (items.find((item) => item.value === selected[0])?.label ?? placeholder)
        : `${selected.length} selecionados`;

  return (
    <div className="space-y-2">
      <Label>{legend}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-between gap-3">
            <span className="truncate text-left">{summary}</span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-2">
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {items.map((item) => {
              const checked = selected.includes(item.value);
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onToggle(item.value)}
                  className={
                    "flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent " +
                    (checked ? "bg-accent/80" : "")
                  }
                >
                  <span>{item.label}</span>
                  <span
                    className={
                      "flex size-4 items-center justify-center rounded-sm border text-[10px] font-bold " +
                      (checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/50 bg-transparent")
                    }
                  >
                    {checked ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function SingleSelectDropdown({
  legend,
  placeholder,
  items,
  selected,
  onSelect,
}: {
  legend: string;
  placeholder: string;
  items: FilterOption[];
  selected: string[];
  onSelect: (value: string[]) => void;
}) {
  if (items.length === 0) return null;

  const value = selected[0] ?? ALL;

  return (
    <div className="space-y-2">
      <Label>{legend}</Label>
      <Select
        value={value}
        onValueChange={(nextValue) => onSelect(nextValue === ALL ? [] : [nextValue])}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos</SelectItem>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
