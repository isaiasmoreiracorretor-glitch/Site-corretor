import { PropertyCard } from "@/components/site/PropertyCard";
import type { Property } from "@/data/properties";

export function PropertyGrid({ properties }: { properties: Property[] }) {
  if (properties.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <p className="font-semibold">Nenhum imóvel encontrado com esses filtros.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tente ampliar a faixa de preço ou escolher outra cidade.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
