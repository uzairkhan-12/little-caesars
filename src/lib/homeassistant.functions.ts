import { createServerFn } from "@tanstack/react-start";

type HAState = {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown> & { friendly_name?: string };
};

export type LightEntity = {
  entity_id: string;
  name: string;
  on: boolean;
};

export type ClimateEntity = {
  entity_id: string;
  name: string;
  mode: string;
  available: boolean;
  current_temperature: number | null;
  target_temperature: number | null;
  min_temp: number;
  max_temp: number;
  hvac_modes: string[];
  fan_modes: string[];
  fan_mode: string | null;
};

export type CameraEntity = {
  entity_id: string;
  name: string;
  state: string;
  stream_url: string | null;
  snapshot_url: string | null;
};

export type DashboardData = {
  lights: LightEntity[];
  climates: ClimateEntity[];
  cameras: CameraEntity[];
};

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
    const { url: baseUrl, token } = getConfig();
    const res = await haFetch("/api/states");
    const states: HAState[] = await res.json();

    const lights: LightEntity[] = states
      .filter((s) => s.entity_id.startsWith("light."))
      .map((s) => ({
        entity_id: s.entity_id,
        name: (s.attributes.friendly_name as string) || s.entity_id,
        on: s.state === "on",
      }));

    const climates: ClimateEntity[] = states
      .filter((s) => s.entity_id.startsWith("climate."))
      .map((s) => {
        const a = s.attributes as Record<string, unknown>;
        return {
          entity_id: s.entity_id,
          name: (a.friendly_name as string) || s.entity_id,
          mode: s.state,
          available: s.state !== "unavailable",
          current_temperature: (a.current_temperature as number) ?? null,
          target_temperature: (a.temperature as number) ?? null,
          min_temp: (a.min_temp as number) ?? 16,
          max_temp: (a.max_temp as number) ?? 30,
          hvac_modes: (a.hvac_modes as string[]) ?? ["off"],
          fan_modes: (a.fan_modes as string[]) ?? [],
          fan_mode: (a.fan_mode as string) ?? null,
        };
      });

    const cameras: CameraEntity[] = states
      .filter((s) => s.entity_id.startsWith("camera."))
      .map((s) => {
        const a = s.attributes as Record<string, unknown>;
        const accessToken = a.access_token as string | undefined;
        return {
          entity_id: s.entity_id,
          name: (a.friendly_name as string) || s.entity_id,
          state: s.state,
          stream_url: accessToken
            ? `${baseUrl}/api/camera_proxy_stream/${s.entity_id}?token=${accessToken}`
            : null,
          snapshot_url: accessToken
            ? `${baseUrl}/api/camera_proxy/${s.entity_id}?token=${accessToken}`
            : null,
        };
      });

    // expose token via cameras only as part of URL; do NOT leak raw token elsewhere
    void token;
    return { lights, climates, cameras };
  },
);

export const callHaService = createServerFn({ method: "POST" })
  .inputValidator(
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
