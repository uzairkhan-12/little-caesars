import { getCookie } from "@tanstack/start-server-core";

export const SESSION_COOKIE = "lc_session";
export const SESSION_TOKEN = "lc_authenticated_v1";
export const AUTH_USERNAME = "primewave";
export const AUTH_PASSWORD = "!PpAa81726354";

export function isAuthenticated(): boolean {
  return getCookie(SESSION_COOKIE) === SESSION_TOKEN;
}

export function isValidCredentials(username: string, password: string): boolean {
  return username.trim().toLowerCase() === AUTH_USERNAME && password === AUTH_PASSWORD;
}
