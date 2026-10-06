"use client";

import { HistoryNote } from "@/components/source-banner";
import { PriceChart } from "@/components/price-chart";
import { Button } from "@/components/ui/button";
import { RANGES, type RangeId } from "@/lib/ranges";
import type { HistoryPayload } from "@/lib/types";
import { useState } from "react";

export function HistoryPanel({ initial }: { initial: HistoryPayload }) {
  const [range, setRange] = useState<RangeId>(initial.range as RangeId);
  const [payload, setPayload] = useState(initial);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function select(next: RangeId) {
    if (next === range && status !== "error") return;
    setRange(next);
    setStatus("loading");
    try {
      const response = await fetch(
        `/api/historia?symbol=${encodeURIComponent(initial.ticker)}&zakres=${next}`,
      );
      if (!response.ok) throw new Error(`Historia ${response.status}`);
      const data = (await response.json()) as HistoryPayload;
      if (!Array.isArray(data.bars)) throw new Error("Zła odpowiedź wykresu");
      setPayload(data);
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <section className="rounded-xl bg-card p-3 ring-1 ring-foreground/10 md:p-4" aria-busy={status === "loading"}>
      <div className="mb-3 flex flex-wrap gap-2">
        {RANGES.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={item.id === range ? "default" : "outline"}
            onClick={() => void select(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      {status === "loading" ? (
        <p className="mb-2 text-sm text-muted-foreground">Wczytuję zakres…</p>
      ) : null}
      {status === "error" ? (
        <div className="mb-3 rounded-lg border border-destructive/30 bg-down-soft px-3 py-2 text-sm">
          <p>Nie udało się dociągnąć tego zakresu.</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => void select(range)}
          >
            Spróbuj ponownie
          </Button>
        </div>
      ) : null}
      <PriceChart
        key={`${payload.range}-${payload.source}-${payload.bars.at(-1)?.time ?? 0}`}
        bars={payload.bars}
        intraday={payload.intraday}
      />
      <div className="mt-3">
        <HistoryNote source={payload.source} note={payload.note} />
      </div>
    </section>
  );
}
