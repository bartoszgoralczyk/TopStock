import { HistoryPanel } from "@/components/history-panel";
import { MissingQuote } from "@/components/missing-quote";
import { UnknownInstrument } from "@/components/unknown-instrument";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatPercent, formatPrice, formatSigned, formatVolume, priceUnit, tone, toneClass } from "@/lib/format";
import { findInstrument, venueLabel } from "@/lib/instruments";
import { getHistory, getInstrument } from "@/lib/market";
import { DEFAULT_RANGE } from "@/lib/ranges";
import { sessionPhase } from "@/lib/time";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>;
}): Promise<Metadata> {
  const { symbol } = await params;
  const instrument = findInstrument(symbol);
  if (!instrument) {
    return { title: "Nie znaleziono instrumentu" };
  }
  return {
    title: `${instrument.name} (${instrument.label})`,
    description: instrument.about,
  };
}

export default async function InstrumentPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const instrument = findInstrument(symbol);
  if (!instrument) return <UnknownInstrument query={symbol} />;

  const [quote, history] = await Promise.all([
    getInstrument(instrument.ticker),
    getHistory(instrument.ticker, DEFAULT_RANGE),
  ]);

  if (!quote) return <MissingQuote instrument={instrument} />;

  const phase = sessionPhase();
  const unit = priceUnit(quote.kind);
  const direction = tone(quote.change);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <p className="text-sm text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:underline">
          Notowania
        </Link>
        <span className="px-1.5">/</span>
        <span>{quote.label}</span>
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline">{venueLabel(instrument)}</Badge>
        <Badge variant="secondary">{phase.label}</Badge>
        {quote.source === "local" ? <Badge variant="outline">Zapis lokalny</Badge> : null}
      </div>
      <h1 className="mt-3 font-heading text-4xl tracking-tight md:text-5xl">{quote.name}</h1>
      <p className="mt-1 font-mono text-sm text-muted-foreground">
        {quote.label} · {instrument.market === "newconnect" ? "NewConnect" : "GPW"} · {quote.currency}
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-2">
        <p className="font-mono text-4xl tracking-tight md:text-5xl">
          {formatPrice(quote.price)}
          <span className="ml-2 text-lg text-muted-foreground">{unit}</span>
        </p>
        <p className={`pb-1 font-mono text-lg ${toneClass(quote.change)}`}>
          {formatSigned(quote.change)} {unit}
          <span className="ml-2">{formatPercent(quote.changePercent)}</span>
        </p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {phase.detail} Ostatnia dana: {formatDateTime(quote.time)}.{" "}
        {direction === "flat"
          ? "Kurs pokrywa się z poprzednim zamknięciem."
          : direction === "up"
            ? "Kurs jest wyżej niż poprzednie zamknięcie."
            : "Kurs jest niżej niż poprzednie zamknięcie."}
      </p>

      <div className="mt-6">
        {history ? (
          <HistoryPanel initial={history} />
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
            Wykres jest niedostępny. Feed nie oddał serii, a w zapisie lokalnym nie ma tego symbolu.
          </p>
        )}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Poprzednie zamknięcie" value={`${formatPrice(quote.previousClose)} ${unit}`} />
        <Stat label="Maksimum sesji" value={quote.dayHigh == null ? "—" : `${formatPrice(quote.dayHigh)} ${unit}`} />
        <Stat label="Minimum sesji" value={quote.dayLow == null ? "—" : `${formatPrice(quote.dayLow)} ${unit}`} />
        <Stat label="Zmiana" value={`${formatSigned(quote.change)} ${unit}`} />
        <Stat label="Zmiana procentowa" value={formatPercent(quote.changePercent)} />
        <Stat label="Wolumen" value={quote.kind === "index" ? "—" : formatVolume(quote.volume)} />
      </dl>
      <p className="mt-6 max-w-3xl leading-7">{quote.about}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-card px-3 py-2 ring-1 ring-foreground/10">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-sm">{value}</dd>
    </div>
  );
}
