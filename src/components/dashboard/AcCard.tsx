import { useState } from "react";
import {
  Minus, Plus, Power, Flame, Snowflake, Droplet, Fan, Wand2, ChevronDown,
} from "lucide-react";

type Mode = "auto" | "heat" | "cool" | "dry" | "fan_only" | "off";
type FanMode = "low" | "medium" | "high" | "auto";

const MODE_OPTIONS: { id: Mode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "auto", label: "Auto", icon: Wand2 },
  { id: "heat", label: "Heat", icon: Flame },
  { id: "cool", label: "Cool", icon: Snowflake },
  { id: "dry", label: "Dry", icon: Droplet },
  { id: "fan_only", label: "Fan only", icon: Fan },
  { id: "off", label: "Off", icon: Power },
];

const FAN_OPTIONS: { id: FanMode; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

export function AcCard({
  room,
  name,
  currentTemp,
}: {
  room: string;
  name: string;
  currentTemp: number;
}) {
  const [temp, setTemp] = useState(20);
  const [mode, setMode] = useState<Mode>("off");
  const [fan, setFan] = useState<FanMode>("auto");
  const [openMode, setOpenMode] = useState(false);
  const [openFan, setOpenFan] = useState(false);

  const isOn = mode !== "off";
  const modeLabel = MODE_OPTIONS.find((m) => m.id === mode)!.label;
  const fanLabel = FAN_OPTIONS.find((f) => f.id === fan)!.label;
  const ModeIcon = MODE_OPTIONS.find((m) => m.id === mode)!.icon;

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, Math.max(0, (temp - 16) / (30 - 16)));
  const dash = pct * circumference;

  const accent = isOn ? "var(--active)" : "var(--muted-foreground)";

  return (
    <div className="h-full rounded-2xl bg-card p-4 border border-border flex flex-col overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{room}</div>
          <div className="text-sm font-medium">{name}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Current</div>
          <div className="text-sm font-medium">{currentTemp}°C</div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--muted)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={accent}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              style={{ transition: "stroke-dasharray 200ms, stroke 200ms" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{isOn ? modeLabel : "Off"}</div>
            <div className="text-3xl font-semibold tabular-nums">
              {temp}
              <span className="text-sm align-top text-muted-foreground ml-0.5">°C</span>
            </div>
            <div className="mt-0.5">
              <ModeIcon className={`size-4 ${isOn ? "text-active" : "text-muted-foreground"}`} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTemp((t) => Math.max(16, t - 1))}
            className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-accent transition"
            aria-label="Decrease"
          >
            <Minus className="size-4" />
          </button>
          <button
            onClick={() => setTemp((t) => Math.min(30, t + 1))}
            className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-accent transition"
            aria-label="Increase"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <Selector
          label="Mode"
          value={modeLabel}
          icon={<Power className="size-4" />}
          open={openMode}
          onToggle={() => { setOpenMode((v) => !v); setOpenFan(false); }}
          options={MODE_OPTIONS.map((o) => ({
            id: o.id,
            label: o.label,
            icon: <o.icon className="size-4" />,
            active: o.id === mode,
          }))}
          onSelect={(id) => { setMode(id as Mode); setOpenMode(false); }}
        />
        <Selector
          label="Fan mode"
          value={fanLabel}
          icon={<Fan className="size-4" />}
          open={openFan}
          onToggle={() => { setOpenFan((v) => !v); setOpenMode(false); }}
          options={FAN_OPTIONS.map((o) => ({
            id: o.id,
            label: o.label,
            icon: <Fan className="size-4" />,
            active: o.id === fan,
          }))}
          onSelect={(id) => { setFan(id as FanMode); setOpenFan(false); }}
        />
      </div>
    </div>
  );
}

function Selector({
  label, value, icon, open, onToggle, options, onSelect,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  options: { id: string; label: string; icon: React.ReactNode; active: boolean }[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-full rounded-xl bg-surface-elevated px-3 py-2 flex items-center gap-2 hover:bg-accent transition text-left"
      >
        <span className="text-muted-foreground">{icon}</span>
        <span className="flex-1 min-w-0">
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
          <span className="block text-xs truncate">{value}</span>
        </span>
        <ChevronDown className={`size-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-20 left-0 right-0 mt-2 rounded-xl bg-popover border border-border shadow-xl py-1 overflow-hidden">
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
