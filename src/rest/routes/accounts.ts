import { Router } from 'express';
import type { TinkoffClient } from '../../tinkoff/index.js';

export function accountsRouter(client: TinkoffClient): Router {
  const router = Router();

  // GET /accounts
  router.get('/', async (_req, res, next) => {
    try {
      res.json(await client.getAccounts());
    } catch (e) {
      next(e);
    }
  });

  // GET /user
  router.get('/user', async (_req, res, next) => {
    try {
      res.json(await client.getUserInfo());
    } catch (e) {
      next(e);
    }
  });

  return router;
}
