import { NewsList } from "@/components/news-list";
import { listArticles } from "@/lib/news";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wiadomości",
  description: "Przegląd sesji liczony z tablicy oraz teksty o tym, jak czytać warszawski parkiet.",
};

export default async function NewsPage() {
  const articles = await listArticles();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <h1 className="font-heading text-4xl tracking-tight">Wiadomości</h1>
      <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
        Przegląd sesji powstaje z liczb na tablicy. Reszta to teksty tej redakcji
        o indeksach, świecach i godzinach handlu — bez przedruku z agencji.
      </p>
      <div className="mt-6">
        <NewsList articles={articles} heading="Wszystkie teksty" showAllLink={false} />
      </div>
    </div>
  );
}
