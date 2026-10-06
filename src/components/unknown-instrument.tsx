import { buttonVariants } from "@/components/ui/button";
import { suggestedInstruments } from "@/lib/instruments";
import { cn } from "cn";
import Link from "next/link";

export function UnknownInstrument({ query }: { query: string }) {
  const suggestions = suggestedInstruments();
  const typed = query.trim();
  const looksLikeYahoo = /\.wa$/i.test(typed);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <p className="text-xs tracking-[0.14em] text-[#8d7044] uppercase">Symbol</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight">Nie ma takiego instrumentu</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
        W zestawieniu nie znalazłem symbolu „{typed || "—"}”. Sprawdź zapis, na
        przykład PKO, KGH albo WIG20.
        {looksLikeYahoo
          ? " Końcówka .WA nie jest potrzebna — wpisz sam symbol, choćby PKO."
          : ""}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <Link
            key={item.ticker}
            href={`/instrument/${item.ticker}`}
            className={cn(buttonVariants({ variant: "outline" }), "h-auto py-1.5")}
          >
            {item.label}
            <span className="text-muted-foreground">{item.name}</span>
          </Link>
        ))}
      </div>
      <p className="mt-8">
        <Link href="/" className="text-sm underline-offset-4 hover:underline">
          Wróć do notowań
        </Link>
      </p>
    </div>
  );
}
