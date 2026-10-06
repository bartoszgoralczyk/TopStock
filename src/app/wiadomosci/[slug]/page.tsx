import { formatArticleDate } from "@/lib/format";
import { getArticle, listArticles } from "@/lib/news";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Nie ma takiego tekstu" };
  return { title: article.title, description: article.dek };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 md:px-6">
        <h1 className="font-heading text-4xl tracking-tight">Nie ma takiego tekstu</h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          Ten adres nie wskazuje żadnej wiadomości. Wróć do listy i wybierz tekst, który jest na niej.
        </p>
        <Link href="/wiadomosci" className="mt-6 inline-block text-sm underline-offset-4 hover:underline">
          Lista wiadomości
        </Link>
      </div>
    );
  }

  const others = (await listArticles()).filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-6 md:px-6 md:py-10">
      <p className="text-sm text-muted-foreground">
        <Link href="/wiadomosci" className="underline-offset-4 hover:underline">
          Wiadomości
        </Link>
      </p>
      <p className="mt-4 text-xs tracking-[0.14em] text-[#8d7044] uppercase">{article.kicker}</p>
      <h1 className="mt-2 font-heading text-4xl leading-tight tracking-tight md:text-5xl">
        {article.title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">{formatArticleDate(article.date)}</p>
      <p className="mt-6 font-heading text-xl leading-8">{article.dek}</p>
      <div className="mt-6 space-y-4 text-base leading-8">
        {article.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {others.length > 0 ? (
        <aside className="mt-10 border-t border-border pt-6">
          <h2 className="font-heading text-2xl">Dalej w serwisie</h2>
          <ul className="mt-3 space-y-2">
            {others.map((item) => (
              <li key={item.slug}>
                <Link href={`/wiadomosci/${item.slug}`} className="underline-offset-4 hover:underline">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </article>
  );
}
