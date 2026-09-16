import { createFileRoute } from "@tanstack/react-router";

const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;

export const Route = createFileRoute("/api/public/imagem/$name")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async ({ params }) => {
        const name = params.name;
        if (!SAFE_NAME.test(name) || !name.endsWith(".webp")) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("imoveis").download(name);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": "image/webp",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
