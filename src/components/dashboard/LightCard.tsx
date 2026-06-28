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
    <div className="h-full rounded-2xl bg-card p-4 border border-border flex flex-col items-center justify-center gap-3 text-center">
      <button
        onClick={() => mutation.mutate(!on)}
        disabled={pending}
        className={`size-16 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 ${
          on
            ? "bg-active text-active-foreground shadow-[0_0_24px_-4px_var(--active)]"
            : "bg-muted text-muted-foreground"
        }`}
        aria-label="Toggle light"
      >
        <Lightbulb className="size-7" />
      </button>
      <div>
        <div className="text-sm font-medium truncate">{light.name}</div>
        <div className={`text-xs font-medium ${on ? "text-active" : "text-muted-foreground"}`}>
          {pending ? "…" : on ? "On" : "Off"}
        </div>
      </div>
    </div>
  );
}
