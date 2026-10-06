# GPW Notowania

Independent quotes desk for the Warsaw Stock Exchange: major indices, a table of large stocks, an instrument page with an interactive chart, and a short Polish newsroom.

This is not the official GPW website and it is not investment advice.

## Data source

**Active path: Yahoo Finance public chart API. No API key.**

Quotes and history come from `https://query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}.WA` (Warsaw names such as `PKO.WA` and `WIG20.WA`). Responses are cached for about 60 seconds.

- Stocks use native daily candles for the longer ranges, plus intraday candles (5-minute session, 15-minute five-day).
- WIG indices do not expose a usable daily history on that feed. Longer index ranges are hourly bars folded into one candle per Warsaw session. Intraday still comes straight from the feed.
- The chart caption says which of those paths you are looking at.

**Fallback:** if Yahoo does not answer, the page serves the snapshot in `src/data/snapshot.json` and a deterministic local series built from that snapshot. A banner on the board, and a note under the chart, say when the local copy is on screen. The app still runs with no API key and no network to Yahoo.

**News** is written for this site. “Przegląd sesji” is calculated from the board you are viewing (live feed or local snapshot). The other articles explain how to read the indices, the table, and the chart. They are not a wire feed.

## Run locally

```bash
npm install
npm run dev
```

The dev server listens on [http://127.0.0.1:3847](http://127.0.0.1:3847).

## Pages

- `/` — WIG20, WIG, mWIG40, sWIG80, and a table of large Warsaw stocks
- `/instrument/PKO` — quote, session stats, and chart (try `WIG20`, `KGH`, `CDR`)
- `/wiadomosci` — headlines
- `/wiadomosci/przeglad-sesji` — session piece built from the board
