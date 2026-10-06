import { formatPercent, formatPrice, priceUnit, toneClass } from "@/lib/format";
import type { Quote } from "@/lib/types";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export function IndicesStrip({ quotes }: { quotes: Quote[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible">
      {quotes.map((quote) => {
        const direction = quote.change > 0 ? "wzrost" : quote.change < 0 ? "spadek" : "bez zmian";
        return (
          <Link
            key={quote.ticker}
            href={`/instrument/${quote.ticker}`}
            className="min-w-[210px] md:min-w-0"
            aria-label={`${quote.label}, ${formatPrice(quote.price)} ${priceUnit(quote.kind)}, ${direction} ${formatPercent(quote.changePercent)}`}
          >
            <Card className="h-full gap-2 border-l-4 border-l-current bg-card py-3 ring-foreground/10" style={{ borderLeftColor: barColor(quote.change) }}>
              <div className="flex items-baseline justify-between px-4">
                <span className="font-heading text-lg leading-none">{quote.label}</span>
                <span className={`font-mono text-sm ${toneClass(quote.changePercent)}`}>
                  {formatPercent(quote.changePercent)}
                </span>
              </div>
              <p className="px-4 font-mono text-2xl tracking-tight text-foreground">
                {formatPrice(quote.price)}
                <span className="ml-1 text-sm text-muted-foreground">{priceUnit(quote.kind)}</span>
              </p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

function barColor(change: number): string {
  if (change > 0) return "#0c7a45";
  if (change < 0) return "#b42318";
  return "#c4a46a";
}
