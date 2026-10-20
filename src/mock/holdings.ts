import {
  getChange,
  getLatestPrice,
  getProductById,
  type PricePoint,
  type Product,
  type ProductType,
} from '@/mock/markets';
import {
  formatCny,
  formatSignedCny,
  generateProfitTrend,
  getChangeAmount,
  type AssetItem,
  type AssetKey,
} from '@/mock/profile';

export type HoldingLot = {
  id: string;
  productId: string;
  shares: number;
  costPrice: number;
  boughtAt: number;
};

export type HoldingsState = Record<AssetKey, HoldingLot[]>;

function daysAgo(days: number) {
  const date = new Date();
  date.setHours(10, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.getTime();
}

export const etfHoldings: HoldingLot[] = [
  { id: 'lot-huaan-1', productId: 'huaan-etf', shares: 500, costPrice: 5.48, boughtAt: daysAgo(48) },
  { id: 'lot-huaan-2', productId: 'huaan-etf', shares: 300, costPrice: 5.85, boughtAt: daysAgo(16) },
  { id: 'lot-bosera-1', productId: 'bosera-etf', shares: 620, costPrice: 5.91, boughtAt: daysAgo(32) },
  { id: 'lot-efund-1', productId: 'efund-etf', shares: 200, costPrice: 5.42, boughtAt: daysAgo(40) },
  { id: 'lot-efund-2', productId: 'efund-etf', shares: 250, costPrice: 5.66, boughtAt: daysAgo(12) },
  { id: 'lot-gtja-1', productId: 'gtja-etf', shares: 280, costPrice: 5.74, boughtAt: daysAgo(21) },
  { id: 'lot-chinaamc-1', productId: 'chinaamc-etf', shares: 160, costPrice: 5.81, boughtAt: daysAgo(9) },
];

export const accumulateHoldings: HoldingLot[] = [
  { id: 'lot-icbc-1', productId: 'icbc-gold', shares: 10, costPrice: 828.4, boughtAt: daysAgo(52) },
  { id: 'lot-icbc-2', productId: 'icbc-gold', shares: 5.6, costPrice: 856.2, boughtAt: daysAgo(19) },
  { id: 'lot-icbc-3', productId: 'icbc-gold', shares: 3, costPrice: 868.1, boughtAt: daysAgo(5) },
  { id: 'lot-ccb-1', productId: 'ccb-gold', shares: 12.4, costPrice: 851.6, boughtAt: daysAgo(28) },
  { id: 'lot-boc-1', productId: 'boc-gold', shares: 6.8, costPrice: 860.1, boughtAt: daysAgo(14) },
  { id: 'lot-cmb-1', productId: 'cmb-gold', shares: 4.2, costPrice: 855.4, boughtAt: daysAgo(8) },
];

export const physicalHoldings: HoldingLot[] = [
  { id: 'lot-bar-1', productId: 'bar-9999', shares: 3, costPrice: 848.0, boughtAt: daysAgo(41) },
  { id: 'lot-bar-2', productId: 'bar-9999', shares: 2, costPrice: 871.5, boughtAt: daysAgo(18) },
  { id: 'lot-bar-3', productId: 'bar-9999', shares: 1, costPrice: 862.0, boughtAt: daysAgo(6) },
  { id: 'lot-panda-1', productId: 'coin-panda', shares: 2.5, costPrice: 878.5, boughtAt: daysAgo(24) },
  { id: 'lot-jewel-1', productId: 'jewelry-999', shares: 1.2, costPrice: 849.0, boughtAt: daysAgo(11) },
];

export const futuresHoldings: HoldingLot[] = [
  { id: 'lot-shfe-1', productId: 'shfe-au', shares: 2, costPrice: 868.4, boughtAt: daysAgo(15) },
  { id: 'lot-td-1', productId: 'sge-tplusd', shares: 1, costPrice: 871.2, boughtAt: daysAgo(7) },
  { id: 'lot-comex-1', productId: 'comex-gc', shares: 1, costPrice: 3796.5, boughtAt: daysAgo(10) },
];

export function createInitialHoldings(): HoldingsState {
  return {
    etf: etfHoldings.map((item) => ({ ...item })),
    physical: physicalHoldings.map((item) => ({ ...item })),
    accumulate: accumulateHoldings.map((item) => ({ ...item })),
    futures: futuresHoldings.map((item) => ({ ...item })),
  };
}

export const productTypeByAsset: Record<AssetKey, 'gold' | 'etf' | 'physical' | 'futures'> = {
  etf: 'etf',
  accumulate: 'gold',
  physical: 'physical',
  futures: 'futures',
};

const defaultShares: Record<AssetKey, number> = {
  etf: 100,
  accumulate: 1,
  physical: 1,
  futures: 1,
};

export function getDefaultShares(type: AssetKey) {
  return defaultShares[type];
}

export function createLotId() {
  return `lot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatLotDate(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

export function getLots(state: HoldingsState, type: AssetKey, productId: string) {
  return state[type]
    .filter((item) => item.productId === productId)
    .slice()
    .sort((a, b) => b.boughtAt - a.boughtAt);
}

export function getHolding(state: HoldingsState, type: AssetKey, productId: string) {
  const lots = getLots(state, type, productId);
  if (lots.length === 0) return undefined;

  const shares = lots.reduce((sum, item) => sum + item.shares, 0);
  const costValue = lots.reduce((sum, item) => sum + item.costPrice * item.shares, 0);

  return {
    productId,
    shares: Number(shares.toFixed(4)),
    costPrice: shares === 0 ? 0 : Number((costValue / shares).toFixed(2)),
    lots,
    lotCount: lots.length,
  };
}

function deriveLot(lot: HoldingLot, product: Product) {
  const price = getLatestPrice(product);
  const change = getChange(product);
  const marketValue = Number((price * lot.shares).toFixed(2));
  const costValue = Number((lot.costPrice * lot.shares).toFixed(2));
  const profit = Number((marketValue - costValue).toFixed(2));
  const profitPercent = costValue === 0 ? 0 : Number(((profit / costValue) * 100).toFixed(2));
  const dayProfit = getChangeAmount(marketValue, change.percent);

  return {
    ...lot,
    product,
    price,
    marketValue,
    costValue,
    profit,
    profitPercent,
    dayChangePercent: change.percent,
    dayProfit,
    isUp: change.isUp,
    profitIsUp: profit >= 0,
  };
}

export function buildProfitHistory(
  history: PricePoint[],
  lots: Pick<HoldingLot, 'shares' | 'costPrice' | 'boughtAt'>[],
): PricePoint[] {
  return history.map((point) => {
    const day = new Date(`${point.time}T23:59:59`).getTime();
    const profit = lots.reduce((sum, lot) => {
      if (lot.boughtAt > day) return sum;
      return sum + (point.price - lot.costPrice) * lot.shares;
    }, 0);

    return {
      time: point.time,
      price: Number(profit.toFixed(2)),
    };
  });
}

export function addLotState(
  state: HoldingsState,
  type: AssetKey,
  productId: string,
  input: { shares: number; costPrice: number; boughtAt?: number },
): HoldingsState {
  return {
    ...state,
    [type]: [
      ...state[type],
      {
        id: createLotId(),
        productId,
        shares: input.shares,
        costPrice: input.costPrice,
        boughtAt: input.boughtAt ?? Date.now(),
      },
    ],
  };
}

export function updateLotState(
  state: HoldingsState,
  type: AssetKey,
  lotId: string,
  input: { shares: number; costPrice: number },
): HoldingsState {
  return {
    ...state,
    [type]: state[type].map((item) =>
      item.id === lotId ? { ...item, shares: input.shares, costPrice: input.costPrice } : item,
    ),
  };
}

export function removeLotState(state: HoldingsState, type: AssetKey, lotId: string): HoldingsState {
  return {
    ...state,
    [type]: state[type].filter((item) => item.id !== lotId),
  };
}

export function removeHoldingState(
  state: HoldingsState,
  type: AssetKey,
  productId: string,
): HoldingsState {
  return {
    ...state,
    [type]: state[type].filter((item) => item.productId !== productId),
  };
}

export const holdingUnit: Record<AssetKey, string> = {
  etf: '份',
  physical: '克',
  accumulate: '克',
  futures: '手',
};

export const holdingTitles: Record<AssetKey, string> = {
  etf: 'ETF资产',
  physical: '实体黄金',
  accumulate: '积存金',
  futures: '期货',
};

export const configTitles: Record<AssetKey, string> = {
  etf: '配置ETF',
  physical: '配置实体黄金',
  accumulate: '配置积存金',
  futures: '配置期货',
};

export function isAssetKey(value: string): value is AssetKey {
  return ['etf', 'physical', 'accumulate', 'futures'].includes(value);
}

export function assetKeyFromProductType(type: ProductType): AssetKey {
  if (type === 'gold') return 'accumulate';
  return type;
}

export function getHoldings(state: HoldingsState, type: AssetKey) {
  const productIds = [...new Set(state[type].map((item) => item.productId))];

  return productIds
    .map((productId) => {
      const product = getProductById(productId);
      const holding = getHolding(state, type, productId);
      if (!product || !holding) return null;

      const lots = holding.lots.map((lot) => deriveLot(lot, product));
      const price = getLatestPrice(product);
      const change = getChange(product);
      const marketValue = Number((price * holding.shares).toFixed(2));
      const costValue = Number((holding.costPrice * holding.shares).toFixed(2));
      const profit = Number((marketValue - costValue).toFixed(2));
      const profitPercent = costValue === 0 ? 0 : Number(((profit / costValue) * 100).toFixed(2));
      const dayProfit = getChangeAmount(marketValue, change.percent);

      return {
        productId,
        shares: holding.shares,
        costPrice: holding.costPrice,
        lotCount: holding.lotCount,
        lots,
        product,
        price,
        marketValue,
        costValue,
        profit,
        profitPercent,
        dayChangePercent: change.percent,
        dayProfit,
        isUp: change.isUp,
        profitIsUp: profit >= 0,
      };
    })
    .filter((item) => item != null);
}

export function getHoldingsSummary(state: HoldingsState, type: AssetKey) {
  const list = getHoldings(state, type);
  const marketValue = list.reduce((sum, item) => sum + item.marketValue, 0);
  const dayProfit = list.reduce((sum, item) => sum + item.dayProfit, 0);
  const profit = list.reduce((sum, item) => sum + item.profit, 0);

  return {
    count: list.length,
    marketValue: Number(marketValue.toFixed(2)),
    dayProfit: Number(dayProfit.toFixed(2)),
    profit: Number(profit.toFixed(2)),
    isUp: dayProfit >= 0,
  };
}

const PORTFOLIO_META: Record<AssetKey, { name: string; trendSeed: number }> = {
  etf: { name: 'ETF', trendSeed: 11 },
  physical: { name: '实体黄金', trendSeed: 23 },
  accumulate: { name: '积存金', trendSeed: 37 },
  futures: { name: '期货', trendSeed: 41 },
};

const PORTFOLIO_ORDER: AssetKey[] = ['etf', 'physical', 'accumulate', 'futures'];

export function getPortfolioAssets(state: HoldingsState): AssetItem[] {
  return PORTFOLIO_ORDER.map((key) => {
    const summary = getHoldingsSummary(state, key);
    const previous = summary.marketValue - summary.dayProfit;
    const changePercent =
      previous === 0 ? 0 : Number(((summary.dayProfit / previous) * 100).toFixed(2));
    const meta = PORTFOLIO_META[key];

    return {
      key,
      name: meta.name,
      amount: summary.marketValue,
      changePercent,
      profitTrend: generateProfitTrend(changePercent, meta.trendSeed),
    };
  });
}

export { formatCny, formatSignedCny };
