import "./load-env.server";
import type { DashboardData, OutdoorWeather } from "./homeassistant.types";

type HAState = {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown> & { friendly_name?: string };
};

type HAMessage = {
  id?: number;
  type: string;
  success?: boolean;
  result?: unknown;
  error?: { message?: string };
  event?: {
    event_type: string;
    data: {
      entity_id: string;
      new_state: HAState | null;
    };
  };
};

function getConfig() {
  const url = process.env.HOME_ASSISTANT_URL;
  const token = process.env.HOME_ASSISTANT_TOKEN;
  if (!url || !token) throw new Error("Home Assistant credentials missing");
  return { url: url.replace(/\/$/, ""), token };
}

function toWsUrl(baseUrl: string) {
  const parsed = new URL(baseUrl);
  parsed.protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
  parsed.pathname = "/api/websocket";
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString();
}

function parseNumericState(state: string): number | null {
  const value = Number.parseFloat(state);
  return Number.isFinite(value) ? value : null;
}

function isOutdoorEntity(entityId: string, friendlyName: string): boolean {
  const haystack = `${entityId} ${friendlyName}`.toLowerCase();
  return /outdoor|outside|exterior|weather/.test(haystack);
}

function extractOutdoorWeather(states: HAState[]): OutdoorWeather | null {
  for (const entity of states) {
    if (!entity.entity_id.startsWith("weather.")) continue;
    if (entity.state === "unavailable" || entity.state === "unknown") continue;

    const attrs = entity.attributes;
    const temperature =
      typeof attrs.temperature === "number"
        ? attrs.temperature
        : parseNumericState(entity.state);
    const humidity = typeof attrs.humidity === "number" ? attrs.humidity : null;
    const condition = typeof attrs.condition === "string" ? attrs.condition : entity.state;

    if (temperature != null || humidity != null) {
      return { temperature, humidity, condition };
    }
  }

  let temperature: number | null = null;
  let humidity: number | null = null;

  for (const entity of states) {
    if (!entity.entity_id.startsWith("sensor.")) continue;
    if (entity.state === "unavailable" || entity.state === "unknown") continue;

    const attrs = entity.attributes;
    const friendlyName = (attrs.friendly_name as string) || "";
    const deviceClass = attrs.device_class as string | undefined;
    const value = parseNumericState(entity.state);
    if (value == null) continue;

    const outdoor = isOutdoorEntity(entity.entity_id, friendlyName);

    if (deviceClass === "temperature" && outdoor && temperature == null) {
      temperature = value;
    }
    if (deviceClass === "humidity" && outdoor && humidity == null) {
      humidity = value;
    }
  }

  if (temperature == null && humidity == null) return null;
  return { temperature, humidity, condition: null };
}

export function mapStatesToDashboard(states: HAState[], baseUrl: string): DashboardData {
  const lights = states
    .filter((s) => s.entity_id.startsWith("light."))
    .map((s) => ({
      entity_id: s.entity_id,
      name: (s.attributes.friendly_name as string) || s.entity_id,
      on: s.state === "on",
    }));

  const climates = states
    .filter((s) => s.entity_id.startsWith("climate."))
    .map((s) => {
      const a = s.attributes as Record<string, unknown>;
      return {
        entity_id: s.entity_id,
        name: (a.friendly_name as string) || s.entity_id,
        mode:
          typeof a.hvac_mode === "string"
            ? a.hvac_mode
            : s.state !== "unavailable" && s.state !== "unknown"
              ? s.state
              : "off",
        available: s.state !== "unavailable",
        current_temperature: (a.current_temperature as number) ?? null,
        target_temperature: (a.temperature as number) ?? null,
        min_temp: typeof a.min_temp === "number" ? a.min_temp : 16,
        max_temp: typeof a.max_temp === "number" ? a.max_temp : 30,
        hvac_modes: Array.isArray(a.hvac_modes) ? (a.hvac_modes as string[]) : [],
        fan_modes: Array.isArray(a.fan_modes) ? (a.fan_modes as string[]) : [],
        fan_mode: typeof a.fan_mode === "string" ? a.fan_mode : null,
      };
    });

  const cameras = states
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
        width: typeof a.width === "number" ? a.width : null,
        height: typeof a.height === "number" ? a.height : null,
      };
    });

  return { lights, climates, cameras, outdoor_weather: extractOutdoorWeather(states) };
}

