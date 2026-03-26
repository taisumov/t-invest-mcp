import { ZodError } from 'zod';
import type { TinkoffClient } from '../tinkoff/index.js';
import { summarizeOperations, summarizePortfolio } from '../tinkoff/utils.js';
import { ToolSchemas, type ToolName } from './tools.js';

type McpResult = { content: Array<{ type: 'text'; text: string }>; isError?: boolean };

function ok(data: unknown, summary?: string): McpResult {
  const parts = [];

  if (summary) {
    parts.push(summary);
  }

  parts.push(JSON.stringify(data, null, 2));

  return { content: [{ type: 'text', text: parts.join('\n\n') }] };
}

function err(message: string): McpResult {
  return { content: [{ type: 'text', text: `Ошибка: ${message}` }], isError: true };
}

export async function handleTool(
  client: TinkoffClient,
  name: ToolName,
  rawArgs: unknown,
): Promise<McpResult> {
  const schema = ToolSchemas[name];

  const parsed = schema.safeParse(rawArgs ?? {});
  if (!parsed.success) {
    return err(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const args = parsed.data as Record<string, unknown>;

  try {
    switch (name) {
      case 'get_accounts':
        return ok(await client.getAccounts());

      case 'get_user_info':
        return ok(await client.getUserInfo());

      case 'get_portfolio':
        return ok(await client.getPortfolio(args.accountId as string, args.currency as 'RUB' | 'USD' | 'EUR'));

      case 'get_positions':
        return ok(await client.getPositions(args.accountId as string));

      case 'get_portfolio_summary': {
        const portfolio = await client.getPortfolio(args.accountId as string, args.currency as 'RUB' | 'USD' | 'EUR');
        const summary = summarizePortfolio(portfolio);
        return ok({ summary: summary.metrics, portfolio }, summary.text);
      }

      case 'get_operations':
        return ok(await client.getOperations(args.accountId as string, args.from as string, args.to as string));

      case 'get_operations_summary': {
        const result = await client.getOperations(args.accountId as string, args.from as string, args.to as string);
        const summary = summarizeOperations(result.operations);
        return ok({ summary: summary.metrics, operations: result.operations }, summary.text);
      }

      case 'get_last_prices':
        return ok(await client.getLastPrices(args.figis as string[]));

      case 'get_instrument':
        return ok(await client.getInstrumentByFigi(args.figi as string));

      case 'find_instrument':
        return ok(await client.findInstrument(args.query as string));

      case 'get_candles':
        return ok(
          await client.getCandles(
            args.figi as string,
            args.from as string,
            args.to as string,
            args.interval as 'CANDLE_INTERVAL_DAY',
          ),
        );

      case 'get_dividends':
        return ok(await client.getDividends(args.figi as string, args.from as string, args.to as string));

      default:
        return err(`Неизвестный инструмент: ${String(name)}`);
    }
  } catch (e) {
    if (e instanceof ZodError) {
      return err(`Неожиданный ответ API: ${e.message}`);
    }
    return err(e instanceof Error ? e.message : String(e));
  }
}
