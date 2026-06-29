import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, setCookie } from "@tanstack/start-server-core";

import {
  AUTH_PASSWORD,
  AUTH_USERNAME,
  isAuthenticated,
  SESSION_COOKIE,
  SESSION_TOKEN,
} from "./auth.server";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export const getAuthSession = createServerFn({ method: "GET" }).handler(async () => ({
  authenticated: isAuthenticated(),
}));

export const login = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    if (data.username !== AUTH_USERNAME || data.password !== AUTH_PASSWORD) {
      throw new Error("Invalid username or password");
    }

    setCookie(SESSION_COOKIE, SESSION_TOKEN, cookieOptions);
    return { ok: true as const };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(SESSION_COOKIE, { path: "/" });
  return { ok: true as const };
});
