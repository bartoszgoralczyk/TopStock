export function warsawParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Warsaw",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const bag = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    weekday: bag.weekday ?? "Mon",
    day: `${bag.year}-${bag.month}-${bag.day}`,
    minutes: Number(bag.hour) * 60 + Number(bag.minute),
  };
}

export function warsawDay(unixSeconds: number): string {
  return warsawParts(new Date(unixSeconds * 1000)).day;
}

export function warsawISODate(date = new Date()): string {
  return warsawParts(date).day;
}

export function sessionPhase(date = new Date()): { label: string; detail: string } {
  const { weekday, minutes } = warsawParts(date);
  if (weekday === "Sat" || weekday === "Sun") {
    return { label: "Rynek zamknięty", detail: "Weekend, parkiet nie handluje." };
  }
  if (minutes < 9 * 60) {
    return { label: "Przed sesją", detail: "Notowania ciągłe startują o 9:00." };
  }
  if (minutes < 16 * 60 + 50) {
    return { label: "Sesja", detail: "Trwa faza notowań ciągłych." };
  }
  if (minutes < 17 * 60 + 5) {
    return { label: "Dogrywka", detail: "Trwa faza zamknięcia." };
  }
  return { label: "Po sesji", detail: "Kolejna sesja w najbliższy dzień roboczy." };
}

/** Unix seconds for a civil time in Europe/Warsaw. */
export function unixAtWarsaw(day: string, hour: number, minute: number): number {
  const [year, month, date] = day.split("-").map(Number);
  let guess = Date.UTC(year, month - 1, date, hour - 1, minute);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = warsawParts(new Date(guess));
    const dayDelta =
      (Date.parse(`${day}T00:00:00Z`) - Date.parse(`${parts.day}T00:00:00Z`)) /
      86_400_000;
    const deltaMinutes = dayDelta * 1440 + (hour * 60 + minute - parts.minutes);
    if (deltaMinutes === 0) break;
    guess += deltaMinutes * 60 * 1000;
  }
  return Math.floor(guess / 1000);
}

export function weekdaySessions(count: number, endDay: string): string[] {
  const days: string[] = [];
  const [year, month, date] = endDay.split("-").map(Number);
  const cursor = new Date(Date.UTC(year, month - 1, date, 12));
  while (days.length < count) {
    const weekday = cursor.getUTCDay();
    if (weekday !== 0 && weekday !== 6) {
      const y = cursor.getUTCFullYear();
      const m = String(cursor.getUTCMonth() + 1).padStart(2, "0");
      const d = String(cursor.getUTCDate()).padStart(2, "0");
      days.push(`${y}-${m}-${d}`);
    }
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return days.reverse();
}
