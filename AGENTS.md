# AGENTS.md

## Project

This repository contains a read-only integration with T-Investments API exposed through:

- an MCP server for AI clients
- a local REST API for debugging and integrations

The project must remain read-only. Do not add trading, order placement, or any write operations against broker APIs.

## Stack

- Node.js 20+
- TypeScript
- `@modelcontextprotocol/sdk`
- Express
- Zod

## Entry Points

- MCP server: `src/mcp/server.ts`
- MCP tool definitions: `src/mcp/tools.ts`
- MCP tool handlers: `src/mcp/handlers.ts`
- REST server: `src/rest/server.ts`
- Tinkoff API client: `src/tinkoff/client.ts`
- API schemas and domain types: `src/tinkoff/schemas.ts`
- Summary/format helpers: `src/tinkoff/utils.ts`

## Commands

Install dependencies:

```bash
npm install
```

Run MCP server:

```bash
npm run mcp
```

Run REST server:

```bash
npm run rest
```

Build:

```bash
npm run build
```

Production entrypoints:

```bash
npm run mcp:prod
npm run rest:prod
```

## Environment

Required variables:

- `TINKOFF_TOKEN`
- `PORT` (optional in practice, defaults in config)

Setup:

```bash
cp .env.example .env
```

Never commit `.env`.

## Architecture Notes

- `src/mcp/*` is the AI-facing layer.
- `src/rest/*` is an HTTP wrapper around the same client.
- `src/tinkoff/client.ts` is the only place that should talk directly to T-Investments API.
- Zod schemas are the contract boundary for external API responses.
- If adding new endpoints or tools, prefer extending the client and schemas first, then expose them through MCP/REST.

## Rules For Agents

- Preserve the read-only nature of the project.
- Prefer small, typed changes over broad refactors.
- Keep MCP tools useful for LLMs: concise descriptions, strict input schemas, predictable outputs.
- When possible, return both a short human-readable summary and structured JSON for MCP tools.
- Validate external API responses with Zod instead of passing raw JSON through.
- Add retries/timeouts carefully and only for safe read operations.
- Do not hardcode secrets, tokens, account IDs, or personal data.
- Do not commit generated `dist/` output unless the user explicitly asks for it.

## When Adding New MCP Tools

1. Add input schema in `src/mcp/tools.ts`.
2. Add MCP tool metadata in `src/mcp/tools.ts`.
3. Implement handling in `src/mcp/handlers.ts`.
4. Extend `src/tinkoff/client.ts` if a new API call is needed.
5. Add or update Zod schemas in `src/tinkoff/schemas.ts`.
6. Update `README.md` if the public interface changed.
7. Run `npm run build`.

## Preferred Improvements

- New summary tools over raw passthrough tools
- Better response normalization for money and quotations
- Stronger API response typing
- Tests for handlers and client behavior
- Better documentation for MCP tool usage

## Verification

Before finishing a change, run:

```bash
npm run build
```

If behavior changed at the API surface, update `README.md`.
