import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import logoAsset from "@/assets/little-caesars-logo.png.asset.json";
import { LightCard } from "@/components/dashboard/LightCard";
import { CamerasCard } from "@/components/dashboard/CamerasCard";
import { AcCard } from "@/components/dashboard/AcCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kitchen Dashboard" },
      { name: "description", content: "Control kitchen lights, camera and AC." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col">
      <header className="flex-none px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logoAsset.url}
            alt="Little Caesars"
            className="h-9 w-auto object-contain"
          />
          <div>
            <h1 className="text-lg font-semibold leading-tight">Kitchen</h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        <button className="size-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent transition">
          <Settings className="size-4" />
        </button>
      </header>

      <main className="flex-1 px-6 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        <section className="min-h-0 flex flex-col">
          <SectionTitle title="Overview" />
          <div className="flex-1 min-h-0">
            <LightCard name="Living Room" />
          </div>
        </section>

        <section className="min-h-0 flex flex-col">
          <SectionTitle title="Security" />
          <div className="flex-1 min-h-0">
            <CamerasCard />
          </div>
        </section>

        <section className="lg:col-span-2 min-h-0 flex flex-col">
          <SectionTitle title="Climate" />
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-4">
            <AcCard room="Bedroom" name="Bedroom AC" currentTemp={28} />
            <AcCard room="Living Room" name="Living Room AC" currentTemp={26} />
            <AcCard room="CEO Office" name="Office AC" currentTemp={24} />
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
