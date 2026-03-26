import { z } from 'zod';
import {
  FindInstrumentResponseSchema,
  GetAccountsResponseSchema,
  GetCandlesResponseSchema,
  GetDividendsResponseSchema,
  GetInstrumentResponseSchema,
  GetLastPricesResponseSchema,
  GetOperationsResponseSchema,
  PortfolioResponseSchema,
  PositionsResponseSchema,
  UserInfoResponseSchema,
} from './schemas.js';

const BASE_URL = 'https://invest-public-api.tinkoff.ru/rest';
const SVC = 'tinkoff.public.invest.api.contract.v1';
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(status: number): boolean {
  return status === 429 || status >= 500;
}

export type CandleInterval =
  | 'CANDLE_INTERVAL_1_MIN'
  | 'CANDLE_INTERVAL_5_MIN'
  | 'CANDLE_INTERVAL_15_MIN'
  | 'CANDLE_INTERVAL_HOUR'
  | 'CANDLE_INTERVAL_DAY'
  | 'CANDLE_INTERVAL_WEEK'
  | 'CANDLE_INTERVAL_MONTH';

export type PortfolioCurrency = 'RUB' | 'USD' | 'EUR';

export class TinkoffClient {
  private readonly headers: Record<string, string>;

  constructor(token: string) {
    this.headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async call<T extends z.ZodTypeAny>(
    service: string,
    method: string,
    schema: T,
    body: Record<string, unknown> = {},
  ): Promise<z.infer<T>> {
    const url = `${BASE_URL}/${SVC}.${service}/${method}`;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          if (attempt < MAX_RETRIES && shouldRetry(response.status)) {
            await sleep(300 * (attempt + 1));
            continue;
          }
          throw new Error(`Tinkoff API ${response.status}: ${text}`);
        }

        const json: unknown = await response.json();
        return schema.parse(json);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          if (attempt < MAX_RETRIES) {
            await sleep(300 * (attempt + 1));
            continue;
          }
          throw new Error(`Tinkoff API timeout after ${REQUEST_TIMEOUT_MS}ms`);
        }

        if (attempt < MAX_RETRIES) {
          await sleep(300 * (attempt + 1));
          continue;
        }

        throw error;
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new Error('Tinkoff API request failed after retries');
  }

  getAccounts() {
    return this.call('UsersService', 'GetAccounts', GetAccountsResponseSchema);
  }

  getUserInfo() {
    return this.call('UsersService', 'GetInfo', UserInfoResponseSchema);
  }

  getPortfolio(accountId: string, currency: PortfolioCurrency = 'RUB') {
    return this.call('OperationsService', 'GetPortfolio', PortfolioResponseSchema, {
      accountId,
      currency,
    });
  }

  getPositions(accountId: string) {
    return this.call('OperationsService', 'GetPositions', PositionsResponseSchema, { accountId });
  }

  getOperations(accountId: string, from: string, to: string) {
    return this.call('OperationsService', 'GetOperations', GetOperationsResponseSchema, {
      accountId,
      from,
      to,
      state: 'OPERATION_STATE_EXECUTED',
    });
  }

  getLastPrices(figis: string[]) {
    return this.call('MarketDataService', 'GetLastPrices', GetLastPricesResponseSchema, {
      figi: figis,
    });
  }

  getInstrumentByFigi(figi: string) {
    return this.call('InstrumentsService', 'GetInstrumentBy', GetInstrumentResponseSchema, {
      idType: 'INSTRUMENT_ID_TYPE_FIGI',
      id: figi,
    });
  }

  findInstrument(query: string) {
    return this.call('InstrumentsService', 'FindInstrument', FindInstrumentResponseSchema, {
      query,
    });
  }

  getCandles(figi: string, from: string, to: string, interval: CandleInterval = 'CANDLE_INTERVAL_DAY') {
    return this.call('MarketDataService', 'GetCandles', GetCandlesResponseSchema, {
      figi,
      from,
      to,
      interval,
    });
  }

  getDividends(figi: string, from: string, to: string) {
    return this.call('InstrumentsService', 'GetDividends', GetDividendsResponseSchema, {
      figi,
      from,
      to,
    });
  }
}
