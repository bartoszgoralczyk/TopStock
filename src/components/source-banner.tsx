import type { BoardSource, DataSource } from "@/lib/types";

export function SourceBanner({ source }: { source: BoardSource }) {
  if (source === "yahoo") return null;
  const text =
    source === "local"
      ? "Publiczny feed jest teraz niedostępny. Poniżej widać zapis lokalny, żeby dało się czytać tablicę bez klucza API. To nie jest bieżąca taśma z parkietu."
      : "Część kursów pochodzi z zapisu lokalnego, bo publiczny feed nie odpowiedział na każdy symbol. Reszta jest z feedu.";
  return (
    <p className="rounded-lg border border-[#e0c98a] bg-[#fff6df] px-3 py-2 text-sm text-[#5c4818]" role="status">
      {text}
    </p>
  );
}

export function HistoryNote({ source, note }: { source: DataSource; note: string }) {
  const local = source === "local";
  return (
    <p className={`text-sm ${local ? "text-[#8a5a12]" : "text-muted-foreground"}`}>
      {note}
    </p>
  );
}
