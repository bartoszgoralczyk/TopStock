import { Skeleton } from "@/components/ui/skeleton";
import { formatArticleDate, formatPercent, formatPrice, formatSigned, formatVolume, toneClass } from "@/lib/format";
import {
  fetchFinwire,
  type Barometer,
  type BondEntry,
  type CashLoanRates,
  type CpiEntry,
  type CreditStress,
  type DepositRates,
  type FxEntry,
  type HousingCity,
  type LegalLimits,
  type MortgageRates,
  type RateEntry,
  type SavingsRates,
  type WageSummary,
} from "@/lib/finwire";
import { Suspense, type ReactNode } from "react";

const SOURCE = "https://finwire.pl";

export function MacroSection() {
  return (
    <section className="mt-10" aria-labelledby="makro-naglowek">
      <div className="mb-4 max-w-3xl">
        <h2 id="makro-naglowek" className="font-heading text-2xl tracking-tight">
          Wskaźniki makro
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Stopy NBP, WIBOR, POLSTR, inflacja, kursy, mieszkania, płace i obligacje z publicznego API{" "}
          <a className="underline decoration-border underline-offset-2" href={SOURCE}>
            finwire.pl
          </a>
          . To nie są notowania GPW. Gdy jedna seria nie odpowie, pusta zostaje tylko jej karta.
        </p>
      </div>
      <div className="grid items-start gap-4 md:grid-cols-2">
        <Suspense fallback={<MacroSkeleton title="stopy, WIBOR i POLSTR" />}>
          <InterestBlock />
        </Suspense>
        <Suspense fallback={<MacroSkeleton title="inflację CPI" />}>
          <CpiBlock />
        </Suspense>
        <Suspense fallback={<MacroSkeleton title="kursy NBP" />}>
          <FxBlock />
        </Suspense>
        <Suspense fallback={<MacroSkeleton title="ceny mieszkań" />}>
          <HousingBlock />
        </Suspense>
        <Suspense fallback={<MacroSkeleton title="wynagrodzenia" />}>
          <WagesBlock />
        </Suspense>
        <Suspense fallback={<MacroSkeleton title="obligacje skarbowe" />}>
          <BondsBlock />
        </Suspense>
        <Suspense fallback={<MacroSkeleton title="limity IKE i IKZE" />}>
          <LimitsBlock />
        </Suspense>
        <Suspense fallback={<MacroSkeleton title="barometry finwire" />}>
          <BarometerBlock />
        </Suspense>
        <Suspense fallback={<MacroSkeleton title="stres kredytowy" />}>
          <StressBlock />
        </Suspense>
        <Suspense fallback={<MacroSkeleton title="lokaty" />}>
          <DepositBlock />
        </Suspense>
        <Suspense fallback={<MacroSkeleton title="konta oszczędnościowe" />}>
          <SavingsBlock />
        </Suspense>
        <Suspense fallback={<MacroSkeleton title="kredyty hipoteczne" />}>
          <MortgageBlock />
        </Suspense>
        <Suspense fallback={<MacroSkeleton title="kredyty gotówkowe" />}>
          <CashLoanBlock />
        </Suspense>
      </div>
    </section>
  );
}

function MacroSkeleton({ title }: { title: string }) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10" aria-busy="true">
      <p className="text-sm text-muted-foreground">Wczytuję {title}…</p>
      <Skeleton className="mt-3 h-20 w-full" />
    </div>
  );
}

function MacroError({ title }: { title: string }) {
  return (
    <section className="rounded-xl border border-destructive/30 bg-card p-4" role="alert">
      <h3 className="font-heading text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Ta seria nie odpowiedziała. Notowania spółek i indeksów powyżej zostają na tablicy.
      </p>
    </section>
  );
}

