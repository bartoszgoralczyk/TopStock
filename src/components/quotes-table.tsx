import { formatPercent, formatPrice, formatSigned, priceUnit, toneClass } from "@/lib/format";
import type { Quote } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export function QuotesTable({ quotes }: { quotes: Quote[] }) {
  if (quotes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
        Brak spółek w zestawieniu.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Symbol</TableHead>
            <TableHead className="hidden md:table-cell">Nazwa</TableHead>
            <TableHead className="text-right">Kurs</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Zmiana</TableHead>
            <TableHead className="text-right">Zmiana %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => (
            <TableRow key={quote.ticker} className="relative">
              <TableCell>
                <Link
                  href={`/instrument/${quote.ticker}`}
                  className="absolute inset-0 z-10"
                  aria-label={`${quote.name}, ${quote.label}`}
                />
                <span className="relative font-mono font-medium">{quote.label}</span>
                <span className="relative mt-0.5 block text-xs text-muted-foreground md:hidden">
                  {quote.name}
                </span>
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {quote.name}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatPrice(quote.price)}
                <span className="ml-1 text-xs text-muted-foreground">{priceUnit(quote.kind)}</span>
              </TableCell>
              <TableCell className={`hidden text-right font-mono sm:table-cell ${toneClass(quote.change)}`}>
                {formatSigned(quote.change)}
              </TableCell>
              <TableCell className={`text-right font-mono ${toneClass(quote.changePercent)}`}>
                {formatPercent(quote.changePercent)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
