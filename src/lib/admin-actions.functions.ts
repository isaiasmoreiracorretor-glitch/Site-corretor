import { createServerFn } from "@tanstack/react-start";
import type { ServerAboutValues, ServerPropertyValues } from "./admin-actions.server";

export const adminCreateProperty = createServerFn({ method: "POST" })
  .inputValidator((data: ServerPropertyValues) => data)
  .handler(async ({ data }) => {
    const { serverCreateProperty } = await import("./admin-actions.server");
    return serverCreateProperty(data);
  });

export const adminDeleteProperty = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { serverDeleteProperty } = await import("./admin-actions.server");
    return serverDeleteProperty(data.id);
  });

async function assertAdmin(token?: string | null) {
  const { verifySessionToken } = await import("./admin-gate.server");
  if (!verifySessionToken(token)) throw new Error("Sessão administrativa inválida.");
}

export const adminListLeads = createServerFn({ method: "POST" })
  .inputValidator((data: { token?: string | null; page: number; pageSize: number }) => data)
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const { serverListLeads } = await import("./admin-actions.server");
    return serverListLeads(data.page, data.pageSize);
  });

export const adminClearAllLeads = createServerFn({ method: "POST" })
  .inputValidator((data: { token?: string | null }) => data)
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const { serverClearAllLeads } = await import("./admin-actions.server");
    return serverClearAllLeads();
  });

export const adminDeleteLead = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; token?: string | null }) => data)
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const { serverDeleteLead } = await import("./admin-actions.server");
    return serverDeleteLead(data.id);
  });

export const adminUpdateAbout = createServerFn({ method: "POST" })
  .inputValidator((data: ServerAboutValues) => data)
  .handler(async ({ data }) => {
    const { serverUpdateAboutProfile } = await import("./admin-actions.server");
    return serverUpdateAboutProfile(data);
  });

export const adminUploadImage = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; base64Data: string; contentType: string }) => data)
  .handler(async ({ data }) => {
    const { serverUploadImage } = await import("./admin-actions.server");
    return serverUploadImage(data.name, data.base64Data, data.contentType);
  });
