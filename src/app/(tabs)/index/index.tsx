import LineChart from '@/components/LineChart';
import { trendBg, trendColor } from '@/constants/base';
import { getRangeStats, type PricePoint } from '@/mock/markets';
import { spotMarkets, tickLastPrice, usdToCny } from '@/mock/spots';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type SpotCardProps = {
  name: string;
  unit: string;
  quoteInUsd?: boolean;
  gradientId: string;
  data: PricePoint[];
};

function SpotCard({ name, unit, quoteInUsd, gradientId, data }: SpotCardProps) {
  const [chartWidth, setChartWidth] = useState(0);
  const stats = useMemo(() => getRangeStats(data), [data]);
  const changeColor = trendColor(stats.isUp);

  return (
    <View style={style.section}>
      <View style={style.section_title}>
        <Text style={style.section_title_source}>{name}</Text>
        <View
          style={[
            style.trendTag,
            { backgroundColor: trendBg(stats.isUp) },
          ]}
        >
          <Text style={[style.section_trend, { color: changeColor }]}>
            {stats.isUp ? '+' : ''}
            {stats.percent.toFixed(2)}%
          </Text>
        </View>
      </View>

      <View style={style.glassCardWrapper}>
        <BlurView intensity={30} tint="light" style={style.glassCard}>
          <Text style={[style.price, { color: changeColor }]}>{stats.latest.toFixed(2)}</Text>
          <Text style={style.unit}>{unit}</Text>

          <View
            style={style.chartBox}
            onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
          >
            {chartWidth > 0 && (
              <LineChart
                data={data}
                width={chartWidth}
                height={168}
                color={changeColor}
                xAxis="time"
                gradientId={gradientId}
              />
            )}
          </View>

          <View style={style.statsRow}>
            <View style={style.stat}>
              <Text style={style.statLabel}>当日最高</Text>
              <Text style={style.statValue}>{stats.high.toFixed(2)}</Text>
              {quoteInUsd && (
                <Text style={style.localQuote}>≈ {usdToCny(stats.high).toFixed(2)} 元</Text>
              )}
            </View>
            <View style={style.stat}>
              <Text style={style.statLabel}>当日最低</Text>
              <Text style={style.statValue}>{stats.low.toFixed(2)}</Text>
              {quoteInUsd && (
                <Text style={style.localQuote}>≈ {usdToCny(stats.low).toFixed(2)} 元</Text>
              )}
            </View>
            <View style={style.stat}>
              <Text style={style.statLabel}>涨跌额</Text>
              <Text style={[style.statValue, { color: changeColor }]}>
                {stats.isUp ? '+' : ''}
                {stats.change.toFixed(2)}
              </Text>
              {quoteInUsd && (
                <Text style={style.localQuote}>
                  ≈ {usdToCny(stats.change) >= 0 ? '+' : ''}
                  {usdToCny(stats.change).toFixed(2)} 元
                </Text>
              )}
            </View>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

export default function index() {
  const insets = useSafeAreaInsets();
  const bottomPad = insets.bottom + 88;
  const [series, setSeries] = useState(() =>
    spotMarkets.map((item) => ({ id: item.id, history: item.history })),
  );

  useEffect(() => {
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      setSeries((prev) =>
        prev.map((item) => {
          const meta = spotMarkets.find((spot) => spot.id === item.id);
          return {
            ...item,
            history: tickLastPrice(item.history, meta?.seed ?? 1, step),
          };
        }),
      );
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#EBC688', '#F5F5F7']}
      locations={[0, 0.5]}
      style={style.gradientContainer}
    >
      <SafeAreaView style={style.safeContainer} edges={['top']}>
        <ScrollView
          contentContainerStyle={[style.scrollContent, { paddingBottom: bottomPad }]}
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
        >
          {spotMarkets.map((spot) => {
            const current = series.find((item) => item.id === spot.id);
            return (
              <SpotCard
                key={spot.id}
                name={spot.name}
                unit={spot.unit}
                quoteInUsd={spot.quoteInUsd}
                gradientId={`fill-${spot.id}`}
                data={current?.history ?? spot.history}
              />
            );
          })}

          <View style={style.footer}>
            <Text style={style.footerText}>交易有风险，投资需谨慎</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const style = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  section_title: {
    marginBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section_title_source: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1D1D1F',
    letterSpacing: -0.3,
  },
  trendTag: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  section_trend: {
    fontSize: 13,
    fontWeight: '600',
  },
  glassCardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  glassCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.4,
  },
  unit: {
    marginTop: 2,
    fontSize: 12,
    color: '#8E8E93',
  },
  localQuote: {
    marginTop: 3,
    fontSize: 11,
    color: '#8E8E93',
  },
  chartBox: {
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.3)',
    letterSpacing: 0.5,
  },
});
