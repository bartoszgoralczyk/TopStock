"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16 md:px-6">
      <p className="text-xs tracking-[0.14em] text-[#8d7044] uppercase">Błąd</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight">Nie udało się wczytać strony</h1>
      <p className="mt-3 leading-7 text-muted-foreground">
        To może być chwilowa przerwa w danych. Spróbuj jeszcze raz — tablica albo
        wykres powinny wrócić bez odświeżania całej przeglądarki.
      </p>
      <Button type="button" className="mt-6" onClick={() => retry()}>
        Spróbuj ponownie
      </Button>
    </div>
  );
}
