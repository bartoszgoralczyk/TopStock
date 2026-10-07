import "server-only";

import { fallbackHistory, fallbackQuote } from "@/lib/fallback";
import { findInstrument, INSTRUMENTS, type Instrument } from "@/lib/instruments";
import { DEFAULT_RANGE, type RangeId } from "@/lib/ranges";
import type { Board, BoardSource, HistoryPayload, Quote } from "@/lib/types";
import { fetchYahooHistory, fetchYahooQuote } from "@/lib/yahoo";
import { cache } from "react";

export const getBoard = cache(async (): Promise<Board> => {
  const tracked = INSTRUMENTS.filter((item) => item.kind === "index" || item.featured);
  const settled = await mapPool(tracked, 6, getQuote);
  const quotes = settled.filter((quote): quote is Quote => quote != null);
  const indices = quotes.filter((quote) => quote.kind === "index");
  const stocks = quotes.filter((quote) => quote.kind === "equity");
  const localCount = quotes.filter((quote) => quote.source === "local").length;
  const source: BoardSource =
    localCount === 0 ? "yahoo" : localCount === quotes.length ? "local" : "mixed";
  const asOf = quotes.reduce((latest, quote) => Math.max(latest, quote.time), 0);
  return { indices, stocks, source, asOf };
});

export async function getQuote(instrument: Instrument): Promise<Quote | null> {
  try {
    return await fetchYahooQuote(instrument);
  } catch (error) {
    const local = fallbackQuote(instrument);
    if (!local) return null;
    console.error(`Kurs ${instrument.ticker} z zapisu lokalnego:`, error);
    return local;
  }
}

export async function quoteMany(instruments: Instrument[]): Promise<Array<Quote | null>> {
  return mapPool(instruments, 8, getQuote);
}

export async function getInstrument(symbol: string): Promise<Quote | null> {
  const instrument = findInstrument(symbol);
  if (!instrument) return null;
  return getQuote(instrument);
}

export async function getHistory(
  symbol: string,
  range: RangeId = DEFAULT_RANGE,
): Promise<HistoryPayload | null> {
  const instrument = findInstrument(symbol);
  if (!instrument) return null;
  try {
    const live = await fetchYahooHistory(instrument, range);
    return {
      ticker: instrument.ticker,
      range,
      intraday: live.intraday,
      source: "yahoo",
      note: live.note,
      bars: live.bars,
    };
  } catch (error) {
    const local = fallbackHistory(instrument, range);
    if (!local) return null;
    console.error(`Historia ${instrument.ticker} z zapisu lokalnego:`, error);
    return {
      ticker: instrument.ticker,
      range,
      intraday: local.intraday,
      source: "local",
      note: local.note,
      bars: local.bars,
    };
  }
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await task(items[index]);
    }
  }
  const workers = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return results;
}
