import "server-only";

import { formatPercent, formatPrice, formatSigned, plural, priceUnit } from "@/lib/format";
import { getBoard } from "@/lib/market";
import { warsawISODate } from "@/lib/time";
import type { Board, Quote } from "@/lib/types";

export type Article = {
  slug: string;
  kicker: string;
  title: string;
  dek: string;
  date: string;
  paragraphs: string[];
};

export const SESSION_SLUG = "przeglad-sesji";

const STATIC_ARTICLES: Article[] = [
  {
    slug: "cztery-indeksy",
    kicker: "Parkiet",
    title: "Cztery indeksy, cztery różne portfele",
    dek: "WIG20, WIG, mWIG40 i sWIG80 nie mówią tego samego, nawet gdy idą w tę samą stronę.",
    date: "2026-10-05",
    paragraphs: [
      "WIG20 zbiera dwadzieścia największych i najbardziej płynnych spółek. To na niego patrzy się najpierw, gdy ktoś pyta, „co robi giełda”. Jeden bank albo jedna spółka paliwowa potrafi tu przesunąć cały indeks.",
      "WIG jest szerszy. Wchodzą do niego spółki duże, średnie i mniejsze, więc pojedynczy ruch waży mniej. Gdy WIG20 rośnie, a WIG stoi, sesja jest wąska: ciągną ją największe nazwy, a reszta parkietu nie nadąża.",
      "mWIG40 opisuje średnie spółki, sWIG80 mniejsze. Te dwa indeksy często żyją własnym rytmem, bliżej krajowej koniunktury i dalej od globalnych przepływów, które rządzą największymi papierami.",
      "Na stronie głównej te cztery liczby leżą obok siebie właśnie po to, żeby dało się je porównać jednym spojrzeniem. Żaden z nich nie jest „głównym wynikiem giełdy”. Każdy jest innym portfelem.",
    ],
  },
  {
    slug: "jak-czytac-notowanie",
    kicker: "Warsztat",
    title: "Jak czytać kurs, zmianę i zmianę procentową",
    dek: "Trzy liczby przy spółce wystarczą, żeby wiedzieć, gdzie jest kurs wobec wczoraj.",
    date: "2026-10-03",
    paragraphs: [
      "Kurs to ostatnia cena z feedu. Przy spółce jest w złotych, przy indeksie w punktach. Sama liczba niewiele mówi, dopóki nie stanie obok poprzedniego zamknięcia.",
      "Zmiana to różnica wobec tamtego zamknięcia, w tych samych jednostkach co kurs. Dwa złote w górę na akcji za sto złotych to co innego niż dwa złote na akcji za dwadzieścia tysięcy.",
      "Zmiana procentowa sprowadza oba ruchy do wspólnej skali. Dlatego tabela da się sortować wzrokiem: plus dwa procent jest wyraźne i na banku, i na spółce odzieżowej, choć kwoty są inne.",
      "Zielony to wzrost wobec poprzedniego zamknięcia, czerwony to spadek. Zero oznacza, że ostatni kurs pokrywa się z tamtym zamknięciem. Kolor nie mówi, czy spółka jest droga. Mówi tylko, co stało się od wczoraj.",
    ],
  },
  {
    slug: "wykres-sesji-i-historii",
    kicker: "Wykres",
    title: "Świeca z sesji i świeca z dnia to nie to samo",
    dek: "Krótki zakres pokazuje przebieg handlu. Długi zakres pokazuje, skąd kurs przyszedł.",
    date: "2026-10-01",
    paragraphs: [
      "Zakres „Sesja” składa dzień z krótkich świec, co pięć minut. Widać na nim, czy kurs od rana wspinał się spokojnie, czy odrobił spadek dopiero po południu. „5D” robi to samo, tylko na kilku sesjach i na świecach piętnastominutowych.",
      "Zakresy od miesiąca w górę przechodzą na świece dzienne. Jedna świeca to wtedy cały dzień: otwarcie, maksimum, minimum i zamknięcie. Znika godzina, zostaje kierunek.",
      "Przy indeksach WIG publiczny feed nie oddaje wieloletniej historii dziennej. Dłuższy wykres składamy więc z notowań godzinowych i zamykamy je w jedną świecę na dzień. Przy spółkach świece dzienne przychodzą wprost z feedu.",
      "Najedź na wykres albo dotknij go, żeby odczytać konkretną świecę. O to otwarcie, H maksimum, L minimum, C zamknięcie. Ostatnia świeca zostaje na pasku, gdy odjedziesz kursorem.",
    ],
  },
  {
    slug: "godziny-parkietu",
    kicker: "Sesja",
    title: "Kiedy warszawski parkiet naprawdę handluje",
    dek: "Kurs o ósmej rano i kurs o ósmej wieczór nie znaczą tego samego.",
    date: "2026-09-26",
    paragraphs: [
      "W dzień roboczy notowania ciągłe na GPW zaczynają się o 9:00 czasu warszawskiego. Do 16:50 rynek zbiera zlecenia na bieżąco i kurs potrafi ruszać się z minuty na minutę.",
      "Potem przychodzi faza zamknięcia. Około 17:05 sesja jest już po handlu. W weekend tablica milknie: kurs, który widzisz, to ostatnie zamknięcie, a nie nowa transakcja.",
      "Na stronie podpisujemy tę fazę przy tablicy: przed sesją, sesja, dogrywka albo po sesji. Godzina przy kursie jest godziną ostatniej danej z feedu, niekoniecznie godziną, w której otworzyłeś stronę.",
      "Jeśli patrzysz na wykres śróddzienny poza sesją, zobaczysz zakończony dzień, a nie pusty ekran. Nowe świece pięciominutowe pojawiają się dopiero, gdy handel wraca.",
    ],
  },
  {
    slug: "skad-biora-sie-liczby",
    kicker: "Dane",
    title: "Skąd biorą się liczby w tym serwisie",
    dek: "Kursy lecą z publicznego feedu. Teksty piszemy sami. Żadne z nich nie jest rekomendacją.",
    date: "2026-09-22",
    paragraphs: [
      "Notowania spółek i indeksów bierzemy z publicznego wykresu Yahoo Finance, z symboli warszawskich zakończonych na .WA. Nie potrzeba do tego klucza. Serwis odświeża odczyt mniej więcej co minutę. Katalog obejmuje spółki rynku głównego i NewConnect, nie tylko duże nazwy z pierwszej tablicy. Gdy symbol nie ma kursu w feedzie ani w zapisie lokalnym, wiersz zostaje, ale bez wymyślonej ceny.",
      "To nie jest taśma samej giełdy i nie jest to serwis GPW. Kurs bywa opóźniony, a przy indeksach dłuższa historia dzienna w feedzie po prostu nie istnieje. Mówimy o tym przy wykresie, zamiast udawać pełne archiwum.",
      "Gdy feed nie odpowie, strona nie gaśnie. Pokazuje zapis kursów trzymany w repozytorium i wykres policzony od tego zapisu. Taki wykres jest oznaczony wprost: to przybliżenie, nie historia transakcji.",
      "Pod tablicą są wskaźniki makro z publicznego API finwire.pl: stopy NBP, WIBOR, POLSTR, inflacja, kursy walut, mieszkania, płace, obligacje i agregaty ofert. To osobne liczby, nie kursy z parkietu. Gdy jedna seria nie odpowie, pusta zostaje tylko jej karta.",
      "Nagłówki depesz bierzemy z publicznego kanału RSS PAP Biznes. Widać tytuł, godzinę i źródło, a link prowadzi na biznes.pap.pl. Treści depeszy nie kopiujemy. Przegląd sesji liczy się z tablicy, którą właśnie widzisz, a pozostałe teksty tłumaczą, jak czytać parkiet. Nic z tego nie jest poradą, żeby kupić albo sprzedać.",
    ],
  },
];

