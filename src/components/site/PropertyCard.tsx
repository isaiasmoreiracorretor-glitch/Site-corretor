import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Car, MapPin, Ruler } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadDialog } from "@/components/site/LeadDialog";
import { categoryLabels, getDeveloper, type Property } from "@/data/properties";
import { formatArea, formatCurrency } from "@/lib/format";

export function PropertyCard({ property }: { property: Property }) {
  const developer = getDeveloper(property.developerSlug);

  return (
    <article className="card-listing flex flex-col">
      <Link
        to="/imovel/$slug"
        params={{ slug: property.slug }}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <img
          src={property.imageThumb ?? property.image}
          alt={`${property.title} em ${property.neighborhood}, ${property.city}`}
          loading="lazy"
          width={1024}
          height={768}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge className="bg-brand text-brand-foreground">
            {categoryLabels[property.category]}
          </Badge>
          {property.highlight && (
            <Badge className="bg-accent text-accent-foreground">{property.highlight}</Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {developer?.name}
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-tight">
            <Link to="/imovel/$slug" params={{ slug: property.slug }} className="hover:text-brand">
              {property.title}
            </Link>
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-4" /> {property.neighborhood}, {property.city}
          </p>
        </div>

        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <li className="flex items-center gap-1">
            <BedDouble className="size-4" /> {property.bedrooms} quartos
          </li>
          <li className="flex items-center gap-1">
            <Bath className="size-4" /> {property.bathrooms}
          </li>
          <li className="flex items-center gap-1">
            <Car className="size-4" /> {property.parking}
          </li>
          <li className="flex items-center gap-1">
            <Ruler className="size-4" /> {formatArea(property.area)}
          </li>
        </ul>

        <div className="mt-auto space-y-3 pt-2">
          <p className="text-xl font-bold text-brand">
            {formatCurrency(property.price)}
            {(property.category === "lancamento" || property.category === "na-planta") && (
              <span className="ml-1 text-xs font-medium text-muted-foreground">a partir de</span>
            )}
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/imovel/$slug" params={{ slug: property.slug }}>
                Ver detalhes
              </Link>
            </Button>
            <LeadDialog
              property={{
                id: property.id,
                ref: property.ref,
                title: property.title,
                slug: property.slug,
                ...(developer ? { developer: developer.name } : {}),
                neighborhood: property.neighborhood,
                city: property.city,
              }}
              defaultInterest={categoryLabels[property.category]}
              trigger={
                <Button variant="whatsapp" className="flex-1">
                  WhatsApp
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </article>
  );
}
