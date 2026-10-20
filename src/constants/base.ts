export const Colors = {
  light: {
    text: '#1678FF',
    backgroundColor: 'transparent',

    // 去掉系统默认白色背景
    tabBarBackground: 'transparent',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#A8FE06',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#1678FF',
    backgroundColor: 'transparent',
    backgroundElement: '#fff',
    backgroundSelected: '#fff',
    textSecondary: '#B0B4BA',
  },
} as const;

export const Trend = {
  up: '#FF3B30',
  down: '#34C759',
  upBg: 'rgba(255, 59, 48, 0.12)',
  downBg: 'rgba(52, 199, 89, 0.12)',
} as const;

export function trendColor(isUp: boolean) {
  return isUp ? Trend.up : Trend.down;
}

export function trendBg(isUp: boolean) {
  return isUp ? Trend.upBg : Trend.downBg;
}