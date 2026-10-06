import "server-only";

import { yahooSymbol, type Instrument } from "@/lib/instruments";
import type { RangeId } from "@/lib/ranges";
import { warsawDay } from "@/lib/time";
import type { Bar, Quote } from "@/lib/types";

const ENDPOINT = "https://query1.finance.yahoo.com/v8/finance/chart";

type YahooQuoteArrays = {
  open?: Array<number | null>;
  high?: Array<number | null>;
  low?: Array<number | null>;
  close?: Array<number | null>;
  volume?: Array<number | null>;
};

type YahooResult = {
  meta: {
    regularMarketPrice?: number;
    previousClose?: number;
    chartPreviousClose?: number;
    regularMarketDayHigh?: number;
    regularMarketDayLow?: number;
    regularMarketVolume?: number;
    regularMarketTime?: number;
    currency?: string;
  };
  timestamp?: number[];
  indicators?: { quote?: YahooQuoteArrays[] };
};

export class YahooError extends Error {}

export async function fetchYahooQuote(instrument: Instrument): Promise<Quote> {
  const result = await fetchChart(yahooSymbol(instrument.ticker), "5m", "1d");
  const price = result.meta.regularMarketPrice;
  const previousClose = result.meta.previousClose ?? result.meta.chartPreviousClose;
  if (!isFiniteNumber(price) || !isFiniteNumber(previousClose) || previousClose === 0) {
    throw new YahooError(`Brak kursu dla ${instrument.ticker}`);
  }
  const change = price - previousClose;
  return {
    ticker: instrument.ticker,
    label: instrument.label,
    name: instrument.name,
    kind: instrument.kind,
    price,
    previousClose,
    change,
    changePercent: (change / previousClose) * 100,
    dayHigh: finiteOrNull(result.meta.regularMarketDayHigh),
    dayLow: finiteOrNull(result.meta.regularMarketDayLow),
    volume: finiteOrNull(result.meta.regularMarketVolume),
    currency: result.meta.currency || "PLN",
    time: result.meta.regularMarketTime ?? Math.floor(Date.now() / 1000),
    source: "yahoo",
    about: instrument.about,
  };
}

export async function fetchYahooHistory(
  instrument: Instrument,
  range: RangeId,
): Promise<{ bars: Bar[]; intraday: boolean; note: string }> {
  const plan = historyPlan(instrument.kind, range);
  const result = await fetchChart(
    yahooSymbol(instrument.ticker),
    plan.interval,
    plan.span,
  );
  let bars = parseBars(result);
  if (plan.aggregateDaily) bars = aggregateDaily(bars);
  if (bars.length < 2) {
    throw new YahooError(`Za mało świec dla ${instrument.ticker}`);
  }
  return { bars, intraday: plan.intraday, note: plan.note };
}

function historyPlan(kind: Instrument["kind"], range: RangeId) {
  if (range === "sesja") {
    return {
      interval: "5m",
      span: "1d",
      aggregateDaily: false,
      intraday: true,
      note: "Świece pięciominutowe z bieżącej sesji.",
    };
  }
  if (range === "5d") {
    return {
      interval: "15m",
      span: "5d",
      aggregateDaily: false,
      intraday: true,
      note: "Świece piętnastominutowe z ostatnich sesji.",
    };
  }
  if (kind === "index") {
    const span = range === "1m" ? "1mo" : range === "6m" ? "6mo" : range === "1r" ? "1y" : "2y";
    return {
      interval: "1h",
      span,
      aggregateDaily: true,
      intraday: false,
      note: "Feed nie oddaje dziennej historii indeksów WIG, więc dłuższy zakres jest złożony z notowań godzinowych w świece dzienne.",
    };
  }
  const span = range === "1m" ? "1mo" : range === "6m" ? "6mo" : range === "1r" ? "1y" : "5y";
  return {
    interval: "1d",
    span,
    aggregateDaily: false,
    intraday: false,
    note: "Świece dzienne z publicznego feedu.",
  };
}

async function fetchChart(symbol: string, interval: string, range: string): Promise<YahooResult> {
  const url = `${ENDPOINT}/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false`;
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; GPWNotowania/1.0)",
      },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "błąd sieci";
    throw new YahooError(message);
  }
  if (!response.ok) {
    throw new YahooError(`Yahoo odpowiedziało ${response.status} dla ${symbol}`);
  }
  const body = (await response.json()) as {
    chart?: { result?: Array<YahooResult | null> | null; error?: { description?: string } | null };
  };
  const result = body.chart?.result?.[0];
  if (!result) {
    throw new YahooError(body.chart?.error?.description || `Brak serii dla ${symbol}`);
  }
  return result;
}

function parseBars(result: YahooResult): Bar[] {
  const times = result.timestamp ?? [];
  const quote = result.indicators?.quote?.[0];
  if (!quote) return [];
  const bars: Bar[] = [];
  for (let index = 0; index < times.length; index += 1) {
    const open = quote.open?.[index];
    const high = quote.high?.[index];
    const low = quote.low?.[index];
    const close = quote.close?.[index];
    if (
      !isFiniteNumber(open) ||
      !isFiniteNumber(high) ||
      !isFiniteNumber(low) ||
      !isFiniteNumber(close)
    ) {
      continue;
    }
    const volume = quote.volume?.[index];
    bars.push({
      time: times[index],
      open,
      high: Math.max(high, open, close),
      low: Math.min(low, open, close),
      close,
      volume: isFiniteNumber(volume) ? volume : null,
    });
  }
  return bars;
}

export function aggregateDaily(bars: Bar[]): Bar[] {
  const groups = new Map<string, Bar>();
  for (const bar of [...bars].sort((a, b) => a.time - b.time)) {
    const key = warsawDay(bar.time);
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, { ...bar });
      continue;
    }
    existing.high = Math.max(existing.high, bar.high);
    existing.low = Math.min(existing.low, bar.low);
    existing.close = bar.close;
    existing.volume =
      existing.volume == null && bar.volume == null
        ? null
        : (existing.volume ?? 0) + (bar.volume ?? 0);
  }
  return [...groups.values()];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function finiteOrNull(value: unknown): number | null {
  return isFiniteNumber(value) ? value : null;
}
