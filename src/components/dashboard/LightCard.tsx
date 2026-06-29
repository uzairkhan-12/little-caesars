import { Lightbulb } from "lucide-react";
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
    <div className="dashboard-card control-card h-full lg:min-h-0 p-3 sm:p-4 flex flex-row sm:flex-col items-center justify-between sm:justify-between gap-3 sm:gap-2 text-center">
      <div className="flex-1 sm:w-full text-left min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Lighting</div>
        <div className="text-xs font-medium truncate mt-0.5">{light.name}</div>
        <div
          className={`sm:hidden text-xs font-semibold uppercase tracking-wide mt-1 ${
            on ? "text-brand" : "text-muted-foreground"
          }`}
        >
          {pending ? "Updating…" : on ? "On" : "Off"}
        </div>
      </div>

      <button
        onClick={() => mutation.mutate(!on)}
        disabled={pending}
        className={`light-toggle size-14 sm:size-[4.5rem] min-h-[56px] min-w-[56px] sm:min-h-[4.5rem] sm:min-w-[4.5rem] rounded-2xl flex items-center justify-center transition-all duration-300 disabled:opacity-50 touch-manipulation active:scale-95 shrink-0 ${
          on ? "light-toggle--on" : "light-toggle--off"
        }`}
        aria-label="Toggle light"
      >
        <Lightbulb className="size-7 sm:size-8" strokeWidth={1.5} />
      </button>

      <div
        className={`hidden sm:block text-xs font-semibold uppercase tracking-wide ${
          on ? "text-brand" : "text-muted-foreground"
        }`}
      >
        {pending ? "Updating…" : on ? "On" : "Off"}
      </div>
    </div>
  );
}
