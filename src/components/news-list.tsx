import { formatArticleDate } from "@/lib/format";
import type { Article } from "@/lib/news";
import Link from "next/link";

export function NewsList({
  articles,
  heading = "Wiadomości",
  showAllLink = true,
}: {
  articles: Article[];
  heading?: string;
  showAllLink?: boolean;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-2xl tracking-tight">{heading}</h2>
        {showAllLink ? (
          <Link href="/wiadomosci" className="text-sm text-primary underline-offset-4 hover:underline">
            Wszystkie
          </Link>
        ) : (
          <span />
        )}
      </div>
      {articles.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nie ma teraz żadnego tekstu.</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link href={`/wiadomosci/${article.slug}`} className="block py-3 hover:bg-[#fffdf8]">
                <p className="text-xs tracking-wide text-[#8d7044] uppercase">
                  {article.kicker}
                  <span className="ml-2 normal-case text-muted-foreground">
                    {formatArticleDate(article.date)}
                  </span>
                </p>
                <p className="mt-1 font-heading text-lg leading-snug">{article.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.dek}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
