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
  Check,
  ThermometerSnowflake,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { callHaService, type ClimateEntity } from "@/lib/homeassistant.functions";
import { formatClimateLabel } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const MODE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  auto: Wand2,
  heat: Flame,
  cool: Snowflake,
  dry: Droplet,
  fan_only: Fan,
  heat_cool: ThermometerSnowflake,
  off: Power,
};

function modeAccentClass(mode: string): string {
  if (mode === "cool") return "text-cool";
  if (mode !== "off") return "text-brand";
  return "text-muted-foreground";
}

function optionAccentClass(optionId: string, selected: boolean): string {
  if (!selected) return "text-foreground hover:bg-accent/80";
  if (optionId === "cool") return "bg-cool/10 text-cool";
  return "bg-brand/10 text-brand";
}

function optionIconClass(optionId: string, selected: boolean): string {
  if (!selected) return "text-muted-foreground";
  return optionId === "cool" ? "text-cool" : "text-brand";
}

export function AcCard({ climate }: { climate: ClimateEntity }) {
  const qc = useQueryClient();
  const callService = useServerFn(callHaService);

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

  const modeOptions = climate.hvac_modes.map((m) => {
    const I = MODE_ICONS[m] ?? Power;
    return { id: m, label: formatClimateLabel(m), icon: <I className="size-3.5" /> };
  });

  const fanOptions = climate.fan_modes.map((f) => ({
    id: f,
    label: formatClimateLabel(f),
    icon: <Fan className="size-3.5" />,
  }));

  return (
    <div
      className={`dashboard-card control-card h-full lg:min-h-0 p-3 sm:p-2.5 lg:p-3 flex flex-col gap-2 sm:gap-1.5 overflow-visible @container/ac ${
        isOn ? (mode === "cool" ? "ac-card--cool" : "ac-card--active") : ""
      } ${!climate.available ? "opacity-80" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Climate</div>
          <div className="text-xs font-medium truncate">{climate.name}</div>
        </div>
        <div className="text-right shrink-0 rounded-lg bg-surface-elevated/80 px-2 py-1">
          <div className="text-[10px] text-muted-foreground">Now</div>
          <div className="text-xs font-semibold tabular-nums">
            {climate.current_temperature != null ? `${climate.current_temperature}°C` : "—"}
          </div>
        </div>
      </div>

      <div className="flex justify-center py-0.5 sm:py-1">
        <div className="flex items-center justify-between gap-1 w-full max-w-[9.5rem] sm:max-w-[10rem]">
          <RoundButton
            onClick={dec}
            disabled={!climate.available || setTempMutation.isPending}
            aria-label="Decrease temperature"
          >
            <Minus className="size-4" />
          </RoundButton>

          <div className="flex flex-col items-center justify-center shrink-0 px-1">
            <div className="text-2xl sm:text-[1.75rem] font-semibold tabular-nums leading-none">
              {climate.target_temperature != null ? climate.target_temperature : "—"}
              <span className="text-xs align-top text-muted-foreground ml-0.5">°C</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 max-w-[5.5rem]">
              <ModeIcon
                className={`size-3 shrink-0 ${climate.available && isOn ? modeAccentClass(mode) : "text-muted-foreground"}`}
              />
              <span
                className={`text-[10px] tracking-wide font-medium truncate ${
                  climate.available && isOn ? modeAccentClass(mode) : "text-muted-foreground"
                }`}
              >
                {climate.available ? formatClimateLabel(mode) : "Unavailable"}
              </span>
            </div>
          </div>

          <RoundButton
            onClick={inc}
            disabled={!climate.available || setTempMutation.isPending}
            aria-label="Increase temperature"
          >
            <Plus className="size-4" />
          </RoundButton>
        </div>
      </div>

      <div className="ac-controls-row grid grid-cols-2 gap-1.5 sm:gap-2">
        <ClimateSelect
          label="Mode"
          value={mode}
          disabled={!climate.available || setModeMutation.isPending || modeOptions.length === 0}
          icon={
            <ModeIcon
              className={`size-3.5 shrink-0 ${
                climate.available && isOn ? modeAccentClass(mode) : "text-muted-foreground"
              }`}
            />
          }
          options={modeOptions}
          onChange={(id) => setModeMutation.mutate(id)}
        />
        <ClimateSelect
          label="Fan"
          value={climate.fan_mode ?? ""}
          disabled={
            !climate.available || fanOptions.length === 0 || setFanMutation.isPending
          }
          icon={<Fan className="size-3.5 shrink-0 text-muted-foreground" />}
          placeholder="—"
          options={fanOptions}
          onChange={(id) => setFanMutation.mutate(id)}
        />
      </div>
    </div>
  );
}

function RoundButton({
  children,
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  "aria-label": string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="size-8 min-h-[36px] min-w-[36px] rounded-full border border-border bg-surface-elevated/60 flex items-center justify-center hover:bg-accent hover:border-brand/30 active:scale-95 transition disabled:opacity-40 touch-manipulation shrink-0"
    >
      {children}
    </button>
  );
}

function ClimateSelect({
  label,
  value,
  icon,
  options,
  disabled,
  placeholder = "—",
  onChange,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  options: { id: string; label: string; icon: React.ReactNode }[];
  disabled?: boolean;
  placeholder?: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);
  const displayValue = selected?.label ?? (value ? formatClimateLabel(value) : placeholder);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          disabled={disabled}
          aria-expanded={open}
          className="ac-select-trigger w-full rounded-xl border border-border/50 bg-surface-elevated/80 px-2 py-2 sm:py-1.5 flex items-center gap-1.5 hover:bg-accent/80 hover:border-border active:bg-accent transition text-left disabled:opacity-50 disabled:pointer-events-none touch-manipulation min-h-[44px] sm:min-h-0"
        >
          <span className="shrink-0">{icon}</span>
          <span className="flex-1 min-w-0">
            <span className="block text-[10px] uppercase tracking-wide text-muted-foreground leading-none">
              {label}
            </span>
            <span className="block text-xs truncate leading-tight mt-0.5">{displayValue}</span>
          </span>
          <ChevronDown
            className={`size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        collisionPadding={12}
        avoidCollisions
        className="ac-select-content z-[100] w-[var(--radix-popover-trigger-width)] min-w-[10rem] max-w-[min(calc(100vw-2rem),20rem)] p-1.5 shadow-2xl border-border max-h-[min(50vh,16rem)] overflow-y-auto"
      >
        <ul className="flex flex-col gap-0.5" role="listbox" aria-label={label}>
          {options.map((o) => {
            const selected = o.id === value;
            return (
              <li key={o.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.id);
                    setOpen(false);
                  }}
                  className={`ac-select-item w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 sm:py-2 text-xs transition touch-manipulation min-h-[44px] sm:min-h-0 ${optionAccentClass(o.id, selected)}`}
                >
                  <span className={optionIconClass(o.id, selected)}>{o.icon}</span>
                  <span className="flex-1 text-left truncate">{o.label}</span>
                  {selected ? (
                    <Check
                      className={`size-3.5 shrink-0 ${o.id === "cool" ? "text-cool" : "text-brand"}`}
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
