export type AssetKey = 'etf' | 'physical' | 'accumulate' | 'futures';

export type AssetItem = {
  key: AssetKey;
  name: string;
  amount: number;
  changePercent: number;
  profitTrend: number[];
};

function seeded(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateProfitTrend(endPercent: number, seed: number, days = 14) {
  const points: number[] = [0];
  let value = 0;

  for (let i = 1; i < days - 1; i += 1) {
    const n = seeded(seed * 17 + i * 9);
    value += (n - 0.48) * 0.42;
    points.push(Number(value.toFixed(3)));
  }

  points.push(endPercent);
  return points;
}

export type Profile = {
  nickname: string;
  userId: string;
  avatarInitial: string;
  avatarUri: string | null;
  gender: string;
  city: string;
  joinedAt: string;
  bio: string;
};

export type ProfileField = Exclude<keyof Profile, 'userId' | 'avatarUri' | 'joinedAt' | 'bio'>;

export const profile: Profile = {
  nickname: '金小明',
  userId: '88291037',
  avatarInitial: '金',
  avatarUri: null,
  gender: '男',
  city: '上海',
  joinedAt: '2024.03.18',
  bio: '关注黄金与ETF，慢慢存',
};

export const favorites = [
  { id: 'icbc-gold', name: '工商银行积存金', code: 'ICBC' },
  { id: 'huaan-etf', name: '华安黄金 ETF', code: '518880' },
  { id: 'bar-9999', name: '投资金条 AU9999', code: 'BAR9999' },
];

export const assets: AssetItem[] = [
  { key: 'etf', name: 'ETF', amount: 12480.32, changePercent: 0.86, profitTrend: generateProfitTrend(0.86, 11) },
  { key: 'physical', name: '实体黄金', amount: 8650.0, changePercent: 0.42, profitTrend: generateProfitTrend(0.42, 23) },
  { key: 'accumulate', name: '积存金', amount: 36200.18, changePercent: 1.16, profitTrend: generateProfitTrend(1.16, 37) },
  { key: 'futures', name: '期货', amount: 5320.5, changePercent: -0.38, profitTrend: generateProfitTrend(-0.38, 41) },
];

export function getTotalAssets(list: AssetItem[] = assets) {
  const amount = list.reduce((sum, item) => sum + item.amount, 0);
  const weighted = list.reduce((sum, item) => sum + item.amount * item.changePercent, 0);
  const changePercent = amount === 0 ? 0 : weighted / amount;
  const changeAmount = list.reduce(
    (sum, item) => sum + getChangeAmount(item.amount, item.changePercent),
    0,
  );

  return {
    amount: Number(amount.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    changeAmount: Number(changeAmount.toFixed(2)),
    isUp: changePercent >= 0,
  };
}

export function getDailyReview(list: AssetItem[] = assets) {
  const total = getTotalAssets(list);
  const inflow = 800;
  const outflow = 200;
  const yesterday = Number((total.amount - total.changeAmount - inflow + outflow).toFixed(2));
  const ranked = [...list]
    .map((item) => ({
      name: item.name,
      changeAmount: getChangeAmount(item.amount, item.changePercent),
    }))
    .sort((a, b) => b.changeAmount - a.changeAmount);

  return {
    yesterday,
    inflow,
    outflow,
    profit: total.changeAmount,
    profitIsUp: total.changeAmount >= 0,
    best: ranked[0],
    worst: ranked[ranked.length - 1],
  };
}

export function getChangeAmount(amount: number, changePercent: number) {
  const previous = amount / (1 + changePercent / 100);
  return Number((amount - previous).toFixed(2));
}

export function formatCny(value: number) {
  return Math.abs(value).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatSignedCny(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${formatCny(value)}`;
}
