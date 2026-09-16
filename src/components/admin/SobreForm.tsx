import { useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";

import { ImageUploadField } from "@/components/site/ImageUploadField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  aboutQueryOptions,
  updateAboutProfile,
  type AboutPhoto,
  type AboutProfile,
} from "@/lib/about.api";

export function SobreForm() {
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(aboutQueryOptions);
  const [form, setForm] = useState<AboutProfile>(data);
  // Entrada vazia para permitir adicionar novas fotos ao carrossel.
  const [pendingSlots, setPendingSlots] = useState(0);

  const save = useMutation({
    mutationFn: () => updateAboutProfile(form),
    onSuccess: async () => {
      toast.success("Página “Sobre” atualizada!");
      setPendingSlots(0);
      await queryClient.invalidateQueries({ queryKey: aboutQueryOptions.queryKey });
    },
    onError: (error: Error) =>
      toast.error("Não foi possível salvar", { description: error.message }),
  });

  function set<K extends keyof AboutProfile>(key: K, value: AboutProfile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setPhotoAt(index: number, photo: AboutPhoto) {
    setForm((prev) => {
      const next = [...prev.photos];
      next[index] = photo;
      return { ...prev, photos: next };
    });
  }

  function removePhotoAt(index: number) {
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  }

  const slots: { photo: AboutPhoto; index: number | null }[] = [
    ...form.photos.map((photo, index) => ({ photo, index })),
    ...Array.from({ length: pendingSlots }, () => ({
      photo: { url: "", thumbUrl: "" },
      index: null,
    })),
  ];

  return (
    <section className="max-w-2xl rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-xl font-bold">Página “Sobre Moreira”</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Edite as informações do seu perfil público. As mudanças aparecem na página na hora.
      </p>

      <form
        className="mt-5 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label>Foto de perfil</Label>
          <ImageUploadField
            value={{ url: form.photo, thumbUrl: form.photoThumb }}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, photo: value.url, photoThumb: value.thumbUrl }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Aparece em formato redondo no topo da página, como no Instagram.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="about-name">Nome</Label>
            <Input
              id="about-name"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Moreira"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="about-role">Linha de função</Label>
            <Input
              id="about-role"
              value={form.roleLine}
              onChange={(e) => set("roleLine", e.target.value)}
              placeholder="Corretor de Imóveis · CRECI-BA 32.373"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="about-bio">Descrição curta (bio)</Label>
          <Textarea
            id="about-bio"
            rows={3}
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="Aparece logo abaixo do nome, como a bio do Instagram."
          />
        </div>

        <div className="space-y-2">
          <Label>Fotos do carrossel</Label>
          <div className="space-y-4">
            {slots.map((slot, slotIndex) =>
              slot.index !== null ? (
                <div key={`${slot.photo.url}-${slot.index}`} className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Foto {slot.index + 1}</p>
                  <ImageUploadField
                    value={slot.photo}
                    onChange={(value) => {
                      if (value.url === "") {
                        removePhotoAt(slot.index!);
                      } else {
                        setPhotoAt(slot.index!, value);
                      }
                    }}
                  />
                </div>
              ) : (
                <div key={`novo-${slotIndex}`} className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Nova foto</p>
                  <ImageUploadField
                    value={slot.photo}
                    onChange={(value) => {
                      if (value.url === "") return;
                      setForm((prev) => ({ ...prev, photos: [...prev.photos, value] }));
                      setPendingSlots((n) => Math.max(0, n - 1));
                    }}
                  />
                </div>
              ),
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPendingSlots((n) => n + 1)}
          >
            <Plus /> Adicionar foto ao carrossel
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="about-content">Texto livre</Label>
          <Textarea
            id="about-content"
            rows={8}
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            placeholder="Conte sua história, experiência e diferenciais. Cada quebra de linha é preservada na página."
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={save.isPending}>
          <Save /> {save.isPending ? "Salvando…" : "Salvar página Sobre"}
        </Button>
      </form>
    </section>
  );
}
