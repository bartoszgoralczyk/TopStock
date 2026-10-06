"use client";

import { Input } from "@/components/ui/input";
import {
  searchInstruments,
  suggestedInstruments,
  type Instrument,
} from "@/lib/instruments";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export function SymbolSearch() {
  const router = useRouter();
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => searchInstruments(query).slice(0, 8), [query]);
  const suggestions = useMemo(() => suggestedInstruments(), []);
  const showingSuggestions = open && query.trim() === "";
  const visible = showingSuggestions ? suggestions : results;

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  function go(ticker: string) {
    setOpen(false);
    setQuery("");
    router.push(`/instrument/${ticker}`);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (visible.length > 0) {
      go(visible[Math.min(active, visible.length - 1)].ticker);
      return;
    }
    const trimmed = query.trim();
    if (trimmed) go(trimmed.toUpperCase());
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((current) => Math.min(current + 1, Math.max(visible.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const empty = open && query.trim() !== "" && results.length === 0;

  return (
    <div ref={boxRef} className="relative">
      <form onSubmit={onSubmit} role="search">
        <label htmlFor="symbol-search" className="sr-only">
          Szukaj instrumentu po symbolu lub nazwie
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id="symbol-search"
          value={query}
          placeholder="Symbol lub nazwa, np. PKO"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          className="h-9 bg-[#fffdf8] pl-8 text-foreground"
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <button type="submit" className="sr-only">
          Szukaj
        </button>
      </form>
      {open && (visible.length > 0 || empty) ? (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-80 w-full overflow-auto rounded-lg border border-border bg-card p-1 text-card-foreground shadow-lg"
        >
          {showingSuggestions ? (
            <p className="px-2 pt-1.5 pb-1 text-xs text-muted-foreground">Często otwierane</p>
          ) : null}
          {empty ? (
            <p className="px-2 py-3 text-sm">
              Brak instrumentu dla „{query.trim()}”. Enter otworzy stronę tego symbolu.
            </p>
          ) : (
            visible.map((item, index) => (
              <ResultRow
                key={item.ticker}
                item={item}
                active={index === active}
                onPick={() => go(item.ticker)}
                onHover={() => setActive(index)}
              />
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function ResultRow({
  item,
  active,
  onPick,
  onHover,
}: {
  item: Instrument;
  active: boolean;
  onPick: () => void;
  onHover: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      className={`flex w-full items-baseline justify-between gap-3 rounded-md px-2 py-1.5 text-left ${
        active ? "bg-accent" : "hover:bg-muted"
      }`}
      onMouseEnter={onHover}
      onClick={onPick}
    >
      <span>
        <span className="font-mono text-sm">{item.label}</span>
        <span className="ml-2 text-sm text-muted-foreground">{item.name}</span>
      </span>
      <span className="shrink-0 text-xs text-muted-foreground">
        {item.kind === "index" ? "indeks" : "spółka"}
      </span>
    </button>
  );
}
