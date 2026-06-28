import { useState } from "react";
import {
  Minus,
  Plus,
  Power,
  Flame,
  Snowflake,
  Droplet,
  Fan,
  Wand2,
  ChevronDown,
  ThermometerSnowflake,
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

  const dec = () => setTempMutation.mutate(Math.max(climate.min_temp, temp - 1));
  const inc = () => setTempMutation.mutate(Math.min(climate.max_temp, temp + 1));

  return (
    <div className="h-full rounded-2xl bg-card p-2 lg:p-3 border border-border flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] text-muted-foreground">Climate</div>
          <div className="text-xs font-medium truncate">{climate.name}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] text-muted-foreground">Now</div>
          <div className="text-xs font-medium">
            {climate.current_temperature != null ? `${climate.current_temperature}°C` : "—"}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center gap-3">
        <button
          onClick={dec}
          disabled={!climate.available || setTempMutation.isPending}
          className="size-8 lg:size-9 rounded-full border border-border flex items-center justify-center hover:bg-accent transition disabled:opacity-40"
          aria-label="Decrease"
        >
          <Minus className="size-4" />
        </button>

        <div className="flex flex-col items-center justify-center">
          <div className="text-2xl lg:text-3xl font-semibold tabular-nums leading-none">
            {climate.target_temperature != null ? climate.target_temperature : "—"}
            <span className="text-xs lg:text-sm align-top text-muted-foreground ml-0.5">°C</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <ModeIcon className={`size-3.5 ${isOn ? "text-active" : "text-muted-foreground"}`} />
            <span className={`text-[10px] uppercase tracking-wide ${isOn ? "text-active" : "text-muted-foreground"}`}>
              {climate.available ? labelize(mode) : "Unavailable"}
            </span>
          </div>
        </div>

        <button
          onClick={inc}
          disabled={!climate.available || setTempMutation.isPending}
          className="size-8 lg:size-9 rounded-full border border-border flex items-center justify-center hover:bg-accent transition disabled:opacity-40"
          aria-label="Increase"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Selector
          label="Mode"
          value={labelize(mode)}
          icon={<ModeIcon className="size-4" />}
          open={openMode}
          disabled={!climate.available || setModeMutation.isPending}
          onToggle={() => {
            setOpenMode((v) => !v);
            setOpenFan(false);
          }}
          options={climate.hvac_modes.map((m) => {
            const I = MODE_ICONS[m] ?? Power;
            return { id: m, label: labelize(m), icon: <I className="size-4" />, active: m === mode };
          })}
          onSelect={(id) => {
            setModeMutation.mutate(id);
            setOpenMode(false);
          }}
        />
        <Selector
          label="Fan"
          value={climate.fan_mode ? labelize(climate.fan_mode) : "—"}
          icon={<Fan className="size-4" />}
          open={openFan}
          disabled={!climate.available || climate.fan_modes.length === 0 || setFanMutation.isPending}
          onToggle={() => {
            setOpenFan((v) => !v);
            setOpenMode(false);
          }}
          options={climate.fan_modes.map((f) => ({
            id: f,
            label: labelize(f),
            icon: <Fan className="size-4" />,
            active: f === climate.fan_mode,
          }))}
          onSelect={(id) => {
            setFanMutation.mutate(id);
            setOpenFan(false);
          }}
        />
      </div>
    </div>
  );
}

function Selector({
  label,
  value,
  icon,
  open,
  disabled,
  onToggle,
  options,
  onSelect,
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
        className="w-full rounded-xl bg-surface-elevated px-2 py-1.5 flex items-center gap-2 hover:bg-accent transition text-left disabled:opacity-50"
      >
        <span className="text-muted-foreground">{icon}</span>
        <span className="flex-1 min-w-0">
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
          <span className="block text-xs truncate">{value}</span>
        </span>
        <ChevronDown className={`size-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-20 left-0 right-0 bottom-full mb-1 rounded-xl bg-popover border border-border shadow-xl py-1 overflow-hidden max-h-60 overflow-y-auto">
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
