import { useMemo, useState } from "react";

import { PropertyFilters } from "@/components/site/PropertyFilters";
import { PropertyGrid } from "@/components/site/PropertyGrid";
import type { Property } from "@/data/properties";
import {
  applyPropertyFilters,
  createEmptyFilters,
  maxPriceOf,
  type PropertyFilterState,
} from "@/lib/property-filters";

export function PropertyExplorer({ properties }: { properties: Property[] }) {
  const maxPrice = useMemo(() => maxPriceOf(properties), [properties]);
  const [filters, setFilters] = useState<PropertyFilterState>(() => createEmptyFilters(maxPrice));

  const filtered = useMemo(() => applyPropertyFilters(properties, filters), [properties, filters]);

  return (
    <div className="space-y-8">
      <PropertyFilters
        properties={properties}
        state={filters}
        maxPrice={maxPrice}
        resultCount={filtered.length}
        onChange={setFilters}
        onReset={() => setFilters(createEmptyFilters(maxPrice))}
      />

      <PropertyGrid properties={filtered} />
    </div>
  );
}
