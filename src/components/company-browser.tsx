"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fold, formatPercent, formatPrice, plural, toneClass } from "@/lib/format";
import {
  COMPANY_COUNTS,
  listedCompanies,
  type Instrument,
  type Market,
} from "@/lib/instruments";
import type { ListRow } from "@/lib/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 40;

type MarketFilter = "all" | Market;

const FILTERS: { id: MarketFilter; label: string }[] = [
  { id: "all", label: "Wszystkie" },
  { id: "gpw", label: "Rynek główny" },
  { id: "newconnect", label: "NewConnect" },
];

export function CompanyBrowser() {
  const companies = useMemo(() => listedCompanies(), []);
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState<MarketFilter>("all");
  const [page, setPage] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    error: string | null;
    quotes: Map<string, ListRow>;
  }>({ key: "", error: null, quotes: new Map() });

  const filtered = useMemo(() => {
    const folded = fold(query.trim());
    const matches = companies.filter((company) => {
      if (market !== "all" && company.market !== market) return false;
      if (!folded) return true;
      return fold(company.ticker).includes(folded) || fold(company.name).includes(folded);
    });
    if (!folded) return matches;
    return matches.sort((a, b) => rank(a, folded) - rank(b, folded) || a.ticker.localeCompare(b.ticker));
  }, [companies, market, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const slice = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const symbolKey = slice.map((company) => company.ticker).join(",");
  const requestKey = `${symbolKey}|${attempt}`;
  const settled = result.key === requestKey;
  const loading = symbolKey !== "" && !settled;
  const error = settled ? result.error : null;
  const quotes = result.quotes;

  useEffect(() => {
    if (!symbolKey) return;
    const controller = new AbortController();
    const key = `${symbolKey}|${attempt}`;
    fetch(`/api/kursy?symbole=${encodeURIComponent(symbolKey)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Kursy nie wróciły.");
        return (await response.json()) as { rows: ListRow[] };
      })
      .then((body) => {
        if (controller.signal.aborted) return;
        setResult({
          key,
          error: null,
          quotes: new Map(body.rows.map((row) => [row.ticker, row])),
        });
      })
      .catch((fetchError: unknown) => {
        if (controller.signal.aborted) return;
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        setResult((current) => ({
          key,
          error: "Nie udało się pobrać kursów dla tej strony.",
          quotes: current.quotes,
        }));
      });
    return () => controller.abort();
  }, [symbolKey, attempt]);

  const from = filtered.length === 0 ? 0 : current * PAGE_SIZE + 1;
  const to = Math.min(filtered.length, current * PAGE_SIZE + slice.length);

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-heading text-2xl tracking-tight">Wszystkie spółki</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {COMPANY_COUNTS.gpw} z rynku głównego i {COMPANY_COUNTS.newconnect} z NewConnect.
            Filtruj po nazwie albo symbolu, albo przechodź stronami.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length === COMPANY_COUNTS.total
            ? `${COMPANY_COUNTS.total} spółek`
            : `${filtered.length} ${plural(filtered.length, "spółka", "spółki", "spółek")}`}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="block w-full sm:max-w-sm">
          <span className="sr-only">Filtruj spółki</span>
          <Input
            value={query}
            placeholder="Nazwa lub symbol, np. Dino albo 11B"
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
          />
        </label>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Rynek">
          {FILTERS.map((filter) => (
            <Button
              key={filter.id}
              type="button"
              size="sm"
              variant={market === filter.id ? "default" : "outline"}
              aria-pressed={market === filter.id}
              onClick={() => {
                setMarket(filter.id);
                setPage(0);
              }}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-dashed border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">{error} Nazwy zostają na liście, ceny nie są uzupełniane.</p>
          <Button type="button" size="sm" variant="outline" onClick={() => setAttempt((value) => value + 1)}>
            Spróbuj ponownie
          </Button>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
          Żadna spółka nie pasuje do „{query.trim()}”
          {market === "gpw" ? " na rynku głównym" : market === "newconnect" ? " na NewConnect" : ""}.
        </p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10" aria-busy={loading}>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Symbol</TableHead>
                <TableHead>Nazwa</TableHead>
                <TableHead className="hidden sm:table-cell">Rynek</TableHead>
                <TableHead className="text-right">Kurs</TableHead>
                <TableHead className="text-right">Zmiana %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((company) => (
                <CompanyRow
                  key={company.ticker}
                  company={company}
                  quote={quotes.get(company.ticker)}
                  loading={loading && !quotes.has(company.ticker)}
                  failed={Boolean(error) && !quotes.has(company.ticker)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length === 0
            ? "Pusta strona"
            : `Spółki ${from}–${to} z ${filtered.length}. Strona ${current + 1} z ${pageCount}.`}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            Poprzednia
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
          >
            Następna
          </Button>
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Katalog łączy bieżące symbole z publicznego skanu notowań z listami ISIN rynku głównego
        i segmentów NewConnect. Nie obejmuje akcji zagranicznych na GPW ani spółek, które wypadły
        z czerwcowej listy NewConnect. Brak kursu jest opisany w wierszu — cena nie jest wtedy wymyślana.
      </p>
    </section>
  );
}

function CompanyRow({
  company,
  quote,
  loading,
  failed,
}: {
  company: Instrument;
  quote: ListRow | undefined;
  loading: boolean;
  failed: boolean;
}) {
  const price =
    quote && quote.price != null && quote.changePercent != null ? (
      <>
        <span className="font-mono">
          {formatPrice(quote.price)}
          <span className="ml-1 text-xs text-muted-foreground">zł</span>
        </span>
        {quote.status === "local" ? (
          <span className="mt-0.5 block text-[11px] text-muted-foreground">zapis lokalny</span>
        ) : null}
      </>
    ) : loading ? (
      <Skeleton className="ml-auto h-4 w-16" />
    ) : (
      <span className="text-xs text-muted-foreground">{failed ? "nie pobrano" : "brak notowania"}</span>
    );

  const change =
    quote && quote.changePercent != null ? (
      <span className={`font-mono ${toneClass(quote.changePercent)}`}>{formatPercent(quote.changePercent)}</span>
    ) : loading ? (
      <Skeleton className="ml-auto h-4 w-14" />
    ) : (
      <span className="text-muted-foreground">—</span>
    );

  return (
    <TableRow className="relative">
      <TableCell>
        <Link
          href={`/instrument/${company.ticker}`}
          className="absolute inset-0 z-10"
          aria-label={`${company.name}, ${company.ticker}`}
        />
        <span className="relative font-mono font-medium">{company.ticker}</span>
      </TableCell>
      <TableCell>
        <span className="relative">{company.name}</span>
        <span className="relative mt-0.5 block text-xs text-muted-foreground sm:hidden">
          {company.market === "newconnect" ? "NewConnect" : "Rynek główny"}
        </span>
      </TableCell>
      <TableCell className="hidden text-muted-foreground sm:table-cell">
        {company.market === "newconnect" ? "NewConnect" : "Rynek główny"}
      </TableCell>
      <TableCell className="text-right">{price}</TableCell>
      <TableCell className="text-right">{change}</TableCell>
    </TableRow>
  );
}

function rank(item: Instrument, query: string): number {
  const ticker = fold(item.ticker);
  if (ticker === query) return 0;
  if (ticker.startsWith(query)) return 1;
  if (fold(item.name).startsWith(query)) return 2;
  return 3;
}
