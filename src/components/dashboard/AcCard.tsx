import { useState } from "react";
import {
  Minus, Plus, Power, Flame, Snowflake, Droplet, Fan, Wand2, ChevronDown, ThermometerSnowflake,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { callHaService, type ClimateEntity } from "@/lib/homeassistant.functions";

const MODE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  auto: Wand2,
  heat: Flame,
  cool: Snowflake,
  dry: Droplet,
  fan_only: Fan,
  heat_cool: ThermometerSnowflake,
  off: Power,
};

function labelize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AcCard({ climate }: { climate: ClimateEntity }) {
  const qc = useQueryClient();
  const callService = useServerFn(callHaService);
  const [openMode, setOpenMode] = useState(false);
  const [openFan, setOpenFan] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["ha", "dashboard"] });

  const setTempMutation = useMutation({
    mutationFn: (t: number) =>
      callService({
        data: {
          domain: "climate",
          service: "set_temperature",
          entity_id: climate.entity_id,
          data: { temperature: t },
        },
      }),
    onSuccess: invalidate,
  });

  const setModeMutation = useMutation({
    mutationFn: (mode: string) =>
      callService({
        data: {
          domain: "climate",
          service: "set_hvac_mode",
          entity_id: climate.entity_id,
          data: { hvac_mode: mode },
        },
      }),
    onSuccess: invalidate,
  });

  const setFanMutation = useMutation({
    mutationFn: (fan: string) =>
      callService({
        data: {
          domain: "climate",
          service: "set_fan_mode",
          entity_id: climate.entity_id,
          data: { fan_mode: fan },
        },
      }),
    onSuccess: invalidate,
  });

  const mode = climate.mode;
  const isOn = mode !== "off" && climate.available;
  const ModeIcon = MODE_ICONS[mode] ?? Power;
  const temp = climate.target_temperature ?? climate.min_temp;

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(
    1,
    Math.max(0, (temp - climate.min_temp) / Math.max(1, climate.max_temp - climate.min_temp)),
  );
  const dash = pct * circumference;
  const accent = isOn ? "var(--active)" : "var(--muted-foreground)";

  const dec = () => setTempMutation.mutate(Math.max(climate.min_temp, temp - 1));
  const inc = () => setTempMutation.mutate(Math.min(climate.max_temp, temp + 1));

  return (
    <div className="h-full rounded-2xl bg-card p-4 border border-border flex flex-col overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">Climate</div>
          <div className="text-sm font-medium truncate">{climate.name}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Current</div>
          <div className="text-sm font-medium">
            {climate.current_temperature != null ? `${climate.current_temperature}°C` : "—"}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--muted)" strokeWidth="8" strokeLinecap="round" />
            <circle
              cx="60" cy="60" r={radius} fill="none"
              stroke={accent} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              style={{ transition: "stroke-dasharray 200ms, stroke 200ms" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {climate.available ? labelize(mode) : "Unavailable"}
            </div>
            <div className="text-3xl font-semibold tabular-nums">
              {climate.target_temperature != null ? climate.target_temperature : "—"}
              <span className="text-sm align-top text-muted-foreground ml-0.5">°C</span>
            </div>
            <div className="mt-0.5">
              <ModeIcon className={`size-4 ${isOn ? "text-active" : "text-muted-foreground"}`} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={dec}
            disabled={!climate.available || setTempMutation.isPending}
            className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-accent transition disabled:opacity-40"
            aria-label="Decrease"
          >
            <Minus className="size-4" />
          </button>
          <button
            onClick={inc}
            disabled={!climate.available || setTempMutation.isPending}
            className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-accent transition disabled:opacity-40"
            aria-label="Increase"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <Selector
          label="Mode"
          value={labelize(mode)}
          icon={<ModeIcon className="size-4" />}
          open={openMode}
          disabled={!climate.available || setModeMutation.isPending}
          onToggle={() => { setOpenMode((v) => !v); setOpenFan(false); }}
          options={climate.hvac_modes.map((m) => {
            const I = MODE_ICONS[m] ?? Power;
            return { id: m, label: labelize(m), icon: <I className="size-4" />, active: m === mode };
          })}
          onSelect={(id) => { setModeMutation.mutate(id); setOpenMode(false); }}
        />
        <Selector
          label="Fan"
          value={climate.fan_mode ? labelize(climate.fan_mode) : "—"}
          icon={<Fan className="size-4" />}
          open={openFan}
          disabled={!climate.available || climate.fan_modes.length === 0 || setFanMutation.isPending}
          onToggle={() => { setOpenFan((v) => !v); setOpenMode(false); }}
          options={climate.fan_modes.map((f) => ({
            id: f, label: labelize(f), icon: <Fan className="size-4" />, active: f === climate.fan_mode,
          }))}
          onSelect={(id) => { setFanMutation.mutate(id); setOpenFan(false); }}
        />
      </div>
    </div>
  );
}

function Selector({
  label, value, icon, open, disabled, onToggle, options, onSelect,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  open: boolean;
  disabled?: boolean;
  onToggle: () => void;
  options: { id: string; label: string; icon: React.ReactNode; active: boolean }[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        disabled={disabled}
        className="w-full rounded-xl bg-surface-elevated px-3 py-2 flex items-center gap-2 hover:bg-accent transition text-left disabled:opacity-50"
      >
        <span className="text-muted-foreground">{icon}</span>
        <span className="flex-1 min-w-0">
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
          <span className="block text-xs truncate">{value}</span>
        </span>
        <ChevronDown className={`size-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-20 left-0 right-0 mt-2 rounded-xl bg-popover border border-border shadow-xl py-1 overflow-hidden max-h-60 overflow-y-auto">
          {options.map((o) => (
            <button
              key={o.id}
              onClick={() => onSelect(o.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-accent transition ${
                o.active ? "text-primary bg-accent/50" : ""
              }`}
            >
              <span className={o.active ? "text-primary" : "text-muted-foreground"}>{o.icon}</span>
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
