import { createServerFn } from "@tanstack/react-start";
import { getHaWebSocketClient } from "./homeassistant-ws.server";
import type { DashboardData } from "./homeassistant.types";

export type {
  LightEntity,
  ClimateEntity,
  CameraEntity,
  OutdoorWeather,
  DashboardData,
} from "./homeassistant.types";

function getConfig() {
  const url = process.env.HOME_ASSISTANT_URL;
  const token = process.env.HOME_ASSISTANT_TOKEN;
  if (!url || !token) throw new Error("Home Assistant credentials missing");
  return { url: url.replace(/\/$/, ""), token };
}

async function haFetch(path: string, init?: RequestInit) {
  const { url, token } = getConfig();
  const res = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HA ${res.status}: ${body.slice(0, 200)}`);
  }
  return res;
}

export const getDashboardData = createServerFn({ method: "GET" }).handler(
  async (): Promise<DashboardData> => {
    const client = getHaWebSocketClient();
    await client.ensureConnected();
    return client.getDashboard();
  },
);

export const waitForHaUpdate = createServerFn({ method: "POST" })
  .validator((data: { since: number }) => data)
  .handler(async ({ data }) => {
    const client = getHaWebSocketClient();
    await client.ensureConnected();

    if (client.version > data.since) {
      return { version: client.version, dashboard: client.getDashboard() };
    }

    await client.waitForUpdate(data.since, 30_000);
    return { version: client.version, dashboard: client.getDashboard() };
  });

export const callHaService = createServerFn({ method: "POST" })
  .validator(
    (data: {
      domain: string;
      service: string;
      entity_id: string;
      data?: Record<string, unknown>;
    }) => data,
  )
  .handler(async ({ data }) => {
    await haFetch(`/api/services/${data.domain}/${data.service}`, {
      method: "POST",
      body: JSON.stringify({ entity_id: data.entity_id, ...(data.data || {}) }),
    });
    return { ok: true };
  });
