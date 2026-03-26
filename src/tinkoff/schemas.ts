import { z } from 'zod';

// ─── Primitives ──────────────────────────────────────────────────────────────

export const MoneyValueSchema = z.object({
  currency: z.string(),
  units: z.string(), // int64 передаётся как строка
  nano: z.number(),
});

export const QuotationSchema = z.object({
  units: z.string(),
  nano: z.number(),
});

// ─── Accounts ─────────────────────────────────────────────────────────────────

export const AccountSchema = z
  .object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    status: z.string(),
    openedDate: z.string().optional(),
    closedDate: z.string().optional(),
    accessLevel: z.string().optional(),
  })
  .passthrough();

export const GetAccountsResponseSchema = z.object({
  accounts: z.array(AccountSchema),
});

export const UserInfoResponseSchema = z
  .object({
    premStatus: z.boolean().optional(),
    qualStatus: z.boolean().optional(),
    qualifiedForWorkWith: z.array(z.string()).optional(),
    tariff: z.string().optional(),
  })
  .passthrough();

// ─── Portfolio ────────────────────────────────────────────────────────────────

export const PortfolioPositionSchema = z
  .object({
    figi: z.string(),
    instrumentType: z.string(),
    quantity: QuotationSchema,
    averagePositionPrice: MoneyValueSchema.optional(),
    expectedYield: QuotationSchema.optional(),
    currentPrice: MoneyValueSchema.optional(),
    currentNkd: MoneyValueSchema.optional(),
    blockedLots: QuotationSchema.optional(),
    positionUid: z.string().optional(),
    instrumentUid: z.string().optional(),
  })
  .passthrough();

export const PortfolioResponseSchema = z
  .object({
    accountId: z.string().optional(),
    totalAmountShares: MoneyValueSchema.optional(),
    totalAmountBonds: MoneyValueSchema.optional(),
    totalAmountEtf: MoneyValueSchema.optional(),
    totalAmountCurrencies: MoneyValueSchema.optional(),
    totalAmountFutures: MoneyValueSchema.optional(),
    totalAmountPortfolio: MoneyValueSchema.optional(),
    expectedYield: QuotationSchema.optional(),
    positions: z.array(PortfolioPositionSchema),
  })
  .passthrough();

export const PositionsResponseSchema = z
  .object({
    money: z.array(MoneyValueSchema).optional(),
    blocked: z.array(MoneyValueSchema).optional(),
    securities: z.array(z.record(z.unknown())).optional(),
    limitsLoadingInProgress: z.boolean().optional(),
    futures: z.array(z.record(z.unknown())).optional(),
    options: z.array(z.record(z.unknown())).optional(),
  })
  .passthrough();

// ─── Operations ───────────────────────────────────────────────────────────────

export const OperationSchema = z
  .object({
    id: z.string(),
    parentOperationId: z.string().optional(),
    currency: z.string().optional(),
    payment: MoneyValueSchema.optional(),
    price: MoneyValueSchema.optional(),
    state: z.string(),
    quantity: z.union([z.number(), z.string()]).optional(),
    figi: z.string().optional(),
    instrumentType: z.string().optional(),
    date: z.string(),
    type: z.string(),
    operationType: z.string().optional(),
  })
  .passthrough();

export const GetOperationsResponseSchema = z.object({
  operations: z.array(OperationSchema),
});

// ─── Market data ──────────────────────────────────────────────────────────────

export const LastPriceSchema = z
  .object({
    figi: z.string(),
    price: QuotationSchema,
    time: z.string(),
    instrumentUid: z.string().optional(),
  })
  .passthrough();

export const GetLastPricesResponseSchema = z.object({
  lastPrices: z.array(LastPriceSchema),
});

export const CandleSchema = z
  .object({
    open: QuotationSchema.optional(),
    high: QuotationSchema.optional(),
    low: QuotationSchema.optional(),
    close: QuotationSchema.optional(),
    volume: z.number().optional(),
    time: z.string(),
    isComplete: z.boolean().optional(),
  })
  .passthrough();

export const GetCandlesResponseSchema = z.object({
  candles: z.array(CandleSchema),
});

// ─── Instruments ──────────────────────────────────────────────────────────────

export const InstrumentSchema = z
  .object({
    figi: z.string(),
    ticker: z.string().optional(),
    classCode: z.string().optional(),
    isin: z.string().optional(),
    lot: z.number().optional(),
    currency: z.string().optional(),
    name: z.string().optional(),
    exchange: z.string().optional(),
    instrumentType: z.string().optional(),
    uid: z.string().optional(),
    sector: z.string().optional(),
    countryOfRisk: z.string().optional(),
    countryOfRiskName: z.string().optional(),
  })
  .passthrough();

export const GetInstrumentResponseSchema = z.object({
  instrument: InstrumentSchema,
});

export const FindInstrumentItemSchema = z
  .object({
    figi: z.string(),
    ticker: z.string().optional(),
    classCode: z.string().optional(),
    isin: z.string().optional(),
    instrumentType: z.string().optional(),
    name: z.string().optional(),
    uid: z.string().optional(),
    positionUid: z.string().optional(),
  })
  .passthrough();

export const FindInstrumentResponseSchema = z.object({
  instruments: z.array(FindInstrumentItemSchema),
});

// ─── Dividends ────────────────────────────────────────────────────────────────

export const DividendSchema = z
  .object({
    dividendNet: MoneyValueSchema.optional(),
    paymentDate: z.string().optional(),
    declaredDate: z.string().optional(),
    lastBuyDate: z.string().optional(),
    dividendType: z.string().optional(),
    recordDate: z.string().optional(),
    regularity: z.string().optional(),
    closePrice: MoneyValueSchema.optional(),
    yieldValue: QuotationSchema.optional(),
    createdAt: z.string().optional(),
  })
  .passthrough();

export const GetDividendsResponseSchema = z.object({
  dividends: z.array(DividendSchema),
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type MoneyValue = z.infer<typeof MoneyValueSchema>;
export type Quotation = z.infer<typeof QuotationSchema>;
export type Account = z.infer<typeof AccountSchema>;
export type UserInfoResponse = z.infer<typeof UserInfoResponseSchema>;
export type PortfolioPosition = z.infer<typeof PortfolioPositionSchema>;
export type PortfolioResponse = z.infer<typeof PortfolioResponseSchema>;
export type PositionsResponse = z.infer<typeof PositionsResponseSchema>;
export type Operation = z.infer<typeof OperationSchema>;
export type LastPrice = z.infer<typeof LastPriceSchema>;
export type Candle = z.infer<typeof CandleSchema>;
export type Instrument = z.infer<typeof InstrumentSchema>;
export type FindInstrumentItem = z.infer<typeof FindInstrumentItemSchema>;
export type Dividend = z.infer<typeof DividendSchema>;
