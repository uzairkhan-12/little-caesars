import { useState, useEffect } from "react";
import { Video, WifiOff } from "lucide-react";
import type { CameraEntity } from "@/lib/homeassistant.functions";

export function CamerasCard({ camera }: { camera: CameraEntity | null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const imageSrc = camera?.stream_url ?? camera?.snapshot_url ?? null;

  return (
    <div className="camera-feed h-full w-full overflow-hidden relative flex items-center justify-center lg:items-center lg:justify-center xl:items-start xl:justify-start">
      {mounted && imageSrc ? (
        <img
          key={imageSrc}
          src={imageSrc}
          alt=""
          className="relative z-10 w-full h-full object-cover sm:object-contain lg:object-contain xl:object-left-top max-lg:mx-auto"
        />
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center gap-3 text-muted-foreground px-4 text-center">
          {camera ? (
            <>
              <Video className="size-10 opacity-25" strokeWidth={1.25} />
              <span className="text-sm">Loading camera feed…</span>
            </>
          ) : (
            <>
              <WifiOff className="size-10 opacity-25" strokeWidth={1.25} />
              <span className="text-sm">No camera connected</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
