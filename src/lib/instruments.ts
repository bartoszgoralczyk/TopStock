import listingsJson from "@/data/listings.json";
import { fold } from "@/lib/format";
import type { InstrumentKind } from "@/lib/types";

export type Market = "gpw" | "newconnect";

export type Instrument = {
  ticker: string;
  label: string;
  name: string;
  kind: InstrumentKind;
  featured: boolean;
  about: string;
  aliases: string[];
  market: Market | null;
};

type ListingRow = {
  ticker: string;
  name: string;
  isin: string;
  market: Market;
};

const CURATED: Array<Omit<Instrument, "market">> = [
  {
    ticker: "WIG20",
    label: "WIG20",
    name: "WIG20",
    kind: "index",
    featured: true,
    about:
      "Indeks dwudziestu największych i najbardziej płynnych spółek z głównego rynku GPW.",
    aliases: ["wig 20", "wig-20"],
  },
  {
    ticker: "WIG",
    label: "WIG",
    name: "WIG",
    kind: "index",
    featured: true,
    about:
      "Szeroki indeks rynku głównego. Łączy duże, średnie i mniejsze spółki w jeden obraz parkietu.",
    aliases: ["wig caly", "indeks wig"],
  },
  {
    ticker: "MWIG40",
    label: "mWIG40",
    name: "mWIG40",
    kind: "index",
    featured: true,
    about: "Indeks czterdziestu średnich spółek notowanych na głównym rynku GPW.",
    aliases: ["mwig", "m wig40", "mwig 40"],
  },
  {
    ticker: "SWIG80",
    label: "sWIG80",
    name: "sWIG80",
    kind: "index",
    featured: true,
    about: "Indeks osiemdziesięciu mniejszych spółek z warszawskiego rynku głównego.",
    aliases: ["swig", "s wig80", "swig 80"],
  },
  {
    ticker: "PKO",
    label: "PKO",
    name: "PKO BP",
    kind: "equity",
    featured: true,
    about: "Największy bank detaliczny w Polsce, z siecią oddziałów i bankowością cyfrową.",
    aliases: ["pko bp", "pkobp", "bank pko"],
  },
  {
    ticker: "PKN",
    label: "PKN",
    name: "ORLEN",
    kind: "equity",
    featured: true,
    about: "Koncern paliwowo-energetyczny, obecny w rafinacji, detalu paliw i energetyce.",
    aliases: ["orlen", "pkn orlen"],
  },
  {
    ticker: "PEO",
    label: "PEO",
    name: "Bank Pekao",
    kind: "equity",
    featured: true,
    about: "Duży bank uniwersalny obsługujący klientów indywidualnych i firmy.",
    aliases: ["pekao", "bank pekao"],
  },
  {
    ticker: "PZU",
    label: "PZU",
    name: "PZU",
    kind: "equity",
    featured: true,
    about: "Największa grupa ubezpieczeniowa w Polsce, z działalnością także w bankowości.",
    aliases: ["pzu sa"],
  },
  {
    ticker: "KGH",
    label: "KGH",
    name: "KGHM",
    kind: "equity",
    featured: true,
    about: "Producent miedzi i srebra, z kopalniami na Dolnym Śląsku i aktywami za granicą.",
    aliases: ["kghm"],
  },
  {
    ticker: "CDR",
    label: "CDR",
    name: "CD Projekt",
    kind: "equity",
    featured: true,
    about: "Warszawskie studio i wydawca gier komputerowych, znane z serii Wiedźmin i Cyberpunk.",
    aliases: ["cd projekt", "cdprojekt", "cdpr"],
  },
  {
    ticker: "LPP",
    label: "LPP",
    name: "LPP",
    kind: "equity",
    featured: true,
    about: "Gdańska grupa odzieżowa, właściciel marek takich jak Reserved, Cropp i Sinsay.",
    aliases: ["reserved", "lpp sa"],
  },
  {
    ticker: "DNP",
    label: "DNP",
    name: "Dino Polska",
    kind: "equity",
    featured: true,
    about: "Sieć supermarketów proximity, z własnym modelem sklepów w mniejszych miejscowościach.",
    aliases: ["dino", "dino polska"],
  },
  {
    ticker: "ALE",
    label: "ALE",
    name: "Allegro",
    kind: "equity",
    featured: true,
    about: "Największa platforma handlu internetowego w Polsce.",
    aliases: ["allegro"],
  },
  {
    ticker: "MBK",
    label: "MBK",
    name: "mBank",
    kind: "equity",
    featured: true,
    about: "Bank uniwersalny z silną bankowością internetową dla klientów detalicznych i firm.",
    aliases: ["mbank"],
  },
  {
    ticker: "PGE",
    label: "PGE",
    name: "PGE",
    kind: "equity",
    featured: true,
    about: "Grupa energetyczna produkująca i sprzedająca prąd oraz ciepło.",
    aliases: ["pge sa"],
  },
  {
    ticker: "OPL",
    label: "OPL",
    name: "Orange Polska",
    kind: "equity",
    featured: true,
    about: "Operator telekomunikacyjny, od telefonii komórkowej po światłowód.",
    aliases: ["orange", "orange polska"],
  },
  {
    ticker: "JSW",
    label: "JSW",
    name: "JSW",
    kind: "equity",
    featured: true,
    about: "Producent węgla koksowego, używanego przede wszystkim w hutnictwie.",
    aliases: ["jastrzebska spolka weglowa", "jastrzębska spółka węglowa"],
  },
  {
    ticker: "BDX",
    label: "BDX",
    name: "Budimex",
    kind: "equity",
    featured: true,
    about: "Grupa budowlana realizująca drogi, kolej i obiekty kubaturowe.",
    aliases: ["budimex"],
  },
  {
    ticker: "KRU",
    label: "KRU",
    name: "KRUK",
    kind: "equity",
    featured: true,
    about: "Grupa zarządzająca wierzytelnościami w Polsce i w regionie.",
    aliases: ["kruk"],
  },
  {
    ticker: "ALR",
    label: "ALR",
    name: "Alior Bank",
    kind: "equity",
    featured: true,
    about: "Bank uniwersalny z ofertą dla klientów detalicznych i przedsiębiorstw.",
    aliases: ["alior", "alior bank"],
  },
  {
    ticker: "PCO",
    label: "PCO",
    name: "Pepco",
    kind: "equity",
    featured: true,
    about: "Sieć sklepów z odzieżą i artykułami dla domu w niższych cenach.",
    aliases: ["pepco"],
  },
  {
    ticker: "XTB",
    label: "XTB",
    name: "XTB",
    kind: "equity",
    featured: true,
    about: "Dom maklerski oferujący dostęp do rynków przez platformę inwestycyjną.",
    aliases: ["xtb sa"],
  },
  {
    ticker: "ZAB",
    label: "ZAB",
    name: "Żabka",
    kind: "equity",
    featured: true,
    about: "Sieć sklepów convenience prowadzonych głównie w modelu franczyzowym.",
    aliases: ["zabka", "żabka"],
  },
  {
    ticker: "ACP",
    label: "ACP",
    name: "Asseco Poland",
    kind: "equity",
    featured: true,
    about: "Producent oprogramowania dla banków, administracji i firm.",
    aliases: ["asseco", "asseco poland"],
  },
  {
    ticker: "CPS",
    label: "CPS",
    name: "Cyfrowy Polsat",
    kind: "equity",
    featured: false,
    about: "Grupa mediowo-telekomunikacyjna, od telewizji płatnej po sieć komórkową.",
    aliases: ["polsat", "cyfrowy polsat"],
  },
  {
    ticker: "KTY",
    label: "KTY",
    name: "Grupa Kęty",
    kind: "equity",
    featured: false,
    about: "Producent wyrobów aluminiowych, od profili po systemy budowlane.",
    aliases: ["kety", "kęty", "grupa kety"],
  },
  {
    ticker: "GPW",
    label: "GPW",
    name: "GPW",
    kind: "equity",
    featured: false,
    about: "Spółka prowadząca Giełdę Papierów Wartościowych w Warszawie.",
    aliases: ["gielda", "giełda"],
  },
  {
    ticker: "ING",
    label: "ING",
    name: "ING Bank Śląski",
    kind: "equity",
    featured: false,
    about: "Bank uniwersalny z mocną pozycją w bankowości elektronicznej.",
    aliases: ["ing bank", "ing bank slaski", "ing bank śląski"],
  },
  {
    ticker: "MIL",
    label: "MIL",
    name: "Bank Millennium",
    kind: "equity",
    featured: false,
    about: "Bank detaliczny i korporacyjny z siecią oddziałów w całej Polsce.",
    aliases: ["millennium", "bank millennium"],
  },
];

