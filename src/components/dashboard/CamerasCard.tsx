import { Video, Circle } from "lucide-react";
import type { CameraEntity } from "@/lib/homeassistant.functions";

export function CamerasCard({ camera }: { camera: CameraEntity | null }) {
  return (
    <div className="h-full rounded-2xl bg-card border border-border flex flex-col overflow-hidden">
      <div className="flex-none px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Video className="size-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Security</div>
            <div className="text-sm font-medium">{camera?.name ?? "Camera"}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-black/30 px-2.5 py-1 rounded-full">
          <Circle className="size-2 fill-destructive text-destructive animate-pulse" />
          Live
        </div>
      </div>

      <div className="relative flex-1 min-h-0 mx-4 mb-4 rounded-xl bg-gradient-to-br from-surface-elevated to-background border border-border overflow-hidden">
        {camera?.snapshot_url ? (
          <img
            src={camera.snapshot_url}
            alt={camera.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            No camera feed
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
