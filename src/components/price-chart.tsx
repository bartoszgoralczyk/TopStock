"use client";

import { formatPrice } from "@/lib/format";
import { warsawDay } from "@/lib/time";
import type { Bar } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
};

export function PriceChart({
  bars,
  intraday,
}: {
  bars: Bar[];
  intraday: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<Candle | null>(null);
  const [failed, setFailed] = useState(false);
  const last = bars[bars.length - 1];
  const shown = hover ?? last;

  useEffect(() => {
    const node = host.current;
    if (!node || bars.length === 0) return;
    let removeChart: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      try {
        const { CandlestickSeries, ColorType, createChart } = await import(
          "lightweight-charts"
        );
        if (cancelled || !host.current) return;
        const chart = createChart(host.current, {
          autoSize: true,
          layout: {
            background: { type: ColorType.Solid, color: "#fffdf8" },
            textColor: "#5e574c",
            fontFamily: "IBM Plex Mono, ui-monospace, monospace",
          },
          grid: {
            vertLines: { color: "#efe8d8" },
            horzLines: { color: "#efe8d8" },
          },
          rightPriceScale: { borderColor: "#e2d9c8" },
          timeScale: {
            borderColor: "#e2d9c8",
            timeVisible: intraday,
            secondsVisible: false,
          },
          localization: {
            locale: "pl-PL",
            priceFormatter: (price: number) => formatPrice(price),
            timeFormatter: (time: unknown) => formatChartTime(time, intraday),
          },
        });
        const series = chart.addSeries(CandlestickSeries, {
          upColor: "#0c7a45",
          downColor: "#b42318",
          borderVisible: false,
          wickUpColor: "#0c7a45",
          wickDownColor: "#b42318",
        });
        series.setData(toCandles(bars, intraday));
        chart.timeScale().fitContent();
        chart.subscribeCrosshairMove((param) => {
          const point = param.seriesData.get(series) as Partial<Candle> | undefined;
          if (
            point &&
            typeof point.open === "number" &&
            typeof point.high === "number" &&
            typeof point.low === "number" &&
            typeof point.close === "number"
          ) {
            setHover({
              open: point.open,
              high: point.high,
              low: point.low,
              close: point.close,
            });
          } else {
            setHover(null);
          }
        });
        removeChart = () => chart.remove();
      } catch (error) {
        console.error(error);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      removeChart?.();
    };
  }, [bars, intraday]);

  if (bars.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-16 text-center text-sm text-muted-foreground">
        Brak świec w tym zakresie.
      </p>
    );
  }

  if (failed) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-16 text-center text-sm">
        Nie udało się narysować wykresu.
      </p>
    );
  }

  return (
    <div>
      {shown ? (
        <dl className="mb-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
          <div>
            <dt className="inline">O </dt>
            <dd className="inline text-foreground">{formatPrice(shown.open)}</dd>
          </div>
          <div>
            <dt className="inline">H </dt>
            <dd className="inline text-foreground">{formatPrice(shown.high)}</dd>
          </div>
          <div>
            <dt className="inline">L </dt>
            <dd className="inline text-foreground">{formatPrice(shown.low)}</dd>
          </div>
          <div>
            <dt className="inline">C </dt>
            <dd className="inline text-foreground">{formatPrice(shown.close)}</dd>
          </div>
        </dl>
      ) : null}
      <div ref={host} className="h-[320px] w-full md:h-[440px]" />
    </div>
  );
}

function toCandles(bars: Bar[], intraday: boolean) {
  const seen = new Set<string>();
  const points: Array<{ time: string | number; open: number; high: number; low: number; close: number }> = [];
  for (const bar of [...bars].sort((a, b) => a.time - b.time)) {
    const time = intraday ? bar.time : warsawDay(bar.time);
    const key = String(time);
    if (seen.has(key)) continue;
    seen.add(key);
    const high = Math.max(bar.high, bar.open, bar.close);
    const low = Math.min(bar.low, bar.open, bar.close);
    points.push({ time, open: bar.open, high, low, close: bar.close });
  }
  return points as never;
}

function formatChartTime(time: unknown, intraday: boolean): string {
  if (typeof time === "number") {
    return new Intl.DateTimeFormat("pl-PL", {
      timeZone: "Europe/Warsaw",
      day: "numeric",
      month: "short",
      hour: intraday ? "2-digit" : undefined,
      minute: intraday ? "2-digit" : undefined,
    }).format(new Date(time * 1000));
  }
  if (typeof time === "string") return time;
  if (time && typeof time === "object" && "year" in time) {
    const day = time as { year: number; month: number; day: number };
    return `${day.day}.${String(day.month).padStart(2, "0")}.${day.year}`;
  }
  return "";
}
