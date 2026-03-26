# Tinkoff Invest MCP + REST

TypeScript project that wraps the T-Investments public API and exposes it in two ways:

- `REST API` for local integrations and debugging
- `MCP server` for AI clients such as Claude or Codex

The project is read-only by design. It fetches accounts, portfolio, positions, operations, instruments, prices, candles, and dividends.

## Requirements

- Node.js 20+
- A T-Investments API token with read-only access

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

```env
TINKOFF_TOKEN=your_read_only_token
PORT=3000
```

## Run

Start the REST API:

```bash
npm run rest
```

Start the MCP server:

```bash
npm run mcp
```

Build production files:

```bash
npm run build
```

Run the built output:

```bash
npm run rest:prod
npm run mcp:prod
```

## REST endpoints

- `GET /accounts`
- `GET /accounts/user`
- `GET /portfolio/:accountId?currency=RUB`
- `GET /portfolio/positions/:accountId`
- `GET /portfolio/operations/:accountId?from=2024-01-01T00:00:00Z&to=2024-12-31T23:59:59Z`
- `GET /market/prices?figi=BBG000B9XRY4&figi=BBG004730N88`
- `GET /market/candles/:figi?from=2024-01-01T00:00:00Z&to=2024-12-31T23:59:59Z&interval=CANDLE_INTERVAL_DAY`
- `GET /instruments/search?q=SBER`
- `GET /instruments/:figi`
- `GET /instruments/:figi/dividends?from=2024-01-01T00:00:00Z&to=2024-12-31T23:59:59Z`

## MCP tools

- `get_accounts`
- `get_user_info`
- `get_portfolio`
- `get_portfolio_summary`
- `get_positions`
- `get_operations`
- `get_operations_summary`
- `get_last_prices`
- `get_instrument`
- `find_instrument`
- `get_candles`
- `get_dividends`

## Notes for GitHub

- Do not commit `.env`
- Use a read-only token
- If a real token has already been exposed outside your machine, rotate it before publishing
