import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

type SparklineProps = {
  data: number[];
  color: string;
  width: number;
  height?: number;
  gradientId: string;
};

export default function Sparkline({
  data,
  color,
  width,
  height = 36,
  gradientId,
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2 || width <= 0) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padY = 3;
    const innerHeight = height - padY * 2;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = padY + (1 - (value - min) / range) * innerHeight;
      return { x, y };
    });

    const line = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
    const last = points[points.length - 1];
    const first = points[0];
    const area = `${line} L ${last.x} ${height} L ${first.x} ${height} Z`;

    return { line, area };
  }, [data, height, width]);

  if (!path) {
    return <View style={{ width, height }} />;
  }

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.28" />
          <Stop offset="1" stopColor={color} stopOpacity="0.02" />
        </LinearGradient>
      </Defs>
      <Path d={path.area} fill={`url(#${gradientId})`} />
      <Path
        d={path.line}
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