function MacroCard({
  title,
  asOf,
  children,
}: {
  title: string;
  asOf?: string | null;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-heading text-lg leading-none">{title}</h3>
        {asOf ? <p className="text-xs text-muted-foreground">{asOf}</p> : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Metric({
  label,
  value,
  change,
  hint,
}: {
  label: string;
  value: string;
  change?: number;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/70 py-1.5 last:border-b-0">
      <span className="text-sm">{label}</span>
      <span className="text-right">
        <span className="font-mono text-sm">{value}</span>
        {change == null ? null : (
          <span className={`ml-2 font-mono text-xs ${toneClass(change)}`}>{formatSigned(change)} pp</span>
        )}
        {hint ? <span className="ml-2 text-xs text-muted-foreground">{hint}</span> : null}
      </span>
    </div>
  );
}

function asOfLabel(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const day = value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return formatArticleDate(day);
  return value;
}

function percentPoints(value: number): string {
  return `${formatPrice(value)}%`;
}

function money(value: number): string {
  return `${formatVolume(value)} zł`;
}

function indexationLabel(kind: string): string {
  if (kind === "cpi_plus") return "inflacja + marża";
  if (kind === "wibor") return "WIBOR";
  if (kind === "fixed") return "stałe";
  return kind;
}

async function loadSeries<T>(path: string, ready: (data: T) => boolean): Promise<T | null> {
  try {
    const body = await fetchFinwire<T>(path);
    return ready(body.data) ? body.data : null;
  } catch {
    return null;
  }
}

async function InterestBlock() {
  const data = await loadSeries<{ entries: RateEntry[] }>(
    "/v1/series/interest-rate",
    (payload) => (payload.entries?.length ?? 0) > 0,
  );
  if (!data) return <MacroError title="Stopy, WIBOR i POLSTR" />;
  const entries = data.entries;
  const groups = [
      { id: "nbp", title: "Stopy NBP" },
      { id: "wibor", title: "WIBOR" },
      { id: "polstr", title: "POLSTR" },
    ];
  const dates = entries.map((entry) => entry.date).filter(Boolean).sort();
  return (
      <MacroCard title="Stopy, WIBOR i POLSTR" asOf={asOfLabel(dates.at(-1))}>
        <div className="space-y-4">
          {groups.map((group) => {
            const rows = entries.filter((entry) => entry.group === group.id);
            if (rows.length === 0) return null;
            return (
              <div key={group.id}>
                <p className="mb-1 text-xs tracking-wide text-muted-foreground uppercase">{group.title}</p>
                {rows.map((entry) => (
                  <Metric
                    key={entry.id}
                    label={entry.shortName || entry.name}
                    value={percentPoints(entry.value)}
                    change={entry.change}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </MacroCard>
  );
}

async function CpiBlock() {
  const data = await loadSeries<{ entries: CpiEntry[] }>(
    "/v1/series/cpi?type=monthly&limit=3",
    (payload) => payload.entries?.[0]?.yoy != null,
  );
  const latest = data?.entries[0];
  if (!latest || latest.yoy == null) return <MacroError title="Inflacja CPI" />;
  return (
      <MacroCard title="Inflacja CPI" asOf={asOfLabel(`${latest.period}-01`)}>
        <p className="font-mono text-3xl tracking-tight">{percentPoints(latest.yoy)}</p>
        <p className="mt-1 text-sm text-muted-foreground">r/r, odczyt GUS przez finwire.pl</p>
        {latest.mom == null ? null : (
          <p className="mt-3 text-sm">
            Miesiąc do miesiąca: <span className="font-mono">{percentPoints(latest.mom)}</span>
          </p>
        )}
      </MacroCard>
  );
}

async function FxBlock() {
  const data = await loadSeries<{ entries: FxEntry[] }>(
    "/v1/series/fx",
    (payload) => (payload.entries ?? []).some((entry) => entry.is_main),
  );
  const rows = (data?.entries ?? []).filter((entry) => entry.is_main);
  if (rows.length === 0) return <MacroError title="Kursy NBP" />;
  return (
      <MacroCard title="Kursy NBP" asOf={asOfLabel(rows[0]?.date)}>
        <div className="max-h-72 overflow-auto">
          {rows.map((entry) => (
            <Metric
              key={entry.code}
              label={`${entry.code} · ${entry.name}`}
              value={formatPrice(entry.mid)}
              hint={formatPercent(entry.changePct)}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Średni kurs tabeli A, zł za jednostkę.</p>
      </MacroCard>
  );
}

async function HousingBlock() {
  const data = await loadSeries<{ asOf?: string; cities: HousingCity[] }>(
    "/v1/series/housing",
    (payload) => (payload.cities?.length ?? 0) > 0,
  );
  const cities = data?.cities ?? [];
  if (cities.length === 0) return <MacroError title="Ceny mieszkań" />;
  return (
    <MacroCard title="Ceny mieszkań" asOf={data?.asOf}>
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-1 pr-2 font-medium">Miasto</th>
                <th className="py-1 pr-2 text-right font-medium">Wtórny</th>
                <th className="py-1 pr-2 text-right font-medium">Pierwotny</th>
                <th className="py-1 text-right font-medium">r/r</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => (
                <tr key={city.miasto} className="border-t border-border/70">
                  <td className="py-1.5 pr-2">{city.miasto}</td>
                  <td className="py-1.5 pr-2 text-right font-mono">{squarePrice(city.pricePerM2Wtorny)}</td>
                  <td className="py-1.5 pr-2 text-right font-mono">{squarePrice(city.pricePerM2Pierwotny)}</td>
                  <td className={`py-1.5 text-right font-mono ${toneClass(city.priceYoY ?? 0)}`}>
                    {city.priceYoY == null ? "—" : formatPercent(city.priceYoY)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Zł za m². Zero w źródle traktuję jako brak ceny.</p>
      </MacroCard>
  );
}

function squarePrice(value: number | null): string {
  if (value == null || value <= 0) return "—";
  return formatVolume(value);
}

async function WagesBlock() {
  const wages = await loadSeries<WageSummary>("/v1/wages", (payload) => payload.medianPln > 0);
  if (!wages) return <MacroError title="Wynagrodzenia" />;
  return (
    <MacroCard title="Wynagrodzenia" asOf={wages.label}>
      <Metric label="Mediana" value={money(wages.medianPln)} />
      <Metric label="Średnia" value={money(wages.meanPln)} />
      <Metric label="Mediana, mężczyźni" value={money(wages.medianMenPln)} />
      <Metric label="Mediana, kobiety" value={money(wages.medianWomenPln)} />
      <p className="mt-2 text-xs text-muted-foreground">Brutto, gospodarka narodowa, GUS przez finwire.pl.</p>
    </MacroCard>
  );
}

async function BondsBlock() {
  const data = await loadSeries<{ entries: BondEntry[] }>(
    "/v1/bonds",
    (payload) => (payload.entries?.length ?? 0) > 0,
  );
  const entries = data?.entries ?? [];
  if (entries.length === 0) return <MacroError title="Obligacje skarbowe" />;
  return (
    <MacroCard title="Obligacje detaliczne" asOf={asOfLabel(`${entries[0]?.month}-01`)}>
      {entries.map((entry) => (
        <Metric
          key={entry.code}
          label={entry.code}
          value={percentPoints(entry.first_year_rate * 100)}
          hint={
            entry.margin_over_cpi == null
              ? indexationLabel(entry.indexation_type)
              : `${indexationLabel(entry.indexation_type)}, marża ${formatPrice(entry.margin_over_cpi * 100)} pp`
          }
        />
      ))}
      <p className="mt-2 text-xs text-muted-foreground">Oprocentowanie pierwszego okresu odsetkowego.</p>
    </MacroCard>
  );
}

async function LimitsBlock() {
  const data = await loadSeries<{ limits: LegalLimits }>(
    "/v1/legal-limits",
    (payload) => Boolean(payload.limits?.year),
  );
  const limits = data?.limits;
  if (!limits?.year) return <MacroError title="Limity IKE i IKZE" />;
  return (
    <MacroCard title="Limity IKE i IKZE" asOf={String(limits.year)}>
      <Metric label="IKE" value={money(limits.ike)} />
      <Metric label="IKZE" value={money(limits.ikze)} />
      <Metric label="IKZE, działalność" value={money(limits.ikzeSelfemployed)} />
      <p className="mt-2 text-xs text-muted-foreground">Roczne limity wpłat.</p>
    </MacroCard>
  );
}

async function BarometerBlock() {
  const data = await loadSeries<{ barometry: { barometry: Barometer[]; asOfLatest?: string } }>(
    "/v1/index",
    (payload) => (payload.barometry?.barometry?.length ?? 0) > 0,
  );
  const rows = data?.barometry.barometry ?? [];
  if (rows.length === 0) return <MacroError title="Barometry finwire" />;
  return (
    <MacroCard title="Barometry finwire" asOf={asOfLabel(data?.barometry.asOfLatest)}>
      {rows.map((row) => (
        <div key={row.slug} className="border-b border-border/70 py-2 last:border-b-0">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm">{row.shortTitle}</span>
            <span className="font-mono text-sm">{formatBarometer(row)}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{row.gaugeLabel}</p>
        </div>
      ))}
    </MacroCard>
  );
}

function formatBarometer(row: Barometer): string {
  if (row.valueFormat === "pp") return `${formatPrice(row.value)} pp`;
  if (row.valueFormat === "m2") return `${formatVolume(row.value)} m²`;
  return money(row.value);
}

async function StressBlock() {
  const data = await loadSeries<CreditStress>(
    "/v1/index/credit-stress",
    (payload) => Boolean(payload.national),
  );
  const national = data?.national;
  const regions = data?.regions ?? [];
  if (!national) return <MacroError title="Stres kredytowy" />;
  return (
      <MacroCard title="Stres kredytowy">
        <Metric label="Średnio w kraju" value={percentPoints(national.avgStressPct)} />
        <Metric label="Mediana województw" value={percentPoints(national.medianStressPct)} />
        <Metric
          label={`Najwyżej: ${national.mostStressed.label}`}
          value={percentPoints(national.mostStressed.stressPct)}
        />
        <Metric
          label={`Najniżej: ${national.leastStressed.label}`}
          value={percentPoints(national.leastStressed.stressPct)}
        />
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Rata modelowej hipoteki na 50 m² jako procent pensji netto. Powyżej progu KNF:{" "}
          {national.countAboveKnf} z {national.regionCount} województw.
        </p>
        {regions.length === 0 ? null : (
          <div className="mt-2 max-h-48 overflow-auto">
            {regions.map((region) => (
              <Metric
                key={region.label}
                label={`${region.label} · ${region.capitalCity}`}
                value={percentPoints(region.stressPct)}
              />
            ))}
          </div>
        )}
      </MacroCard>
  );
}

async function DepositBlock() {
  const data = await loadSeries<DepositRates>(
    "/v1/market/deposit-rates",
    (payload) => Boolean(payload.rates?.interestRate),
  );
  const rate = data?.rates.interestRate;
  if (!data || !rate) return <MacroError title="Lokaty" />;
  const model = data.model;
  return (
      <MacroCard title="Lokaty terminowe">
        <Metric label="Mediana" value={percentPoints(rate.median)} />
        <Metric label="Od–do" value={`${formatPrice(rate.min)}–${formatPrice(rate.max)}%`} />
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {money(model.amount)} na {model.period} miesiące, {model.currency}. Ofert w próbie: {rate.count}, banków:{" "}
          {data.bankCount}. Same agregaty, bez nazw banków.
        </p>
      </MacroCard>
  );
}

async function SavingsBlock() {
  const data = await loadSeries<SavingsRates>(
    "/v1/market/savings-rates",
    (payload) => Boolean(payload.rates?.interestRate),
  );
  const rate = data?.rates.interestRate;
  if (!data || !rate) return <MacroError title="Konta oszczędnościowe" />;
  return (
      <MacroCard title="Konta oszczędnościowe">
        <Metric label="Mediana" value={percentPoints(rate.median)} />
        <Metric label="Od–do" value={`${formatPrice(rate.min)}–${formatPrice(rate.max)}%`} />
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Model {money(data.model.amount)}. Ofert: {rate.count}, banków: {data.bankCount}.
        </p>
      </MacroCard>
  );
}

async function MortgageBlock() {
  const data = await loadSeries<MortgageRates>("/v1/market/mortgage-rates", (payload) =>
    Boolean(payload.rates?.rrso && payload.rates.margin && payload.rates.nominalRate),
  );
  const rrso = data?.rates.rrso;
  const margin = data?.rates.margin;
  const nominalRate = data?.rates.nominalRate;
  if (!data || !rrso || !margin || !nominalRate) return <MacroError title="Kredyty hipoteczne" />;
  const model = data.model;
  return (
      <MacroCard title="Kredyty hipoteczne">
        <Metric label="RRSO, mediana" value={percentPoints(rrso.median)} />
        <Metric label="Marża, mediana" value={`${formatPrice(margin.median)} pp`} />
        <Metric label="Nominalne, mediana" value={percentPoints(nominalRate.median)} />
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {money(model.amount)} na {model.period} lat, LTV {model.ltvPct}%. Banków: {data.bankCount}.
        </p>
      </MacroCard>
  );
}

async function CashLoanBlock() {
  const data = await loadSeries<CashLoanRates>("/v1/market/cash-loan-rates", (payload) =>
    Boolean(payload.rates?.rrso && payload.rates.nominalRate),
  );
  const rrso = data?.rates.rrso;
  const nominalRate = data?.rates.nominalRate;
  if (!data || !rrso || !nominalRate) return <MacroError title="Kredyty gotówkowe" />;
  const model = data.model;
  return (
      <MacroCard title="Kredyty gotówkowe">
        <Metric label="RRSO, mediana" value={percentPoints(rrso.median)} />
        <Metric label="Nominalne, mediana" value={percentPoints(nominalRate.median)} />
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {money(model.amount)} na {model.period} miesięcy. Banków: {data.bankCount}.
        </p>
      </MacroCard>
  );
}
