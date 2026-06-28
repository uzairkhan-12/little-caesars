import { Power, Lightbulb } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { callHaService, type LightEntity } from "@/lib/homeassistant.functions";

export function LightCard({ light }: { light: LightEntity }) {
  const qc = useQueryClient();
  const callService = useServerFn(callHaService);
  const mutation = useMutation({
    mutationFn: (on: boolean) =>
      callService({
        data: {
          domain: "light",
          service: on ? "turn_on" : "turn_off",
          entity_id: light.entity_id,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ha", "dashboard"] }),
  });

  const on = light.on;
  const pending = mutation.isPending;

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
          onClick={() => mutation.mutate(!on)}
          disabled={pending}
          className={`size-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${
            on ? "bg-active text-active-foreground" : "bg-muted text-muted-foreground"
          }`}
          aria-label="Toggle light"
        >
          <Power className="size-4" />
        </button>
      </div>
      <div className="mt-auto">
        <div className="text-xs text-muted-foreground">Light</div>
        <div className="text-base font-medium">{light.name}</div>
        <div className={`text-xs mt-1 font-medium ${on ? "text-active" : "text-muted-foreground"}`}>
          {pending ? "…" : on ? "On" : "Off"}
        </div>
      </div>
    </div>
  );
}
