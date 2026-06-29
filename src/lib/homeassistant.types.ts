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
  width: number | null;
  height: number | null;
};

export type OutdoorWeather = {
  temperature: number | null;
  humidity: number | null;
  condition: string | null;
};

export type DashboardData = {
  lights: LightEntity[];
  climates: ClimateEntity[];
  cameras: CameraEntity[];
  outdoor_weather: OutdoorWeather | null;
};
