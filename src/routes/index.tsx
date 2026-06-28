import { createFileRoute } from "@tanstack/react-router";
import { Home, Settings } from "lucide-react";
import { LightCard } from "@/components/dashboard/LightCard";
import { CamerasCard } from "@/components/dashboard/CamerasCard";
import { AcCard } from "@/components/dashboard/AcCard";
import { KitchenCard } from "@/components/dashboard/KitchenCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Home Dashboard" },
      { name: "description", content: "Control lights, cameras and AC across your home." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="max-w-7xl mx-auto px-6 pt-8 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Home className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">My Home</h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        <button className="size-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent transition">
          <Settings className="size-4" />
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-12 space-y-8">
        <section>
          <SectionTitle title="Overview" subtitle="Quick controls" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <LightCard name="Living Room" />
            <KitchenCard name="Little Caesars" />
            <CamerasCard />
          </div>
        </section>

        <section>
          <SectionTitle title="Climate" subtitle="Air conditioning" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AcCard room="Bedroom" name="Bedroom AC" currentTemp={28} />
            <AcCard room="Living Room" name="Living Room AC" currentTemp={26} />
            <AcCard room="CEO Office" name="Office AC" currentTemp={24} />
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <span className="text-xs text-muted-foreground">{subtitle}</span>
    </div>
  );
}