const listings = listingsJson as ListingRow[];
const curatedByTicker = new Map(
  CURATED.filter((item) => item.kind === "equity").map((item) => [item.ticker, item]),
);

const companies: Instrument[] = listings.map((row) => {
  const curated = curatedByTicker.get(row.ticker);
  if (curated) return { ...curated, market: row.market };
  return {
    ticker: row.ticker,
    label: row.ticker,
    name: row.name,
    kind: "equity",
    featured: false,
    about:
      row.market === "newconnect"
        ? "Spółka notowana na NewConnect."
        : "Spółka z rynku głównego Giełdy Papierów Wartościowych w Warszawie.",
    aliases: [],
    market: row.market,
  };
});

const indices: Instrument[] = CURATED.filter((item) => item.kind === "index").map((item) => ({
  ...item,
  market: null,
}));

export const INSTRUMENTS: Instrument[] = [...indices, ...companies];

export function listedCompanies(): Instrument[] {
  return companies;
}

export const COMPANY_COUNTS = {
  gpw: companies.filter((item) => item.market === "gpw").length,
  newconnect: companies.filter((item) => item.market === "newconnect").length,
  total: companies.length,
};

export function venueLabel(instrument: Instrument): string {
  if (instrument.kind === "index") return "indeks";
  if (instrument.market === "newconnect") return "NewConnect";
  return "rynek główny";
}

