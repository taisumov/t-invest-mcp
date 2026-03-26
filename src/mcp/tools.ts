import { z } from 'zod';

// ─── Zod-схемы для валидации входных аргументов инструментов ─────────────────

const IsoDatetimeSchema = z.string().datetime({ offset: true, message: 'Ожидается ISO 8601 datetime с timezone, напр. 2024-01-01T00:00:00Z' });

export const ToolSchemas = {
  get_accounts: z.object({}),

  get_user_info: z.object({}),

  get_portfolio: z.object({
    accountId: z.string({ required_error: 'accountId обязателен' }),
    currency: z.enum(['RUB', 'USD', 'EUR']).default('RUB'),
  }),

  get_positions: z.object({
    accountId: z.string({ required_error: 'accountId обязателен' }),
  }),

  get_portfolio_summary: z.object({
    accountId: z.string({ required_error: 'accountId обязателен' }),
    currency: z.enum(['RUB', 'USD', 'EUR']).default('RUB'),
  }),

  get_operations: z.object({
    accountId: z.string({ required_error: 'accountId обязателен' }),
    from: IsoDatetimeSchema,
    to: IsoDatetimeSchema,
  }),

  get_operations_summary: z.object({
    accountId: z.string({ required_error: 'accountId обязателен' }),
    from: IsoDatetimeSchema,
    to: IsoDatetimeSchema,
  }),

  get_last_prices: z.object({
    figis: z.array(z.string()).min(1, 'Нужен хотя бы один FIGI'),
  }),

  get_instrument: z.object({
    figi: z.string({ required_error: 'figi обязателен' }),
  }),

  find_instrument: z.object({
    query: z.string({ required_error: 'query обязателен' }),
  }),

  get_candles: z.object({
    figi: z.string({ required_error: 'figi обязателен' }),
    from: IsoDatetimeSchema,
    to: IsoDatetimeSchema,
    interval: z
      .enum([
        'CANDLE_INTERVAL_1_MIN',
        'CANDLE_INTERVAL_5_MIN',
        'CANDLE_INTERVAL_15_MIN',
        'CANDLE_INTERVAL_HOUR',
        'CANDLE_INTERVAL_DAY',
        'CANDLE_INTERVAL_WEEK',
        'CANDLE_INTERVAL_MONTH',
      ])
      .default('CANDLE_INTERVAL_DAY'),
  }),

  get_dividends: z.object({
    figi: z.string({ required_error: 'figi обязателен' }),
    from: IsoDatetimeSchema,
    to: IsoDatetimeSchema,
  }),
} as const;

export type ToolName = keyof typeof ToolSchemas;
export type ToolInput<T extends ToolName> = z.infer<(typeof ToolSchemas)[T]>;

// ─── JSON Schema для MCP (описание инструментов) ──────────────────────────────

export const TOOL_DEFINITIONS = [
  {
    name: 'get_accounts' as const,
    description: 'Получить список всех инвестиционных счетов',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_user_info' as const,
    description: 'Получить информацию о пользователе (тариф, лимиты запросов)',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_portfolio' as const,
    description: 'Получить портфель счёта: позиции, стоимость, P&L. Требует accountId из get_accounts.',
    inputSchema: {
      type: 'object',
      required: ['accountId'],
      properties: {
        accountId: { type: 'string', description: 'ID счёта' },
        currency: {
          type: 'string',
          enum: ['RUB', 'USD', 'EUR'],
          description: 'Валюта оценки',
          default: 'RUB',
        },
      },
    },
  },
  {
    name: 'get_positions' as const,
    description: 'Получить текущие открытые позиции счёта (акции, облигации, фонды, валюта)',
    inputSchema: {
      type: 'object',
      required: ['accountId'],
      properties: {
        accountId: { type: 'string', description: 'ID счёта' },
      },
    },
  },
  {
    name: 'get_portfolio_summary' as const,
    description: 'Получить краткую сводку по портфелю: общая стоимость, P&L, число позиций, топ позиций.',
    inputSchema: {
      type: 'object',
      required: ['accountId'],
      properties: {
        accountId: { type: 'string', description: 'ID счёта' },
        currency: {
          type: 'string',
          enum: ['RUB', 'USD', 'EUR'],
          description: 'Валюта оценки',
          default: 'RUB',
        },
      },
    },
  },
  {
    name: 'get_operations' as const,
    description: 'Получить историю операций: сделки, пополнения, дивиденды и т.д.',
    inputSchema: {
      type: 'object',
      required: ['accountId', 'from', 'to'],
      properties: {
        accountId: { type: 'string', description: 'ID счёта' },
        from: { type: 'string', description: 'Начало периода ISO 8601, напр. 2024-01-01T00:00:00Z' },
        to: { type: 'string', description: 'Конец периода ISO 8601, напр. 2024-12-31T23:59:59Z' },
      },
    },
  },
  {
    name: 'get_operations_summary' as const,
    description: 'Получить краткую сводку по операциям за период: число операций, net cashflow, частые типы.',
    inputSchema: {
      type: 'object',
      required: ['accountId', 'from', 'to'],
      properties: {
        accountId: { type: 'string', description: 'ID счёта' },
        from: { type: 'string', description: 'Начало периода ISO 8601, напр. 2024-01-01T00:00:00Z' },
        to: { type: 'string', description: 'Конец периода ISO 8601, напр. 2024-12-31T23:59:59Z' },
      },
    },
  },
  {
    name: 'get_last_prices' as const,
    description: 'Получить текущие рыночные цены по FIGI-кодам',
    inputSchema: {
      type: 'object',
      required: ['figis'],
      properties: {
        figis: {
          type: 'array',
          items: { type: 'string' },
          description: 'Массив FIGI-кодов',
        },
      },
    },
  },
  {
    name: 'get_instrument' as const,
    description: 'Получить подробную информацию об инструменте по FIGI (название, тикер, сектор)',
    inputSchema: {
      type: 'object',
      required: ['figi'],
      properties: {
        figi: { type: 'string', description: 'FIGI-код инструмента' },
      },
    },
  },
  {
    name: 'find_instrument' as const,
    description: 'Найти инструменты по тикеру или названию (например SBER, Apple)',
    inputSchema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string', description: 'Тикер или название' },
      },
    },
  },
  {
    name: 'get_candles' as const,
    description: 'Получить историю цен (OHLCV свечи) для инструмента',
    inputSchema: {
      type: 'object',
      required: ['figi', 'from', 'to'],
      properties: {
        figi: { type: 'string', description: 'FIGI-код инструмента' },
        from: { type: 'string', description: 'Начало периода ISO 8601' },
        to: { type: 'string', description: 'Конец периода ISO 8601' },
        interval: {
          type: 'string',
          enum: [
            'CANDLE_INTERVAL_1_MIN',
            'CANDLE_INTERVAL_5_MIN',
            'CANDLE_INTERVAL_15_MIN',
            'CANDLE_INTERVAL_HOUR',
            'CANDLE_INTERVAL_DAY',
            'CANDLE_INTERVAL_WEEK',
            'CANDLE_INTERVAL_MONTH',
          ],
          default: 'CANDLE_INTERVAL_DAY',
        },
      },
    },
  },
  {
    name: 'get_dividends' as const,
    description: 'Получить историю дивидендов инструмента',
    inputSchema: {
      type: 'object',
      required: ['figi', 'from', 'to'],
      properties: {
        figi: { type: 'string', description: 'FIGI-код инструмента' },
        from: { type: 'string', description: 'Начало периода ISO 8601' },
        to: { type: 'string', description: 'Конец периода ISO 8601' },
      },
    },
  },
] as const;
