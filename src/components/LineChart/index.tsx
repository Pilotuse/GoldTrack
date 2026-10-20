import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import type { PricePoint } from '@/mock/markets';

type LineChartProps = {
  data: PricePoint[];
  width: number;
  height?: number;
  color?: string;
  xAxis?: 'date' | 'time';
  gradientId?: string;
  valueFormat?: 'price' | 'signed';
};

const PADDING = { top: 16, right: 12, bottom: 28, left: 48 };

function formatAxisPrice(value: number, valueFormat: 'price' | 'signed') {
  const abs = Math.abs(value);
  const text = abs >= 100 ? abs.toFixed(0) : abs.toFixed(2);
  if (valueFormat === 'signed') {
    if (value > 0) return `+${text}`;
    if (value < 0) return `-${text}`;
    return '0';
  }
  return value >= 0 ? text : `-${text}`;
}

function formatAxisLabel(time: string, xAxis: 'date' | 'time') {
  if (xAxis === 'time') {
    const clock = time.split(' ')[1] ?? time;
    return clock.slice(0, 5);
  }
  return time.slice(5, 10);
}

export default function LineChart({
  data,
  width,
  height = 220,
  color = '#C9A227',
  xAxis = 'date',
  gradientId = 'chartFill',
  valueFormat = 'price',
}: LineChartProps) {
  const chart = useMemo(() => {
    if (!data.length || width <= 0) return null;

    const prices = data.map((item) => item.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const paddedMin = min - range * 0.08;
    const paddedMax = max + range * 0.08;
    const paddedRange = paddedMax - paddedMin;
    const leftPad = valueFormat === 'signed' ? 56 : PADDING.left;
    const innerWidth = width - leftPad - PADDING.right;
    const innerHeight = height - PADDING.top - PADDING.bottom;

    const zeroY =
      paddedMin < 0 && paddedMax > 0
        ? PADDING.top + (1 - (0 - paddedMin) / paddedRange) * innerHeight
        : null;

    const coords = data.map((item, index) => {
      const x =
        leftPad +
        (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
      const y =
        PADDING.top + (1 - (item.price - paddedMin) / paddedRange) * innerHeight;
      return { x, y, ...item };
    });

    const line = coords
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
    const last = coords[coords.length - 1];
    const first = coords[0];
    const area = `${line} L ${last.x} ${PADDING.top + innerHeight} L ${first.x} ${PADDING.top + innerHeight} Z`;

    const ticks = [0, 0.5, 1].map((ratio) => {
      const value = paddedMax - paddedRange * ratio;
      const y = PADDING.top + innerHeight * ratio;
      return { value, y };
    });

    const xLabels = [0, Math.floor((coords.length - 1) / 2), coords.length - 1]
      .filter((index, i, arr) => arr.indexOf(index) === i)
      .map((index) => coords[index]);

    return { line, area, coords, ticks, xLabels, last, leftPad, zeroY };
  }, [data, height, width, valueFormat]);

  if (!chart) {
    return <View style={{ width, height }} />;
  }

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.28" />
            <Stop offset="1" stopColor={color} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {chart.ticks.map((tick) => (
          <Line
            key={tick.y}
            x1={chart.leftPad}
            y1={tick.y}
            x2={width - PADDING.right}
            y2={tick.y}
            stroke="rgba(0,0,0,0.08)"
            strokeDasharray="4 6"
          />
        ))}

        {chart.ticks.map((tick) => (
          <SvgText
            key={`label-${tick.y}`}
            x={chart.leftPad - 8}
            y={tick.y + 4}
            fontSize={11}
            fill="#8E8E93"
            textAnchor="end"
          >
            {formatAxisPrice(tick.value, valueFormat)}
          </SvgText>
        ))}

        {chart.zeroY != null ? (
          <Line
            x1={chart.leftPad}
            y1={chart.zeroY}
            x2={width - PADDING.right}
            y2={chart.zeroY}
            stroke="rgba(0,0,0,0.18)"
            strokeDasharray="3 5"
          />
        ) : null}

        <Path d={chart.area} fill={`url(#${gradientId})`} />
        <Path d={chart.line} stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />

        <Circle cx={chart.last.x} cy={chart.last.y} r={5} fill="#fff" stroke={color} strokeWidth={2.2} />

        {chart.xLabels.map((point) => (
          <SvgText
            key={point.time}
            x={point.x}
            y={height - 8}
            fontSize={11}
            fill="#8E8E93"
            textAnchor="middle"
          >
            {formatAxisLabel(point.time, xAxis)}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
