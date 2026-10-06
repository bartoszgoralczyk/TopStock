export const RANGES = [
  { id: "sesja", label: "Sesja", hint: "świece 5-minutowe z bieżącej sesji" },
  { id: "5d", label: "5D", hint: "świece 15-minutowe z pięciu sesji" },
  { id: "1m", label: "1M", hint: "około miesiąca" },
  { id: "6m", label: "6M", hint: "około pół roku" },
  { id: "1r", label: "1R", hint: "około roku" },
  { id: "maks", label: "Maks", hint: "najdłuższy zakres z feedu" },
] as const;

export type RangeId = (typeof RANGES)[number]["id"];

export const DEFAULT_RANGE: RangeId = "6m";

export function isRange(value: string): value is RangeId {
  return RANGES.some((range) => range.id === value);
}

export function rangeHint(id: RangeId): string {
  return RANGES.find((range) => range.id === id)?.hint ?? "";
}
