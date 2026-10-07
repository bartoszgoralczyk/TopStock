import "server-only";

const BASE = "https://public-api.finwire.pl";

export type FinwireMeta = {
  source?: string;
  asOf?: string | null;
  fetchedAt?: string;
};

type Envelope<T> = {
  data: T;
  meta?: FinwireMeta;
};

export type RateEntry = {
  id: string;
  name: string;
  shortName: string;
  group: string;
  value: number;
  change: number;
  date: string;
};

export type CpiEntry = {
  period: string;
  yoy: number | null;
  mom: number | null;
};

export type FxEntry = {
  code: string;
  name: string;
  mid: number;
  changePct: number;
  date: string;
  is_main?: boolean;
};

export type HousingCity = {
  miasto: string;
  pricePerM2Wtorny: number | null;
  pricePerM2Pierwotny: number | null;
  priceYoY: number | null;
};

export type WageSummary = {
  label: string;
  meanPln: number;
  medianPln: number;
  medianMenPln: number;
  medianWomenPln: number;
};

export type BondEntry = {
  code: string;
  month: string;
  first_year_rate: number;
  margin_over_cpi: number | null;
  indexation_type: string;
};

export type LegalLimits = {
  year: number;
  ike: number;
  ikze: number;
  ikzeSelfemployed: number;
};

export type Barometer = {
  slug: string;
  shortTitle: string;
  tagline: string;
  value: number;
  valueFormat: string;
  unit: string;
  gaugeLabel: string;
  asOf: string;
};

export type CreditStress = {
  national: {
    avgStressPct: number;
    medianStressPct: number;
    mostStressed: { label: string; stressPct: number };
    leastStressed: { label: string; stressPct: number };
    countAboveKnf: number;
    regionCount: number;
  };
  regions: Array<{ label: string; stressPct: number; capitalCity: string }>;
};

export type RateAggregate = {
  count: number;
  min: number;
  median: number;
  max: number;
};

export type DepositRates = {
  model: { amount: number; period: number; currency: string };
  bankCount: number;
  rates: { interestRate: RateAggregate | null };
};

export type SavingsRates = {
  model: { amount: number };
  bankCount: number;
  rates: { interestRate: RateAggregate | null };
};

export type MortgageRates = {
  model: { amount: number; period: number; ltvPct: number };
  bankCount: number;
  rates: {
    rrso: RateAggregate | null;
    margin: RateAggregate | null;
    nominalRate: RateAggregate | null;
  };
};

export type CashLoanRates = {
  model: { amount: number; period: number };
  bankCount: number;
  rates: { rrso: RateAggregate | null; nominalRate: RateAggregate | null };
};

export async function fetchFinwire<T>(path: string): Promise<Envelope<T>> {
  const response = await fetch(`${BASE}${path}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "GPWNotowania/1.0",
    },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`finwire ${response.status}`);
  }
  const body = (await response.json()) as Envelope<T>;
  if (!body || typeof body !== "object" || body.data == null) {
    throw new Error("finwire empty");
  }
  return body;
}
