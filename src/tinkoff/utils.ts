import type {
  MoneyValue,
  Operation,
  PortfolioPosition,
  PortfolioResponse,
  Quotation,
} from './schemas.js';

function unitsToNumber(units: string, nano: number): number {
  const sign = units.startsWith('-') || nano < 0 ? -1 : 1;
  const absUnits = Math.abs(Number(units));
  const absNano = Math.abs(nano) / 1_000_000_000;
  return sign * (absUnits + absNano);
}

export function quotationToNumber(value?: Quotation): number | null {
  if (!value) {
    return null;
  }

  return unitsToNumber(value.units, value.nano);
}

export function moneyValueToNumber(value?: MoneyValue): number | null {
  if (!value) {
    return null;
  }

  return unitsToNumber(value.units, value.nano);
}

export function formatNumber(value: number | null | undefined, fractionDigits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'n/a';
  }

  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatMoney(value?: MoneyValue): string {
  if (!value) {
    return 'n/a';
  }

  return `${formatNumber(moneyValueToNumber(value))} ${value.currency}`;
}

type PortfolioSummaryItem = {
  figi: string;
  instrumentType: string;
  quantity: number | null;
  currentPrice: number | null;
  expectedYield: number | null;
};

export function summarizePortfolio(portfolio: PortfolioResponse): {
  text: string;
  metrics: Record<string, unknown>;
} {
  const topPositions: PortfolioSummaryItem[] = [...portfolio.positions]
    .map((position: PortfolioPosition) => ({
      figi: position.figi,
      instrumentType: position.instrumentType,
      quantity: quotationToNumber(position.quantity),
      currentPrice: moneyValueToNumber(position.currentPrice),
      expectedYield: quotationToNumber(position.expectedYield),
    }))
    .sort((a, b) => Math.abs(b.expectedYield ?? 0) - Math.abs(a.expectedYield ?? 0))
    .slice(0, 5);

  const text = [
    `Портфель: ${formatMoney(portfolio.totalAmountPortfolio)}`,
    `Ожидаемая доходность: ${formatNumber(quotationToNumber(portfolio.expectedYield))}`,
    `Позиций: ${portfolio.positions.length}`,
    `Топ позиций по абсолютной доходности: ${
      topPositions.length > 0
        ? topPositions
            .map((item) => `${item.figi} (${formatNumber(item.expectedYield)})`)
            .join(', ')
        : 'нет данных'
    }`,
  ].join('\n');

  return {
    text,
    metrics: {
      totalAmountPortfolio: moneyValueToNumber(portfolio.totalAmountPortfolio),
      totalCurrency: portfolio.totalAmountPortfolio?.currency ?? null,
      expectedYield: quotationToNumber(portfolio.expectedYield),
      positionsCount: portfolio.positions.length,
      topPositions,
    },
  };
}

function operationPaymentToNumber(operation: Operation): number {
  return moneyValueToNumber(operation.payment) ?? 0;
}

export function summarizeOperations(operations: Operation[]): {
  text: string;
  metrics: Record<string, unknown>;
} {
  const byType = new Map<string, number>();
  let netPayment = 0;

  for (const operation of operations) {
    byType.set(operation.type, (byType.get(operation.type) ?? 0) + 1);
    netPayment += operationPaymentToNumber(operation);
  }

  const topTypes = [...byType.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }));

  const sortedByDate = [...operations].sort((a, b) => a.date.localeCompare(b.date));
  const firstDate = sortedByDate[0]?.date ?? null;
  const lastDate = sortedByDate.at(-1)?.date ?? null;
  const currency =
    operations.find((operation) => operation.payment?.currency)?.payment?.currency ??
    operations.find((operation) => operation.currency)?.currency ??
    null;

  const text = [
    `Операций: ${operations.length}`,
    `Период: ${firstDate ?? 'n/a'} -> ${lastDate ?? 'n/a'}`,
    `Суммарный net cashflow: ${formatNumber(netPayment)}${currency ? ` ${currency}` : ''}`,
    `Частые типы: ${
      topTypes.length > 0 ? topTypes.map((item) => `${item.type} (${item.count})`).join(', ') : 'нет данных'
    }`,
  ].join('\n');

  return {
    text,
    metrics: {
      count: operations.length,
      firstDate,
      lastDate,
      netPayment,
      currency,
      topTypes,
    },
  };
}
