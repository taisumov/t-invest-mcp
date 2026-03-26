import { Router } from 'express';
import { z } from 'zod';
import type { TinkoffClient, CandleInterval } from '../../tinkoff/index.js';

const PricesQuerySchema = z.object({
  figi: z.union([z.string(), z.array(z.string())]).transform((v) => (Array.isArray(v) ? v : [v])),
});

const CandlesQuerySchema = z.object({
  from: z.string({ required_error: 'Параметр from обязателен (ISO 8601)' }),
  to: z.string({ required_error: 'Параметр to обязателен (ISO 8601)' }),
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
});

export function marketRouter(client: TinkoffClient): Router {
  const router = Router();

  // GET /market/prices?figi=BBG000B9XRY4&figi=BBG004730N88
  router.get('/prices', async (req, res, next) => {
    try {
      const { figi } = PricesQuerySchema.parse(req.query);
      res.json(await client.getLastPrices(figi));
    } catch (e) {
      next(e);
    }
  });

  // GET /market/candles/:figi?from=...&to=...&interval=CANDLE_INTERVAL_DAY
  router.get('/candles/:figi', async (req, res, next) => {
    try {
      const { from, to, interval } = CandlesQuerySchema.parse(req.query);
      res.json(await client.getCandles(req.params.figi, from, to, interval as CandleInterval));
    } catch (e) {
      next(e);
    }
  });

  return router;
}
