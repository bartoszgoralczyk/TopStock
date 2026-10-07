import { NewsList } from "@/components/news-list";
import { listArticles } from "@/lib/news";
import { loadPapHeadlines } from "@/lib/pap";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wiadomości",
  description:
    "Nagłówki PAP Biznes z linkiem do oryginału oraz teksty tej redakcji o warszawskim parkiecie.",
};

export default async function NewsPage() {
  const [articles, pap] = await Promise.all([listArticles(), loadPapHeadlines()]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <h1 className="font-heading text-4xl tracking-tight">Wiadomości</h1>
      <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
        Nagłówki pochodzą z publicznego kanału PAP Biznes. Każdy otwiera oryginalną depeszę
        na biznes.pap.pl. Pełnej treści tutaj nie ma. Niżej zostają przegląd sesji i teksty
        tej redakcji.
      </p>
      <div className="mt-6">
        <NewsList articles={articles} pap={pap} heading="Depesze" showAllLink={false} />
      </div>
    </div>
  );
}
