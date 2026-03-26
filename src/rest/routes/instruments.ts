import { Router } from 'express';
import { z } from 'zod';
import type { TinkoffClient } from '../../tinkoff/index.js';

const SearchQuerySchema = z.object({
  q: z.string({ required_error: 'Параметр q обязателен (тикер или название)' }).min(1),
});

const DividendsQuerySchema = z.object({
  from: z.string({ required_error: 'Параметр from обязателен (ISO 8601)' }),
  to: z.string({ required_error: 'Параметр to обязателен (ISO 8601)' }),
});

export function instrumentsRouter(client: TinkoffClient): Router {
  const router = Router();

  // GET /instruments/search?q=SBER
  router.get('/search', async (req, res, next) => {
    try {
      const { q } = SearchQuerySchema.parse(req.query);
      res.json(await client.findInstrument(q));
    } catch (e) {
      next(e);
    }
  });

  // GET /instruments/:figi/dividends?from=...&to=...
  router.get('/:figi/dividends', async (req, res, next) => {
    try {
      const { from, to } = DividendsQuerySchema.parse(req.query);
      res.json(await client.getDividends(req.params.figi, from, to));
    } catch (e) {
      next(e);
    }
  });

  // GET /instruments/:figi
  router.get('/:figi', async (req, res, next) => {
    try {
      res.json(await client.getInstrumentByFigi(req.params.figi));
    } catch (e) {
      next(e);
    }
  });

  return router;
}
