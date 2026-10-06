import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16 md:px-6">
      <p className="text-xs tracking-[0.14em] text-[#8d7044] uppercase">404</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight">Nie ma takiej strony</h1>
      <p className="mt-3 leading-7 text-muted-foreground">
        Adres nie prowadzi ani do notowań, ani do tekstu. Wróć na tablicę albo
        otwórz wiadomości.
      </p>
      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/" className="underline-offset-4 hover:underline">
          Notowania
        </Link>
        <Link href="/wiadomosci" className="underline-offset-4 hover:underline">
          Wiadomości
        </Link>
      </div>
    </div>
  );
}
