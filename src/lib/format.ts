import type { InstrumentKind } from "@/lib/types";

export function fold(value: string): string {
  return value
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatSigned(value: number): string {
  const formatted = formatPrice(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `−${formatted}`;
  return formatted;
}

export function formatPercent(value: number): string {
  const formatted = new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  if (value > 0) return `+${formatted}%`;
  if (value < 0) return `−${formatted}%`;
  return `${formatted}%`;
}

export function formatVolume(value: number | null): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(
    value,
  );
}

export function formatDateTime(unixSeconds: number): string {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(unixSeconds * 1000));
}

export function formatArticleDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

export function priceUnit(kind: InstrumentKind): string {
  return kind === "index" ? "pkt" : "zł";
}

export function tone(value: number): "up" | "down" | "flat" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

export function toneClass(value: number): string {
  const next = tone(value);
  if (next === "up") return "text-up";
  if (next === "down") return "text-down";
  return "text-muted-foreground";
}

export function plural(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (count === 1) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
