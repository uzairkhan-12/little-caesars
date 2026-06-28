import { createFileRoute } from "@tanstack/react-router";
import { Settings, RefreshCw } from "lucide-react";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import logoAsset from "@/assets/little-caesars-logo.png.asset.json";
import { LightCard } from "@/components/dashboard/LightCard";
import { CamerasCard } from "@/components/dashboard/CamerasCard";
import { AcCard } from "@/components/dashboard/AcCard";
import { getDashboardData } from "@/lib/homeassistant.functions";

const dashboardQuery = queryOptions({
  queryKey: ["ha", "dashboard"],
  queryFn: () => getDashboardData(),
  refetchInterval: 10_000,
  staleTime: 5_000,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kitchen Dashboard" },
      { name: "description", content: "Live Home Assistant control: lights, camera, AC." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery),
  component: Dashboard,
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center text-sm text-destructive">
      Failed to load Home Assistant: {error.message}
    </div>
  ),
});

function Dashboard() {
  const { data } = useSuspenseQuery(dashboardQuery);
  const qc = useQueryClient();

  const climates = data.climates.slice(0, 3);
  while (climates.length < 3) {
    climates.push(null as any);
  }

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col">
      <header className="flex-none px-6 py-5 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <img src={logoAsset.url} alt="Little Caesars" className="h-9 w-auto object-contain" />
          <div>
            <h1 className="text-lg font-semibold leading-tight">Kitchen</h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => qc.invalidateQueries({ queryKey: ["ha", "dashboard"] })}
            className="size-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent transition"
            aria-label="Refresh"
          >
            <RefreshCw className="size-4" />
          </button>
          <button className="size-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent transition">
            <Settings className="size-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 px-6 pb-4 flex flex-col gap-4">
        <section className="flex-none grid grid-cols-2 lg:grid-cols-4 gap-4 h-[32%] lg:h-[30%]">
          {climates.map((climate, idx) =>
            climate ? (
              <AcCard key={climate.entity_id} climate={climate} />
            ) : (
              <EmptyAcSlot key={`ac-empty-${idx}`} index={idx + 1} />
            )
          )}
          {data.lights.length > 0 ? (
            <LightCard key={data.lights[0].entity_id} light={data.lights[0]} />
          ) : (
            <EmptyCard label="No light found" />
          )}
        </section>

        <section className="flex-1 min-h-0">
          <CamerasCard camera={data.cameras[0] ?? null} />
        </section>
      </main>
    </div>
  );
}

function EmptyAcSlot({ index }: { index: number }) {
  return (
    <div className="h-full rounded-2xl border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
      AC {index} not connected
    </div>
  );
}

function EmptyCard({ label }: { label: string }) {
  return (
    <div className="h-full rounded-2xl border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
      {label}
    </div>
  );
}
