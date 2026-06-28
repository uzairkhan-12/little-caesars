import { useState, useEffect } from "react";
import { Video, Circle } from "lucide-react";
import type { CameraEntity } from "@/lib/homeassistant.functions";

export function CamerasCard({ camera }: { camera: CameraEntity | null }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="h-full rounded-2xl bg-card border border-border flex flex-col overflow-hidden">
      <div className="relative flex-1 min-h-0 m-4 rounded-xl bg-gradient-to-br from-surface-elevated to-background border border-border overflow-hidden">
        {mounted && camera?.stream_url ? (
          <img
            key={camera.stream_url}
            src={camera.stream_url}
            alt={camera.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : mounted && camera?.snapshot_url ? (
          <img
            key={camera.snapshot_url}
            src={camera.snapshot_url}
            alt={camera.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
            <Video className="size-8 opacity-30" />
            <span>{camera ? "Loading camera…" : "No camera feed"}</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-foreground/90 bg-black/60 px-2 py-1 rounded">
          <Circle className="size-1.5 fill-destructive text-destructive" />
          Rec
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
          <span className="bg-black/50 px-2 py-1 rounded text-foreground/90">{camera?.name ?? "—"}</span>
          <span className="bg-black/50 px-2 py-1 rounded text-muted-foreground">{camera?.state ?? "Offline"}</span>
        </div>
      </div>
    </div>
  );
}


