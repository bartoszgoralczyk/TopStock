export type InstrumentKind = "index" | "equity";

export type DataSource = "yahoo" | "local";

export type BoardSource = "yahoo" | "mixed" | "local";

export type Quote = {
  ticker: string;
  label: string;
  name: string;
  kind: InstrumentKind;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  currency: string;
  time: number;
  source: DataSource;
  about: string;
};

export type Bar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
};

export type HistoryPayload = {
  ticker: string;
  range: string;
  intraday: boolean;
  source: DataSource;
  note: string;
  bars: Bar[];
};

export type Board = {
  indices: Quote[];
  stocks: Quote[];
  source: BoardSource;
  asOf: number;
};