export function yahooSymbol(ticker: string): string {
  return `${ticker}.WA`;
}

export function findInstrument(input: string): Instrument | undefined {
  const query = fold(input.trim().replace(/\.wa$/i, ""));
  if (!query) return undefined;
  const byTicker = INSTRUMENTS.find(
    (item) => fold(item.ticker) === query || fold(item.label) === query,
  );
  if (byTicker) return byTicker;
  return INSTRUMENTS.find((item) => {
    const fields = [item.name, ...item.aliases];
    return fields.some((field) => fold(field) === query);
  });
}

export function searchInstruments(query: string): Instrument[] {
  const folded = fold(query.trim());
  if (!folded) return [];
  return INSTRUMENTS.filter((item) => {
    const fields = [item.ticker, item.label, item.name, ...item.aliases].map(fold);
    return fields.some((field) => field.includes(folded));
  }).sort((a, b) => rank(a, folded) - rank(b, folded));
}

function rank(item: Instrument, query: string): number {
  const ticker = fold(item.ticker);
  const label = fold(item.label);
  if (ticker === query || label === query) return 0;
  if (ticker.startsWith(query) || label.startsWith(query)) return 1;
  if (fold(item.name).startsWith(query)) return 2;
  return 3;
}

export const SUGGESTED_TICKERS = ["WIG20", "WIG", "PKO", "PKN", "KGH", "CDR"];

export function suggestedInstruments(): Instrument[] {
  return SUGGESTED_TICKERS.map((ticker) =>
    INSTRUMENTS.find((item) => item.ticker === ticker),
  ).filter((item): item is Instrument => Boolean(item));
}
