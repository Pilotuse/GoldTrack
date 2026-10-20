import { getRangeStats, type PricePoint } from '@/mock/markets';

function seeded(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function formatDateTime(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function generateIntraday(
  base: number,
  seed: number,
  volatility: number,
  intervalMinutes = 5,
): PricePoint[] {
  const now = new Date();
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  const points: PricePoint[] = [];
  let price = base;
  let index = 0;

  while (cursor.getTime() <= now.getTime()) {
    const n = seeded(seed * 19 + index * 7);
    price = Math.max(price * (1 + (n - 0.48) * volatility), base * 0.97);
    points.push({
      time: formatDateTime(cursor),
      price: Number(price.toFixed(2)),
    });
    cursor.setMinutes(cursor.getMinutes() + intervalMinutes);
    index += 1;
  }

  const nowLabel = formatDateTime(now);
  if (!points.length || points[points.length - 1].time !== nowLabel) {
    const n = seeded(seed * 19 + index * 7);
    price = Math.max(price * (1 + (n - 0.48) * volatility), base * 0.97);
    points.push({
      time: nowLabel,
      price: Number(price.toFixed(2)),
    });
  }

  return points;
}

export function tickLastPrice(points: PricePoint[], seed: number, step: number): PricePoint[] {
  if (!points.length) return points;

  const last = points[points.length - 1];
  const n = seeded(seed * 31 + step * 11);
  const next = Math.max(last.price * (1 + (n - 0.5) * 0.0014), last.price * 0.994);

  return [
    ...points.slice(0, -1),
    {
      ...last,
      time: formatDateTime(new Date()),
      price: Number(next.toFixed(2)),
    },
  ];
}

export const USD_CNY = 7.18;

export function usdToCny(usd: number) {
  return Number((usd * USD_CNY).toFixed(2));
}

export const spotMarkets = [
  {
    id: 'london',
    name: '伦敦金',
    unit: '美元/盎司',
    quoteInUsd: true,
    color: '#C9A227',
    seed: 11,
    history: generateIntraday(3846.2, 11, 0.0048),
  },
  {
    id: 'cny999',
    name: 'AU9999',
    unit: '元/克',
    quoteInUsd: false,
    color: '#1678FF',
    seed: 29,
    history: generateIntraday(881.6, 29, 0.0042),
  },
] as const;

export { getRangeStats };
