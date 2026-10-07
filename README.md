# GPW Notowania

Independent quotes desk for the Warsaw Stock Exchange: major indices, a large-cap table, a searchable catalog of main-market and NewConnect companies, an instrument page with an interactive chart, and a short Polish newsroom.

This is not the official GPW website and it is not investment advice.

## Data source

**Active path: Yahoo Finance public chart API. No API key.**

Quotes and history come from `https://query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}.WA` (Warsaw names such as `PKO.WA` and `WIG20.WA`). Responses are cached for about 60 seconds.

- Stocks use native daily candles for the longer ranges, plus intraday candles (5-minute session, 15-minute five-day).
- WIG indices do not expose a usable daily history on that feed. Longer index ranges are hourly bars folded into one candle per Warsaw session. Intraday still comes straight from the feed.
- The chart caption says which of those paths you are looking at.

**Company catalog.** `src/data/listings.json` lists 402 main-market companies and 325 NewConnect companies (727 in total). Names, tickers, and ISINs come from the public TradingView Poland scanner. Main-market rows are the companies whose ISINs appear on the GPW indicators page (402 names, including Energa and Indygo Tech Minerals, which the scanner omitted). NewConnect rows are names from the 26 June 2026 GPW segment notice that are still in the scanner, plus Liftero and Thorium Space, whose Bankier profiles place them on NewConnect. The header search and the homepage browser use this list. A page of the browser asks Yahoo only for the symbols on that page (`/api/kursy`, at most 40).

This is not a complete download of every line GPW has ever published. Left out on purpose:

- about 49 foreign shares traded on GPW (non-Polish ISINs such as Apple or InPost); Stooq lists those separately from domestic companies
- 10 ISINs from the June 2026 NewConnect notice that are no longer in the live scanner, so they are not shown as current listings

If Yahoo has no quote and the symbol is not in the local snapshot, the row stays and the page says the quote is missing. Indygo Tech Minerals (`IDG`) is in the catalog and currently has no Yahoo series. Prices are never filled in with a placeholder.

**Fallback:** if Yahoo does not answer for a symbol that exists in `src/data/snapshot.json`, the page serves that snapshot and a deterministic local series built from it. A banner on the board, a “zapis lokalny” mark, and a note under the chart say when the local copy is on screen. Symbols outside the snapshot do not get a made-up price. The app still runs with no API key.

**Macro, from Finwire.** The homepage also shows public series from `https://public-api.finwire.pl` (no key): NBP policy rates, WIBOR, POLSTR, CPI, NBP FX, housing prices, GUS wages, retail bonds, IKE/IKZE limits, finwire barometers, the credit-stress map, and deposit, savings, mortgage, and cash-loan aggregates. Each series is its own card. If one request fails, only that card shows an error. The quotes board does not depend on Finwire. These are not GPW prices, and the site does not republish Finwire articles.

**News** is written for this site. “Przegląd sesji” is calculated from the board you are viewing (live feed or local snapshot). The other articles explain how to read the indices, the table, and the chart. They are not a wire feed.

## Run locally

```bash
npm install
npm run dev
```

The dev server listens on [http://127.0.0.1:3847](http://127.0.0.1:3847).

## Pages

- `/` — WIG20, WIG, mWIG40, sWIG80, a table of large Warsaw stocks, a paged catalog of main-market and NewConnect companies, and the Finwire macro cards
- `/instrument/PKO` — quote, session stats, and chart (try `WIG20`, `KGH`, `CDR`, `11B`, `7FT`)
- `/wiadomosci` — headlines
- `/wiadomosci/przeglad-sesji` — session piece built from the board
