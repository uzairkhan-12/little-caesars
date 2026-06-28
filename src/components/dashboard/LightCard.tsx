import { useState } from "react";
import { Lightbulb, Power } from "lucide-react";

export function LightCard({ name = "Living Room Light" }: { name?: string }) {
  const [on, setOn] = useState(true);

  return (
    <div className="h-full rounded-2xl bg-card p-4 border border-border flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div
          className={`size-12 rounded-xl flex items-center justify-center transition-colors ${
            on ? "bg-active/20 text-active" : "bg-muted text-muted-foreground"
          }`}
        >
          <Lightbulb className="size-6" />
        </div>
        <button
          onClick={() => setOn((v) => !v)}
          className={`size-10 rounded-full flex items-center justify-center transition-colors ${
            on ? "bg-active text-active-foreground" : "bg-muted text-muted-foreground"
          }`}
          aria-label="Toggle light"
        >
          <Power className="size-4" />
        </button>
      </div>
      <div className="mt-auto">
        <div className="text-xs text-muted-foreground">Light</div>
        <div className="text-base font-medium">{name}</div>
        <div className={`text-xs mt-1 font-medium ${on ? "text-active" : "text-muted-foreground"}`}>
          {on ? "On" : "Off"}
        </div>
      </div>
    </div>
  );
}
