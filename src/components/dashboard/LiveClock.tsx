import { useEffect, useState } from "react";
import { Droplets, Thermometer } from "lucide-react";
import type { OutdoorWeather } from "@/lib/homeassistant.types";
import { formatClimateLabel } from "@/lib/utils";

type LiveClockProps = {
  weather: OutdoorWeather | null;
};

const CX = 100;
const CY = 100;

function handRotation(date: Date, unit: "hour" | "minute" | "second") {
  if (unit === "second") return (date.getSeconds() / 60) * 360;
  if (unit === "minute") return ((date.getMinutes() + date.getSeconds() / 60) / 60) * 360;
  return (((date.getHours() % 12) + date.getMinutes() / 60) / 12) * 360;
}

function ClockHand({
  angle,
  length,
  width,
  className,
  tail = 0,
}: {
  angle: number;
  length: number;
  width: number;
  className: string;
  tail?: number;
}) {
  return (
    <g transform={`rotate(${angle} ${CX} ${CY})`}>
      <line
        x1={CX}
        y1={CY + tail}
        x2={CX}
        y2={CY - length}
        className={className}
        strokeWidth={width}
      />
    </g>
  );
}

function AnalogFace({ date }: { date: Date }) {
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  return (
    <svg
      viewBox="0 0 200 200"
      className="analog-clock__svg w-full max-w-[min(20rem,100%)] aspect-square"
      role="img"
      aria-label={date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
    >
      <circle cx={CX} cy={CY} r="94" className="analog-clock__ring" />

      {Array.from({ length: 60 }, (_, i) => {
        const major = i % 5 === 0;
        return (
          <line
            key={i}
            x1={CX}
            y1="12"
            x2={CX}
            y2={major ? "20" : "16"}
            className={major ? "analog-clock__tick analog-clock__tick--major" : "analog-clock__tick"}
            transform={`rotate(${i * 6} ${CX} ${CY})`}
          />
        );
      })}

      {hours.map((label, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const r = 74;
        const x = CX + r * Math.cos(angle);
        const y = CY + r * Math.sin(angle);
        return (
          <text
            key={label}
            x={x}
            y={y}
            className="analog-clock__number"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {label}
          </text>
        );
      })}

      <ClockHand
        angle={handRotation(date, "hour")}
        length={42}
        width={5}
        tail={8}
        className="analog-clock__hand analog-clock__hand--hour"
      />
      <ClockHand
        angle={handRotation(date, "minute")}
        length={62}
        width={3}
        tail={10}
        className="analog-clock__hand analog-clock__hand--minute"
      />
      <ClockHand
        angle={handRotation(date, "second")}
        length={68}
        width={1.5}
        tail={16}
        className="analog-clock__hand analog-clock__hand--second"
      />

      <circle cx={CX} cy={CY} r="4" className="analog-clock__hub" />
      <circle cx={CX} cy={CY} r="1.5" className="analog-clock__hub-cap" />
    </svg>
  );
}

export function LiveClock({ weather }: LiveClockProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateLabel = now?.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const timeLabel = now?.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="live-clock h-full w-full flex flex-col items-center justify-center text-center px-4 py-6">
      {now ? (
        <time dateTime={now.toISOString()} className="block w-full max-w-[20rem]" suppressHydrationWarning>
          <AnalogFace date={now} />
          {timeLabel ? (
            <p className="live-clock__digital mt-4 tabular-nums text-muted-foreground" suppressHydrationWarning>
              {timeLabel}
            </p>
          ) : null}
        </time>
      ) : (
        <div className="analog-clock__placeholder w-full max-w-[20rem] aspect-square rounded-full" />
      )}

      {dateLabel ? (
        <p className="live-clock__date mt-3 text-muted-foreground" suppressHydrationWarning>
          {dateLabel}
        </p>
      ) : null}

      {weather && (weather.temperature != null || weather.humidity != null) ? (
        <div className="live-clock__weather mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {weather.temperature != null ? (
            <span className="inline-flex items-center gap-2 tabular-nums">
              <Thermometer className="size-4 shrink-0 text-brand/80" strokeWidth={1.5} />
              <span>{weather.temperature}°C outside</span>
            </span>
          ) : null}
          {weather.humidity != null ? (
            <span className="inline-flex items-center gap-2 tabular-nums">
              <Droplets className="size-4 shrink-0 text-cool/80" strokeWidth={1.5} />
              <span>{weather.humidity}% humidity</span>
            </span>
          ) : null}
        </div>
      ) : null}

      {weather?.condition ? (
        <p className="live-clock__condition mt-1.5 text-xs text-muted-foreground/80">
          {formatClimateLabel(weather.condition)}
        </p>
      ) : null}
    </div>
  );
}
