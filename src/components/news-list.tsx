import { formatArticleDate, formatDateTime } from "@/lib/format";
import type { Article } from "@/lib/news";
import type { PapHeadline } from "@/lib/pap";
import Link from "next/link";

export function NewsList({
  articles,
  pap,
  heading = "Wiadomości",
  showAllLink = true,
}: {
  articles: Article[];
  pap?: { items: PapHeadline[]; unavailable: boolean };
  heading?: string;
  showAllLink?: boolean;
}) {
  const showPap = Boolean(pap && (pap.unavailable || pap.items.length > 0));

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
      {pap?.unavailable ? (
        <p className="mb-3 rounded-lg border border-dashed border-border px-3 py-2 text-sm leading-6">
          Kanał PAP jest teraz niedostępny. Zostają teksty tej redakcji.
        </p>
      ) : null}
      {pap && pap.items.length > 0 ? (
        <ul className="divide-y divide-border border-y border-border">
          {pap.items.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-3 hover:bg-[#fffdf8]"
              >
                <p className="text-xs text-muted-foreground">{formatDateTime(item.time)}</p>
                <p className="mt-1 font-heading text-lg leading-snug">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">PAP Biznes · biznes.pap.pl</p>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {showPap ? (
        <h3 className="mt-6 mb-3 font-heading text-xl tracking-tight">Teksty redakcji</h3>
      ) : null}
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
