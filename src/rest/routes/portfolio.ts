import { Router } from 'express';
import { z } from 'zod';
import type { TinkoffClient, PortfolioCurrency } from '../../tinkoff/index.js';

const PortfolioQuerySchema = z.object({
  currency: z.enum(['RUB', 'USD', 'EUR']).default('RUB'),
});

const OperationsQuerySchema = z.object({
  from: z.string({ required_error: 'Параметр from обязателен (ISO 8601)' }),
  to: z.string({ required_error: 'Параметр to обязателен (ISO 8601)' }),
});

export function portfolioRouter(client: TinkoffClient): Router {
  const router = Router();

  // GET /positions/:accountId
  router.get('/positions/:accountId', async (req, res, next) => {
    try {
      res.json(await client.getPositions(req.params.accountId));
    } catch (e) {
      next(e);
    }
  });

  // GET /operations/:accountId?from=2024-01-01T00:00:00Z&to=2024-12-31T23:59:59Z
  router.get('/operations/:accountId', async (req, res, next) => {
    try {
      const { from, to } = OperationsQuerySchema.parse(req.query);
      res.json(await client.getOperations(req.params.accountId, from, to));
    } catch (e) {
      next(e);
    }
  });

  // GET /portfolio/:accountId?currency=RUB
  router.get('/:accountId', async (req, res, next) => {
    try {
      const { currency } = PortfolioQuerySchema.parse(req.query);
      res.json(await client.getPortfolio(req.params.accountId, currency as PortfolioCurrency));
    } catch (e) {
      next(e);
    }
  });

  return router;
}
