export type ProductType = 'gold' | 'etf' | 'physical' | 'futures';

export type PricePoint = {
  time: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  code: string;
  type: ProductType;
  unit: string;
  history: PricePoint[];
};

function seeded(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function formatDate(offset: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - offset);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function generateHistory(base: number, days: number, seed: number, volatility: number) {
  const points: PricePoint[] = [];
  let price = base;

  for (let i = days; i >= 0; i -= 1) {
    const n = seeded(seed * 17 + i * 13);
    price = Math.max(price * (1 + (n - 0.46) * volatility), base * 0.82);
    points.push({
      time: formatDate(i),
      price: Number(price.toFixed(2)),
    });
  }

  return points;
}

export const products: Product[] = [
  {
    id: 'icbc-gold',
    name: '工商银行积存金',
    code: 'ICBC',
    type: 'gold',
    unit: '元/克',
    history: generateHistory(868.4, 30, 11, 0.018),
  },
  {
    id: 'ccb-gold',
    name: '建设银行积存金',
    code: 'CCB',
    type: 'gold',
    unit: '元/克',
    history: generateHistory(867.9, 30, 23, 0.017),
  },
  {
    id: 'boc-gold',
    name: '中国银行积存金',
    code: 'BOC',
    type: 'gold',
    unit: '元/克',
    history: generateHistory(869.2, 30, 37, 0.016),
  },
  {
    id: 'abc-gold',
    name: '农业银行积存金',
    code: 'ABC',
    type: 'gold',
    unit: '元/克',
    history: generateHistory(866.5, 30, 41, 0.019),
  },
  {
    id: 'cmb-gold',
    name: '招商银行积存金',
    code: 'CMB',
    type: 'gold',
    unit: '元/克',
    history: generateHistory(870.1, 30, 53, 0.015),
  },
  {
    id: 'huaan-etf',
    name: '华安黄金 ETF',
    code: '518880',
    type: 'etf',
    unit: '元',
    history: generateHistory(5.82, 30, 61, 0.021),
  },
  {
    id: 'bosera-etf',
    name: '博时黄金 ETF',
    code: '159937',
    type: 'etf',
    unit: '元',
    history: generateHistory(5.76, 30, 71, 0.02),
  },
  {
    id: 'efund-etf',
    name: '易方达黄金 ETF',
    code: '159934',
    type: 'etf',
    unit: '元',
    history: generateHistory(5.69, 30, 83, 0.022),
  },
  {
    id: 'gtja-etf',
    name: '国泰黄金 ETF',
    code: '518800',
    type: 'etf',
    unit: '元',
    history: generateHistory(5.88, 30, 97, 0.019),
  },
  {
    id: 'chinaamc-etf',
    name: '华夏黄金 ETF',
    code: '518850',
    type: 'etf',
    unit: '元',
    history: generateHistory(5.74, 30, 103, 0.018),
  },
  {
    id: 'bar-9999',
    name: '投资金条 AU9999',
    code: 'BAR9999',
    type: 'physical',
    unit: '元/克',
    history: generateHistory(881.2, 30, 113, 0.016),
  },
  {
    id: 'coin-panda',
    name: '熊猫金币',
    code: 'PANDA',
    type: 'physical',
    unit: '元/克',
    history: generateHistory(892.6, 30, 127, 0.017),
  },
  {
    id: 'jewelry-999',
    name: '首饰金 AU999',
    code: 'JEWEL',
    type: 'physical',
    unit: '元/克',
    history: generateHistory(868.8, 30, 131, 0.015),
  },
  {
    id: 'shfe-au',
    name: '沪金主连',
    code: 'AU0',
    type: 'futures',
    unit: '元/克',
    history: generateHistory(879.4, 30, 149, 0.022),
  },
  {
    id: 'sge-tplusd',
    name: '黄金 T+D',
    code: 'Au(T+D)',
    type: 'futures',
    unit: '元/克',
    history: generateHistory(876.8, 30, 157, 0.02),
  },
  {
    id: 'comex-gc',
    name: 'COMEX 黄金',
    code: 'GC',
    type: 'futures',
    unit: '美元/盎司',
    history: generateHistory(3848.6, 30, 163, 0.019),
  },
  {
    id: 'icbc-etf',
    name: '工银黄金 ETF',
    code: '518600',
    type: 'etf',
    unit: '元',
    history: generateHistory(5.71, 30, 173, 0.02),
  },
  {
    id: 'gold-note',
    name: '贺岁金钞',
    code: 'NOTE',
    type: 'physical',
    unit: '元/克',
    history: generateHistory(888.4, 30, 181, 0.016),
  },
  {
    id: 'mini-au',
    name: '迷你黄金期货',
    code: 'mAU',
    type: 'futures',
    unit: '元/克',
    history: generateHistory(877.2, 30, 191, 0.021),
  },
];

export function getProductById(id: string) {
  return products.find((item) => item.id === id);
}

export function getProductsByType(type: ProductType) {
  return products.filter((item) => item.type === type);
}

export function getLatestPrice(product: Product) {
  return product.history[product.history.length - 1]?.price ?? 0;
}

export function getChange(product: Product, days = 1) {
  const latest = getLatestPrice(product);
  const previous = product.history[product.history.length - 1 - days]?.price ?? latest;
  const amount = latest - previous;
  const percent = previous === 0 ? 0 : (amount / previous) * 100;

  return {
    amount: Number(amount.toFixed(2)),
    percent: Number(percent.toFixed(2)),
    isUp: amount >= 0,
  };
}

export function getRangeStats(points: PricePoint[]) {
  const prices = points.map((item) => item.price);
  const latest = prices[prices.length - 1] ?? 0;
  const first = prices[0] ?? latest;
  const high = prices.length ? Math.max(...prices) : 0;
  const low = prices.length ? Math.min(...prices) : 0;
  const change = latest - first;
  const percent = first === 0 ? 0 : (change / first) * 100;

  return {
    latest,
    high,
    low,
    change: Number(change.toFixed(2)),
    percent: Number(percent.toFixed(2)),
    isUp: change >= 0,
  };
}
