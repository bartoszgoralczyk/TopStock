import { findInstrument, type Instrument } from "@/lib/instruments";
import { quoteMany } from "@/lib/market";
import type { ListRow } from "@/lib/types";
import { NextRequest } from "next/server";

const MAX = 40;

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("symbole") ?? "";
  const symbols = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (symbols.length === 0 || symbols.length > MAX) {
    return Response.json({ error: "Podaj od 1 do 40 symboli." }, { status: 400 });
  }

  const instruments = symbols.map((symbol) => findInstrument(symbol));
  if (instruments.some((item) => !isListedEquity(item))) {
    return Response.json(
      { error: "Na liście jest symbol spoza katalogu spółek." },
      { status: 400 },
    );
  }

  const listed = instruments.filter(isListedEquity);
  const quotes = await quoteMany(listed);
  const rows: ListRow[] = listed.map((instrument, index) => {
    const quote = quotes[index];
    return {
      ticker: instrument.ticker,
      name: instrument.name,
      market: instrument.market,
      status: quote?.source ?? "missing",
      price: quote?.price ?? null,
      change: quote?.change ?? null,
      changePercent: quote?.changePercent ?? null,
      currency: quote?.currency ?? null,
    };
  });

  return Response.json(
    { rows },
    { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" } },
  );
}

function isListedEquity(
  instrument: Instrument | undefined,
): instrument is Instrument & { market: "gpw" | "newconnect" } {
  return Boolean(instrument && instrument.kind === "equity" && instrument.market);
}
