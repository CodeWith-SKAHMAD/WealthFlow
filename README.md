# WealthFlow — Personal Investment Tracker

A personal investment tracker built with React + Vite + Supabase. Tracks an EUR ledger, a
USDT ledger, and Buy/Sell positions across Stocks, ETFs, and Crypto — with watchlists,
calculators, a currency converter, notes, custom reports, and realized/unrealized P&L.

## 1. What's already configured

Your `.env` file already contains your real Supabase project URL and anon key, so the app
will connect to your project as soon as you run it. The anon key is safe to keep in the repo —
it's designed to be public; your data is protected by Row Level Security (RLS) policies, which
this project sets up so that every user can only ever see their own rows.

## 2. Set up the Supabase database (one-time)

1. Go to your Supabase project dashboard → **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this project, copy all of it, paste it into the SQL editor,
   and click **Run**.
3. That creates all tables (`ledger_transactions`, `holdings_transactions`, `watchlist`,
   `notes`, `profiles`), enables Row Level Security, and sets up a trigger that creates a
   profile row automatically whenever someone signs up.
4. In **Authentication → Providers**, make sure **Email** is enabled (it is by default).
   For personal use, you can also turn off "Confirm email" under **Authentication → Settings**
   so you can sign in immediately after creating your account, without checking an inbox.

## 3. Run it locally

```bash
npm install
npm run dev
```

Open the printed local URL, click "Create one" on the login screen, sign up with any email +
password, and you're in.

## 4. Live stock/ETF prices (optional)

Crypto prices work out of the box (via CoinGecko — free, no key needed). Stock/ETF prices need
a free API key:

1. Go to https://twelvedata.com/ and create a free account (no credit card).
2. Copy your API key.
3. Paste it into `.env` as `VITE_TWELVEDATA_API_KEY=your-key-here`.
4. Restart the dev server.

Without this key, Stock/ETF holdings still track quantity, cost basis, and realized P&L
correctly — only the live "Unrealized P&L" figure shows "—" until a key is added.

Watchlist mini-charts use TradingView's free embeddable widget and don't need any key. For best
accuracy, add the exchange prefix when adding a watchlist symbol (e.g. `NASDAQ:AAPL`,
`BINANCE:BTCUSDT`) — there's a hint field for this in the "Add to Watchlist" form.

## 5. Deploy

Push this repo to GitHub, then deploy with [Vercel](https://vercel.com) or
[Netlify](https://netlify.com) (both have free tiers):

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: copy the three values from your `.env` file into the host's
  dashboard (Vercel: Project Settings → Environment Variables).

## How the data and math work

- **Average cost method**: when you buy the same stock/coin multiple times at different
  prices, the app tracks a running *average* cost. Selling reduces quantity and realizes
  P&L against that average cost — it does not pick specific lots (no FIFO/LIFO).
- **Auto-fill in the transaction form**: fill in any two of Quantity / Price / Total Cost and
  the third one calculates automatically.
- **Currency conversion**: uses a free, no-key exchange rate API (updated daily). Used for the
  Currency Converter page and the quick USD↔EUR rate shown in the top bar.
- **Market session bar**: shows standard Sydney/Asia/London/New York trading-session windows
  against your device's local time and timezone — no setup needed.

## Project structure

```
src/
  components/   reusable UI (glass cards, buttons, modals), layout (sidebar/topbar), charts
  context/      auth + theme (dark/light) react context
  hooks/        data-fetching hooks (portfolio, ledger, watchlist)
  lib/          Supabase client, calculations, currency/price APIs, report export, DB calls
  pages/        one file per sidebar destination
supabase/
  schema.sql    run once in the Supabase SQL editor
```

## Security note

This app uses Supabase Auth with email/password and Row Level Security, so even though the
anon key is public, no one can read or write another user's rows. Treat your account password
as you would any financial app's password.
