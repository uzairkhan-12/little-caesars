import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Wind, LightbulbOff } from "lucide-react";
import littleCaesarsLogo from "@/assets/little-caesars-logo.png";
import primewaveLogo from "@/assets/primewave-logo.png";
import { LightCard } from "@/components/dashboard/LightCard";
import { CamerasCard } from "@/components/dashboard/CamerasCard";
import { LiveClock } from "@/components/dashboard/LiveClock";
import { AcCard } from "@/components/dashboard/AcCard";
import { getDashboardData } from "@/lib/homeassistant.functions";
import { useHaWebSocket } from "@/hooks/useHaWebSocket";

const dashboardQuery = queryOptions({
  queryKey: ["ha", "dashboard"],
  queryFn: () => getDashboardData(),
  staleTime: Infinity,
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
    <div className="min-h-dvh flex items-center justify-center p-6 text-center text-sm text-destructive">
      Failed to load Home Assistant: {error.message}
    </div>
  ),
});

function ControlWrap({ children }: { children: React.ReactNode }) {
  return <div className="control-card-wrap min-w-0">{children}</div>;
}

function Dashboard() {
  const { data } = useSuspenseQuery(dashboardQuery);
  useHaWebSocket();

  const climates = data.climates.slice(0, 3);
  while (climates.length < 3) {
    climates.push(null as any);
  }

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const dateShort = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="dashboard-shell min-h-dvh w-full max-w-[100vw] lg:h-dvh flex flex-col overflow-x-hidden overflow-y-auto lg:overflow-hidden">
      <header className="dashboard-header flex-none sticky top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 border-b border-border/60 bg-surface/80 backdrop-blur-md">
        <div className="min-w-0 justify-self-start">
          <img
            src={littleCaesarsLogo}
            alt="Little Caesars"
            className="h-8 sm:h-10 lg:h-11 w-auto max-w-[6.5rem] sm:max-w-none object-contain object-left"
          />
        </div>

        <div className="text-center min-w-0 px-1">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <span className="live-dot shrink-0" aria-hidden />
            <h1 className="text-base sm:text-xl lg:text-2xl font-semibold tracking-tight truncate">
              Kitchen
            </h1>
          </div>
          <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 truncate">
            <span className="md:hidden">{dateShort}</span>
            <span className="hidden md:inline">{dateLabel}</span>
          </p>
        </div>

        <div className="min-w-0 justify-self-end flex items-center justify-end gap-1.5 sm:gap-3">
          <img
            src={primewaveLogo}
            alt="PrimeWave AI Solutions"
            className="h-8 sm:h-9 lg:h-10 w-auto max-w-[4.5rem] sm:max-w-none object-contain object-right opacity-90"
          />
          <div className="text-right leading-tight hidden md:block">
            <div className="text-sm tracking-wide">
              <span className="font-extrabold text-foreground">PRIME</span>WAVE
            </div>
            <div className="text-[10px] text-muted-foreground tracking-wider uppercase">
              AI Solutions
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main flex-1 min-h-0 flex flex-col lg:overflow-hidden">
        <section aria-label="Climate and lighting controls" className="flex-none">
          <p className="section-label mb-2 sm:mb-3">Controls</p>

          <div className="controls-grid">
            {climates.map((climate, idx) =>
              climate ? (
                <ControlWrap key={climate.entity_id}>
                  <AcCard climate={climate} />
                </ControlWrap>
              ) : (
                <ControlWrap key={`ac-empty-${idx}`}>
                  <EmptyAcSlot index={idx + 1} />
                </ControlWrap>
              ),
            )}
            <ControlWrap>
              {data.lights.length > 0 ? (
                <LightCard light={data.lights[0]} />
              ) : (
                <EmptyCard label="No light found" icon={LightbulbOff} />
              )}
            </ControlWrap>
          </div>
        </section>

        <section className="camera-section flex-none lg:flex-1 lg:min-h-0 flex flex-col" aria-label="Camera feed">
          <p className="section-label mb-2 sm:mb-3">Live Feed</p>
          <div className="camera-layout flex-1 min-h-0 lg:items-center">
            <div className="camera-frame min-h-0 flex items-center">
              <CamerasCard camera={data.cameras[0] ?? null} />
            </div>
            <aside
              className="clock-aside hidden lg:flex min-h-0 items-center justify-center"
              aria-label="Local time"
            >
              <LiveClock weather={data.outdoor_weather} />
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}

function EmptyAcSlot({ index }: { index: number }) {
  return (
    <div className="dashboard-card control-card h-full lg:min-h-0 flex flex-col items-center justify-center gap-2 border-dashed bg-card/30 text-muted-foreground py-6 sm:py-4">
      <Wind className="size-5 opacity-35" strokeWidth={1.5} />
      <span className="text-xs font-medium">AC {index}</span>
      <span className="text-[10px] opacity-70">Not connected</span>
    </div>
  );
}

function EmptyCard({
  label,
  icon: Icon,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <div className="dashboard-card control-card h-full lg:min-h-0 flex flex-col items-center justify-center gap-2 border-dashed bg-card/30 text-muted-foreground py-6 sm:py-4">
      <Icon className="size-5 opacity-35" strokeWidth={1.5} />
      <span className="text-xs">{label}</span>
    </div>
  );
}
