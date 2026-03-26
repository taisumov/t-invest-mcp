import express, { type NextFunction, type Request, type Response } from 'express';
import { ZodError } from 'zod';
import { config } from '../config.js';
import { TinkoffClient } from '../tinkoff/index.js';
import { accountsRouter } from './routes/accounts.js';
import { instrumentsRouter } from './routes/instruments.js';
import { marketRouter } from './routes/market.js';
import { portfolioRouter } from './routes/portfolio.js';

const app = express();
app.use(express.json());

const client = new TinkoffClient(config.TINKOFF_TOKEN);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/accounts', accountsRouter(client));
app.use('/portfolio', portfolioRouter(client));
app.use('/market', marketRouter(client));
app.use('/instruments', instrumentsRouter(client));

// ─── Error handler ────────────────────────────────────────────────────────────

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Ошибка валидации',
      details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
    return;
  }

  const message = err instanceof Error ? err.message : String(err);
  res.status(500).json({ error: message });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(config.PORT, () => {
  console.log(`Tinkoff Invest REST API → http://localhost:${config.PORT}`);
  console.log('');
  console.log('Маршруты:');
  console.log('  GET /accounts');
  console.log('  GET /accounts/user');
  console.log('  GET /portfolio/:accountId?currency=RUB');
  console.log('  GET /portfolio/positions/:accountId');
  console.log('  GET /portfolio/operations/:accountId?from=&to=');
  console.log('  GET /market/prices?figi=');
  console.log('  GET /market/candles/:figi?from=&to=&interval=');
  console.log('  GET /instruments/:figi');
  console.log('  GET /instruments/search?q=');
  console.log('  GET /instruments/:figi/dividends?from=&to=');
});
