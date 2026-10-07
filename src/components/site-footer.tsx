import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border bg-[#fffdf8]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground md:px-6">
        <p>
          To nie jest serwis Giełdy Papierów Wartościowych w Warszawie ani dom
          maklerski. Kursy biorą się z publicznego feedu Yahoo Finance (symbole
          z końcówką .WA) i mogą być opóźnione. Gdy feed milczy, a symbol jest w
          zapisie lokalnym, strona pokazuje ten zapis i mówi o tym wprost. Spółka
          bez kursu zostaje na liście z adnotacją, że notowania brak. Nic tutaj
          nie jest rekomendacją inwestycyjną.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/" className="underline-offset-4 hover:underline">
            Notowania
          </Link>
          <Link href="/wiadomosci" className="underline-offset-4 hover:underline">
            Wiadomości
          </Link>
          <Link
            href="/wiadomosci/skad-biora-sie-liczby"
            className="underline-offset-4 hover:underline"
          >
            Skąd biorą się liczby
          </Link>
        </div>
      </div>
    </footer>
  );
}