export function buildSessionArticle(board: Board): Article {
  const wig20 = pick(board.indices, "WIG20");
  const wig = pick(board.indices, "WIG");
  const mid = pick(board.indices, "MWIG40");
  const small = pick(board.indices, "SWIG80");
  const ranked = [...board.stocks].sort((a, b) => b.changePercent - a.changePercent);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  const rising = board.stocks.filter((stock) => stock.changePercent > 0).length;
  const falling = board.stocks.filter((stock) => stock.changePercent < 0).length;
  const risingLabel =
    rising === 0
      ? "żadna nie rośnie"
      : plural(rising, "1 spółka rośnie", `${rising} spółki rosną`, `${rising} spółek rośnie`);
  const fallingLabel =
    falling === 0
      ? "żadna nie spada"
      : plural(falling, "jedna spada", `${falling} spadają`, `${falling} spada`);

  const title = wig20
    ? `WIG20: ${formatPrice(wig20.price)} pkt, ${formatPercent(wig20.changePercent)}`
    : "Przegląd sesji";
  const dek = wig
    ? `Szeroki WIG ${formatPercent(wig.changePercent)}. W tabeli dużych spółek ${risingLabel}, a ${fallingLabel}.`
    : "Zestawienie indeksów i dużych spółek z bieżącej tablicy.";

  const paragraphs = [
    wig20
      ? `WIG20 jest na ${formatPrice(wig20.price)} pkt, czyli ${formatSigned(wig20.change)} pkt (${formatPercent(wig20.changePercent)}) wobec poprzedniego zamknięcia ${formatPrice(wig20.previousClose)} pkt.`
      : "Brakuje odczytu WIG20.",
    wig && mid && small
      ? `Szeroki WIG pokazuje ${formatPrice(wig.price)} pkt (${formatPercent(wig.changePercent)}). mWIG40, czyli średnie spółki, jest na ${formatPrice(mid.price)} pkt (${formatPercent(mid.changePercent)}). sWIG80, mniejszy parkiet, na ${formatPrice(small.price)} pkt (${formatPercent(small.changePercent)}).`
      : "Nie wszystkie cztery indeksy są teraz na tablicy.",
    best && worst && best.ticker !== worst.ticker
      ? `W tabeli dużych spółek najmocniej rośnie ${best.name} (${best.label}): ${formatPercent(best.changePercent)}, kurs ${formatPrice(best.price)} ${priceUnit(best.kind)}. ${worstLine(worst)}`
      : "Tabela spółek jest zbyt krótka, żeby wskazać oba końce sesji.",
    `W tym zestawieniu ${risingLabel}, a ${fallingLabel}. To nie jest skład WIG20, tylko lista płynnych nazw, które da się otworzyć z wyszukiwarki.`,
    board.source === "yahoo"
      ? "Liczby pochodzą z publicznego feedu Yahoo Finance dla parkietu w Warszawie i mogą być opóźnione względem taśmy GPW."
      : "Publiczny feed nie odpowiedział w całości, więc część albo całość tablicy to zapis lokalny trzymany w serwisie. Przegląd liczy się z tego, co jest na ekranie.",
    "Tekst powstaje w chwili otwarcia strony z liczb, które widzisz na tablicy. Nie jest rekomendacją kupna ani sprzedaży.",
  ];

  return {
    slug: SESSION_SLUG,
    kicker: "Przegląd sesji",
    title,
    dek,
    date: warsawISODate(),
    paragraphs,
  };
}

export async function listArticles(): Promise<Article[]> {
  const board = await getBoard();
  return [buildSessionArticle(board), ...STATIC_ARTICLES];
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (slug === SESSION_SLUG) {
    const board = await getBoard();
    return buildSessionArticle(board);
  }
  return STATIC_ARTICLES.find((article) => article.slug === slug) ?? null;
}

function pick(quotes: Quote[], ticker: string): Quote | undefined {
  return quotes.find((quote) => quote.ticker === ticker);
}

function worstLine(quote: Quote): string {
  const course = `kurs ${formatPrice(quote.price)} ${priceUnit(quote.kind)}`;
  if (quote.changePercent < 0) {
    return `Najsłabiej wypada ${quote.name} (${quote.label}): ${formatPercent(quote.changePercent)}, ${course}.`;
  }
  if (quote.changePercent > 0) {
    return `Najmniej zyskuje ${quote.name} (${quote.label}): ${formatPercent(quote.changePercent)}, ${course}.`;
  }
  return `${quote.name} (${quote.label}) kończy bez zmiany, ${course}.`;
}
