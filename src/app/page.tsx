import { CompanyBrowser } from "@/components/company-browser";
import { IndicesStrip } from "@/components/indices-strip";
import { MacroSection } from "@/components/macro-section";
import { NewsList } from "@/components/news-list";
import { QuotesTable } from "@/components/quotes-table";
import { SourceBanner } from "@/components/source-banner";
import { formatDateTime } from "@/lib/format";
import { getBoard } from "@/lib/market";
import { listArticles } from "@/lib/news";
import { sessionPhase } from "@/lib/time";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Notowania GPW" },
  description:
    "WIG20, WIG, mWIG40, sWIG80, duże spółki oraz katalog rynku głównego i NewConnect.",
};

export default async function HomePage() {
  const board = await getBoard();
  const articles = await listArticles();
  const phase = sessionPhase();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col gap-4">
        <SourceBanner source={board.source} />
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading text-4xl tracking-tight">Notowania</h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
              Indeksy, duże spółki oraz pełniejszy katalog rynku głównego i NewConnect.
              Wybierz symbol, żeby otworzyć wykres.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{phase.label}.</span>{" "}
            {phase.detail} Stan danych: {formatDateTime(board.asOf)}.
          </p>
        </div>
        <IndicesStrip quotes={board.indices} />
      </div>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <h2 className="mb-3 font-heading text-2xl tracking-tight">Duże spółki</h2>
          <QuotesTable quotes={board.stocks} />
          <p className="mt-2 text-xs text-muted-foreground">
            Kliknij wiersz, żeby przejść do wykresu. Zmiana liczona jest wobec poprzedniego zamknięcia.
          </p>
        </section>
        <NewsList articles={articles.slice(0, 5)} />
      </div>
      <CompanyBrowser />
      <MacroSection />
    </div>
  );
}
