import { useState } from "react";
import { ChefHat, Power, Thermometer } from "lucide-react";
import logoAsset from "@/assets/little-caesars-logo.png.asset.json";

export function KitchenCard({ name = "Kitchen" }: { name?: string }) {
  const [on, setOn] = useState(true);
  const [ovenTemp, setOvenTemp] = useState(180);

  return (
    <div className="rounded-2xl bg-card p-5 border border-border flex flex-col gap-4 min-h-[200px]">
      <div className="flex items-start justify-between">
        <div
          className={`size-12 rounded-xl flex items-center justify-center transition-colors ${
            on ? "bg-active/20 text-active" : "bg-muted text-muted-foreground"
          }`}
        >
          <ChefHat className="size-6" />
        </div>
        <button
          onClick={() => setOn((v) => !v)}
          className={`size-10 rounded-full flex items-center justify-center transition-colors ${
            on ? "bg-active text-active-foreground" : "bg-muted text-muted-foreground"
          }`}
          aria-label="Toggle kitchen"
        >
          <Power className="size-4" />
        </button>
      </div>

      <div className="flex items-center justify-center py-2">
        <img
          src={logoAsset.url}
          alt="Little Caesars"
          className="h-12 w-auto object-contain"
        />
      </div>

      <div className="mt-auto">
        <div className="text-xs text-muted-foreground">Kitchen</div>
        <div className="text-base font-medium">{name}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <Thermometer className="size-3" />
          <span>{on ? `Oven ${ovenTemp}°C` : "Oven off"}</span>
        </div>
        <input
          type="range"
          min={100}
          max={250}
          value={ovenTemp}
          disabled={!on}
          onChange={(e) => setOvenTemp(Number(e.target.value))}
          className="w-full mt-3 accent-[var(--active)] disabled:opacity-40"
        />
      </div>
    </div>
  );
}
