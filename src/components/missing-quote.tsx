import { Badge } from "@/components/ui/badge";
import { venueLabel, type Instrument } from "@/lib/instruments";
import Link from "next/link";

export function MissingQuote({ instrument }: { instrument: Instrument }) {
  const venue = instrument.market === "newconnect" ? "NewConnect" : "rynku głównego GPW";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <p className="text-sm text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:underline">
          Notowania
        </Link>
        <span className="px-1.5">/</span>
        <span>{instrument.label}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline">{venueLabel(instrument)}</Badge>
        <Badge variant="secondary">Brak notowania</Badge>
      </div>
      <h1 className="mt-3 font-heading text-4xl tracking-tight">{instrument.name}</h1>
      <p className="mt-1 font-mono text-sm text-muted-foreground">
        {instrument.label} · {instrument.market === "newconnect" ? "NewConnect" : "GPW"}
      </p>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
        Publiczny feed nie oddał kursu {instrument.label}, a w zapisie lokalnym nie ma tego
        symbolu. Spółka jest w katalogu {venue}, ale na tej stronie nie ma ceny ani wykresu —
        brakującej liczby nie uzupełniam.
      </p>
      <p className="mt-8">
        <Link href="/" className="text-sm underline-offset-4 hover:underline">
          Wróć do notowań
        </Link>
      </p>
    </div>
  );
}
