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

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col">
      <header className="flex-none px-6 py-4 flex items-center justify-between">
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

      <main className="flex-1 px-6 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        <section className="min-h-0 flex flex-col">
          <SectionTitle title="Lights" />
          <div className="flex-1 min-h-0 grid grid-cols-1 gap-4">
            {data.lights.length > 0 ? (
              data.lights.map((l) => <LightCard key={l.entity_id} light={l} />)
            ) : (
              <EmptyCard label="No lights found" />
            )}
          </div>
        </section>

        <section className="min-h-0 flex flex-col">
          <SectionTitle title="Security" />
          <div className="flex-1 min-h-0">
            <CamerasCard camera={data.cameras[0] ?? null} />
          </div>
        </section>

        <section className="lg:col-span-2 min-h-0 flex flex-col">
          <SectionTitle title="Climate" />
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.climates.length > 0 ? (
              data.climates.map((c) => <AcCard key={c.entity_id} climate={c} />)
            ) : (
              <EmptyCard label="No climate devices found" />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
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
