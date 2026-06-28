import { Video, Circle } from "lucide-react";

export function CamerasCard() {
  return (
    <div className="h-full rounded-2xl bg-card p-4 border border-border flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Video className="size-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Security</div>
            <div className="font-medium">Camera</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Circle className="size-2 fill-destructive text-destructive" />
          Live
        </div>
      </div>

      <div className="relative flex-1 rounded-xl bg-gradient-to-br from-surface-elevated to-background border border-border overflow-hidden group cursor-pointer min-h-0">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-foreground/80 bg-black/40 px-2 py-0.5 rounded">
          <Circle className="size-1.5 fill-destructive text-destructive" />
          Rec
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <span className="text-xs font-medium">Front Door</span>
          <span className="text-[10px] text-muted-foreground">1080p</span>
        </div>
      </div>
    </div>
  );
}
