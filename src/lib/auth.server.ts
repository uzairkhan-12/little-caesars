import { getCookie } from "@tanstack/start-server-core";

export const SESSION_COOKIE = "lc_session";
export const SESSION_TOKEN = "lc_authenticated_v1";
export const AUTH_USERNAME = "littlecaesars";
export const AUTH_PASSWORD = "littleCaesars!21!";

export function isAuthenticated(): boolean {
  return getCookie(SESSION_COOKIE) === SESSION_TOKEN;
}