type Waiter = {
  since: number;
  resolve: (version: number) => void;
};

class HaWebSocketClient {
  private ws: WebSocket | null = null;
  private states = new Map<string, HAState>();
  private messageId = 1;
  private pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();
  private waiters: Waiter[] = [];
  private baseUrl = "";
  private connecting: Promise<void> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  version = 0;

  async ensureConnected() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    if (this.connecting) return this.connecting;
    this.connecting = this.connect();
    try {
      await this.connecting;
    } finally {
      this.connecting = null;
    }
  }

  getDashboard(): DashboardData {
    return mapStatesToDashboard([...this.states.values()], this.baseUrl);
  }

  waitForUpdate(since: number, timeoutMs: number) {
    if (this.version > since) return Promise.resolve(this.version);

    return new Promise<number>((resolve) => {
      const timer = setTimeout(() => {
        this.removeWaiter(resolve);
        resolve(this.version);
      }, timeoutMs);

      this.waiters.push({
        since,
        resolve: (version) => {
          clearTimeout(timer);
          resolve(version);
        },
      });
    });
  }

  private removeWaiter(resolve: (version: number) => void) {
    this.waiters = this.waiters.filter((w) => w.resolve !== resolve);
  }

  private connect() {
    const { url, token } = getConfig();
    this.baseUrl = url;

    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(toWsUrl(url));
      this.ws = ws;
      let authed = false;

      ws.addEventListener("message", (event) => {
        const msg = JSON.parse(String(event.data)) as HAMessage;

        if (msg.type === "auth_required") {
          ws.send(JSON.stringify({ type: "auth", access_token: token }));
          return;
        }

        if (msg.type === "auth_invalid") {
          reject(new Error("Home Assistant WebSocket auth failed"));
          ws.close();
          return;
        }

        if (msg.type === "auth_ok" && !authed) {
          authed = true;
          void this.bootstrap()
            .then(resolve)
            .catch(reject);
          return;
        }

        this.handleMessage(msg);
      });

      ws.addEventListener("error", () => {
        if (!authed) reject(new Error("Home Assistant WebSocket connection failed"));
      });

      ws.addEventListener("close", () => {
        this.ws = null;
        this.rejectPending(new Error("Home Assistant WebSocket disconnected"));
        this.scheduleReconnect();
      });
    });
  }

  private async bootstrap() {
    await this.sendCommand("subscribe_events", { event_type: "state_changed" });
    const states = (await this.sendCommand("get_states")) as HAState[];
    this.states.clear();
    for (const state of states) {
      this.states.set(state.entity_id, state);
    }
    this.bumpVersion();
  }

  private handleMessage(msg: HAMessage) {
    if (msg.type === "result" && typeof msg.id === "number") {
      const pending = this.pending.get(msg.id);
      if (!pending) return;
      this.pending.delete(msg.id);
      if (msg.success) pending.resolve(msg.result);
      else pending.reject(new Error(msg.error?.message ?? "Home Assistant request failed"));
      return;
    }

    if (msg.type === "event" && msg.event?.event_type === "state_changed") {
      const next = msg.event.data.new_state;
      if (!next) return;
      this.states.set(next.entity_id, next);
      this.bumpVersion();
    }
  }

  private bumpVersion() {
    this.version += 1;
    const ready = this.waiters.filter((w) => w.since < this.version);
    this.waiters = this.waiters.filter((w) => w.since >= this.version);
    for (const waiter of ready) waiter.resolve(this.version);
  }

  private sendCommand(type: string, extra?: Record<string, unknown>) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error("Home Assistant WebSocket is not connected"));
    }

    const id = this.messageId++;
    return new Promise<unknown>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws!.send(JSON.stringify({ id, type, ...extra }));
    });
  }

  private rejectPending(error: Error) {
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.ensureConnected().catch((error) => {
        console.error("Home Assistant WebSocket reconnect failed:", error);
        this.scheduleReconnect();
      });
    }, 5_000);
  }
}

let client: HaWebSocketClient | undefined;

export function getHaWebSocketClient() {
  if (!client) client = new HaWebSocketClient();
  return client;
}
