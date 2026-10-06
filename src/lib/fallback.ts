import "server-only";

import snapshotJson from "@/data/snapshot.json";
import { yahooSymbol, type Instrument } from "@/lib/instruments";
import type { RangeId } from "@/lib/ranges";
import { unixAtWarsaw, warsawDay, weekdaySessions } from "@/lib/time";
import type { Bar, Quote } from "@/lib/types";

type SnapshotRow = {
  yahoo: string;
  price: number;
  previousClose: number;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  time: number;
  currency: string;
};

const snapshot = snapshotJson as SnapshotRow[];

const LOCAL_NOTE =
  "Feed nie odpowiedział. Wykres jest lokalnym przybliżeniem od zapisanego kursu, a nie historią z parkietu.";

export function fallbackQuote(instrument: Instrument): Quote {
  const row = rowFor(instrument);
  const change = row.price - row.previousClose;
  return {
    ticker: instrument.ticker,
    label: instrument.label,
    name: instrument.name,
    kind: instrument.kind,
    price: row.price,
    previousClose: row.previousClose,
    change,
    changePercent: (change / row.previousClose) * 100,
    dayHigh: row.dayHigh,
    dayLow: row.dayLow,
    volume: row.volume,
    currency: row.currency || "PLN",
    time: row.time,
    source: "local",
    about: instrument.about,
  };
}

export function fallbackHistory(
  instrument: Instrument,
  range: RangeId,
): { bars: Bar[]; intraday: boolean; note: string } {
  const row = rowFor(instrument);
  const rand = mulberry32(hash(instrument.ticker + range));
  if (range === "sesja" || range === "5d") {
    return {
      bars: intradayBars(row, range, rand),
      intraday: true,
      note: LOCAL_NOTE,
    };
  }
  const sessions = range === "1m" ? 22 : range === "6m" ? 130 : range === "1r" ? 252 : 520;
  return {
    bars: dailyBars(row, sessions, rand),
    intraday: false,
    note: LOCAL_NOTE,
  };
}

function rowFor(instrument: Instrument): SnapshotRow {
  const yahoo = yahooSymbol(instrument.ticker);
  const row = snapshot.find((item) => item.yahoo === yahoo);
  if (!row || !row.previousClose) {
    return {
      yahoo,
      price: 100,
      previousClose: 100,
      dayHigh: 101,
      dayLow: 99,
      volume: instrument.kind === "index" ? null : 10_000,
      time: Math.floor(Date.now() / 1000),
      currency: "PLN",
    };
  }
  return row;
}

function dailyBars(row: SnapshotRow, sessions: number, rand: () => number): Bar[] {
  const endDay = warsawDay(row.time);
  const days = weekdaySessions(sessions, endDay);
  const older = row.previousClose * (0.82 + rand() * 0.3);
  const closes = bridge(older, row.previousClose, Math.max(2, days.length - 1), rand);
  closes.push(row.price);
  return closes.map((close, index) => {
    const previous = index === 0 ? close : closes[index - 1];
    let open = previous * (1 + (rand() - 0.5) * 0.006);
    let high = Math.max(open, close) * (1 + rand() * 0.008);
    let low = Math.min(open, close) * (1 - rand() * 0.008);
    if (index === closes.length - 1) {
      if (row.dayHigh != null) high = Math.max(high, row.dayHigh);
      if (row.dayLow != null) low = Math.min(low, row.dayLow);
      open = row.previousClose;
    }
    high = Math.max(high, open, close);
    low = Math.min(low, open, close);
    return {
      time: unixAtWarsaw(days[index] ?? endDay, 12, 0),
      open,
      high,
      low,
      close,
      volume: varyVolume(row.volume, rand),
    };
  });
}

function intradayBars(row: SnapshotRow, range: RangeId, rand: () => number): Bar[] {
  const step = range === "sesja" ? 5 : 15;
  const sessionCount = range === "sesja" ? 1 : 5;
  const endDay = warsawDay(row.time);
  const days = weekdaySessions(sessionCount, endDay);
  const slots: number[] = [];
  for (const day of days) {
    for (let minute = 9 * 60; minute <= 17 * 60; minute += step) {
      const stamp = unixAtWarsaw(day, Math.floor(minute / 60), minute % 60);
      if (day === endDay && stamp > row.time) break;
      slots.push(stamp);
    }
  }
  if (slots.length < 2) {
    slots.push(row.time - 300, row.time);
  }
  const closes = bridge(row.previousClose, row.price, slots.length, rand);
  return closes.map((close, index) => {
    const previous = index === 0 ? row.previousClose : closes[index - 1];
    const open = previous;
    let high = Math.max(open, close) * (1 + rand() * 0.0015);
    let low = Math.min(open, close) * (1 - rand() * 0.0015);
    if (index === closes.length - 1) {
      if (row.dayHigh != null) high = Math.max(high, row.dayHigh);
      if (row.dayLow != null) low = Math.min(low, row.dayLow);
    }
    return {
      time: slots[index],
      open,
      high: Math.max(high, open, close),
      low: Math.min(low, open, close),
      close,
      volume: varyVolume(row.volume == null ? null : row.volume / slots.length, rand),
    };
  });
}

function bridge(start: number, end: number, steps: number, rand: () => number): number[] {
  if (steps <= 1) return [end];
  const noise = [0];
  for (let index = 1; index < steps; index += 1) {
    noise.push(noise[index - 1] + (rand() - 0.5));
  }
  const closes: number[] = [];
  for (let index = 0; index < steps; index += 1) {
    const progress = index / (steps - 1);
    const drifted =
      Math.log(Math.max(start, 0.01)) +
      progress * (Math.log(Math.max(end, 0.01)) - Math.log(Math.max(start, 0.01)));
    const wiggle = noise[index] - progress * noise[steps - 1];
    closes.push(Math.exp(drifted + wiggle * 0.012));
  }
  closes[0] = start;
  closes[steps - 1] = end;
  return closes;
}

function varyVolume(base: number | null, rand: () => number): number | null {
  if (base == null) return null;
  return Math.max(0, Math.round(base * (0.7 + rand() * 0.6)));
}

function hash(value: string): number {
  let seed = 2166136261;
  for (const char of value) {
    seed ^= char.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
}

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}
