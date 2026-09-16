import { createServerFn } from "@tanstack/react-start";

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { attemptLogin } = await import("./admin-gate.server");
    const result = await attemptLogin(String(data.username ?? ""), String(data.password ?? ""));
    return {
      ok: result.ok,
      message: result.message,
      locked: result.locked,
      remainingMinutes: result.remainingMinutes,
      ...(result.session ? { session: result.session } : {}),
      ...(result.token ? { token: result.token } : {}),
    };
  });

export const adminVerifySession = createServerFn({ method: "POST" })
  .inputValidator((data: { token?: string | null }) => data)
  .handler(async ({ data }) => {
    const { verifySessionToken } = await import("./admin-gate.server");
    const session = verifySessionToken(data.token);
    return {
      valid: Boolean(session),
      user: session ? { username: session.username, role: session.role } : null,
    };
  });

export const adminChangePassword = createServerFn({ method: "POST" })
  .inputValidator((data: { currentPassword: string; newPassword: string }) => data)
  .handler(async ({ data }) => {
    const { changePassword } = await import("./admin-gate.server");
    return changePassword(String(data.currentPassword ?? ""), String(data.newPassword ?? ""));
  });

export const adminPasswordWindow = createServerFn({ method: "GET" }).handler(async () => {
  const { isPasswordChangeWindowOpen, currentLocalHour, WINDOW_START_HOUR, WINDOW_END_HOUR } =
    await import("./admin-gate.server");
  return {
    open: isPasswordChangeWindowOpen(),
    currentHour: currentLocalHour(),
    startHour: WINDOW_START_HOUR,
    endHour: WINDOW_END_HOUR,
  };
});

export const adminResetGate = createServerFn({ method: "POST" }).handler(async () => {
  const { resetLoginGate } = await import("./admin-gate.server");
  return resetLoginGate();
});
