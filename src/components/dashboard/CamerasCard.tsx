import { Video, Circle } from "lucide-react";
import type { CameraEntity } from "@/lib/homeassistant.functions";

export function CamerasCard({ camera }: { camera: CameraEntity | null }) {
  return (
    <div className="h-full rounded-2xl bg-card p-4 border border-border flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Video className="size-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Security</div>
            <div className="font-medium">{camera?.name ?? "Camera"}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Circle className="size-2 fill-destructive text-destructive animate-pulse" />
          {camera?.state ?? "Offline"}
        </div>
      </div>

      <div className="relative flex-1 rounded-xl bg-gradient-to-br from-surface-elevated to-background border border-border overflow-hidden min-h-0">
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
        <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-foreground/90 bg-black/50 px-2 py-0.5 rounded">
          <Circle className="size-1.5 fill-destructive text-destructive" />
          Rec
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-black/40 px-2 py-1 rounded">
          <span className="text-xs font-medium">{camera?.name ?? "—"}</span>
          <span className="text-[10px] text-muted-foreground">Live</span>
        </div>
      </div>
    </div>
  );
}
