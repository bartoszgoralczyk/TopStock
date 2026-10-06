import "server-only";

import { fallbackHistory, fallbackQuote } from "@/lib/fallback";
import { findInstrument, INSTRUMENTS, type Instrument } from "@/lib/instruments";
import { DEFAULT_RANGE, type RangeId } from "@/lib/ranges";
import type { Board, BoardSource, HistoryPayload, Quote } from "@/lib/types";
import { fetchYahooHistory, fetchYahooQuote } from "@/lib/yahoo";
import { cache } from "react";

export const getBoard = cache(async (): Promise<Board> => {
  const tracked = INSTRUMENTS.filter((item) => item.kind === "index" || item.featured);
  const quotes = await mapPool(tracked, 6, getQuote);
  const indices = quotes.filter((quote) => quote.kind === "index");
  const stocks = quotes.filter((quote) => quote.kind === "equity");
  const localCount = quotes.filter((quote) => quote.source === "local").length;
  const source: BoardSource =
    localCount === 0 ? "yahoo" : localCount === quotes.length ? "local" : "mixed";
  const asOf = quotes.reduce((latest, quote) => Math.max(latest, quote.time), 0);
  return { indices, stocks, source, asOf };
});

export async function getQuote(instrument: Instrument): Promise<Quote> {
  try {
    return await fetchYahooQuote(instrument);
  } catch (error) {
    console.error(`Kurs ${instrument.ticker} z zapisu lokalnego:`, error);
    return fallbackQuote(instrument);
  }
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
    console.error(`Historia ${instrument.ticker} z zapisu lokalnego:`, error);
    const local = fallbackHistory(instrument, range);
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
