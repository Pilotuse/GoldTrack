import HoldingEditor from '@/components/HoldingEditor';
import LineChart from '@/components/LineChart';
import { trendColor } from '@/constants/base';
import { useHoldingPosition } from '@/hooks/useHoldings';
import {
  buildProfitHistory,
  formatCny,
  formatLotDate,
  formatSignedCny,
  holdingTitles,
  holdingUnit,
  isAssetKey,
  type HoldingLot,
} from '@/mock/holdings';
import { getProductById, getRangeStats } from '@/mock/markets';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RANGES = [
  { key: '7d', label: '7日', days: 7 },
  { key: '30d', label: '30日', days: 30 },
  { key: 'since', label: '累计', days: null },
] as const;

type RangeKey = (typeof RANGES)[number]['key'];

function sliceHistory(
  history: { time: string; price: number }[],
  rangeKey: RangeKey,
  firstBoughtAt?: number,
) {
  if (rangeKey === 'since' && firstBoughtAt) {
    const start = history.findIndex(
      (point) => new Date(`${point.time}T23:59:59`).getTime() >= firstBoughtAt,
    );
    return history.slice(start >= 0 ? start : 0);
  }

  const days = rangeKey === '7d' ? 7 : 30;
  return history.slice(-days - 1);
}

function RangeTabs({
  ranges,
  value,
  onChange,
}: {
  ranges: readonly { key: RangeKey; label: string }[];
  value: RangeKey;
  onChange: (key: RangeKey) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const layouts = useRef<Partial<Record<RangeKey, { x: number; width: number }>>>({});
  const pillX = useRef(new Animated.Value(0)).current;
  const pillW = useRef(new Animated.Value(0)).current;
  const initialized = useRef(false);
  const [ready, setReady] = useState(false);

  const animateTo = (key: RangeKey) => {
    const layout = layouts.current[key];
    if (!layout) return;

    if (!initialized.current) {
      pillX.setValue(layout.x);
      pillW.setValue(layout.width);
      initialized.current = true;
      setReady(true);
      return;
    }

    Animated.parallel([
      Animated.timing(pillX, {
        toValue: layout.x,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(pillW, {
        toValue: layout.width,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    scrollRef.current?.scrollTo({
      x: Math.max(layout.x - 36, 0),
      animated: true,
    });
  };

  useEffect(() => {
    if (!initialized.current) return;
    animateTo(value);
  }, [value]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      alwaysBounceHorizontal
      directionalLockEnabled
      style={styles.rangeScroll}
      contentContainerStyle={styles.rangeScrollContent}
    >
      <View style={styles.rangeGroup}>
        {ready ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.rangePill, { transform: [{ translateX: pillX }], width: pillW }]}
          />
        ) : null}
        {ranges.map((item) => {
          const active = item.key === value;
          return (
            <Pressable
              key={item.key}
              onPress={() => onChange(item.key)}
              onLayout={(event) => {
                const next = {
                  x: event.nativeEvent.layout.x,
                  width: event.nativeEvent.layout.width,
                };
                const prev = layouts.current[item.key];
                if (prev && prev.x === next.x && prev.width === next.width) return;
                layouts.current[item.key] = next;
                if (item.key === value && !initialized.current) {
                  animateTo(item.key);
                }
              }}
              style={styles.rangeBtn}
            >
              <Text
                style={[styles.rangeText, active && styles.rangeTextActive]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

export default function ProductDetail() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const { width } = useWindowDimensions();
  const [rangeKey, setRangeKey] = useState<RangeKey>('30d');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorLot, setEditorLot] = useState<HoldingLot | undefined>();
  const position = useHoldingPosition(id);

  const product = useMemo(() => (id ? getProductById(id) : undefined), [id]);
  const fromHoldings = Boolean(from && isAssetKey(from));
  const holding = fromHoldings ? position?.item : undefined;
  const firstBoughtAt = holding
    ? Math.min(...holding.lots.map((lot) => lot.boughtAt))
    : undefined;
  const ranges = fromHoldings ? RANGES : RANGES.filter((item) => item.key !== 'since');
  const chartData = useMemo(() => {
    if (!product) return [];
    const rangeHistory = sliceHistory(product.history, rangeKey, firstBoughtAt);
    if (fromHoldings && holding) {
      return buildProfitHistory(rangeHistory, holding.lots);
    }
    return rangeHistory;
  }, [product, rangeKey, fromHoldings, holding, firstBoughtAt]);
  const stats = useMemo(() => getRangeStats(chartData), [chartData]);

  if (!product) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: '产品详情' }} />
        <Text style={styles.missingText}>未找到该产品</Text>
      </View>
    );
  }

  const changeColor = trendColor(stats.isUp);
  const chartWidth = Math.max(width - 72, 240);
  const assetType = fromHoldings ? position?.type : undefined;
  const unit = assetType ? holdingUnit[assetType] : '';
  const backTitle = fromHoldings && from && isAssetKey(from) ? holdingTitles[from] : '探索';
  const profitColor = holding ? trendColor(holding.profitIsUp) : changeColor;
  const chartColor = fromHoldings ? trendColor((chartData[chartData.length - 1]?.price ?? 0) >= 0) : changeColor;

  return (
    <LinearGradient
      colors={['#EBC688', '#F5F5F7']}
      locations={[0, 0.28]}
      style={styles.gradient}
    >
      <Stack.Screen
        options={{
          title: product.name,
          headerBackTitle: backTitle,
        }}
      />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.quoteCard}>
            <Text style={styles.code}>{product.code}</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: changeColor }]}>{stats.latest.toFixed(2)}</Text>
              <Text style={styles.unit}>{product.unit}</Text>
            </View>
            <Text style={[styles.change, { color: changeColor }]}>
              {stats.isUp ? '+' : ''}
              {stats.change.toFixed(2)}（{stats.isUp ? '+' : ''}
              {stats.percent.toFixed(2)}%）
            </Text>
          </View>

          {holding ? (
            <View style={styles.block}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>我的持仓</Text>
                <Text style={styles.sectionMeta}>{holding.lotCount} 笔</Text>
              </View>
              <View style={styles.holdCard}>
                <View style={styles.holdGrid}>
                  <View style={styles.holdCell}>
                    <Text style={styles.holdLabel}>持仓数量</Text>
                    <Text style={styles.holdValue}>
                      {holding.shares} {unit}
                    </Text>
                  </View>
                  <View style={styles.holdCell}>
                    <Text style={styles.holdLabel}>持仓均价</Text>
                    <Text style={styles.holdValue}>{holding.costPrice.toFixed(2)}</Text>
                  </View>
                  <View style={styles.holdCell}>
                    <Text style={styles.holdLabel}>成本金额</Text>
                    <Text style={styles.holdValue}>{formatCny(holding.costValue)}</Text>
                  </View>
                  <View style={styles.holdCell}>
                    <Text style={styles.holdLabel}>最新市值</Text>
                    <Text style={styles.holdValue}>{formatCny(holding.marketValue)}</Text>
                  </View>
                  <View style={styles.holdCell}>
                    <Text style={styles.holdLabel}>累计盈亏</Text>
                    <Text style={[styles.holdValue, { color: profitColor }]}>
                      {formatSignedCny(holding.profit)}
                    </Text>
                  </View>
                  <View style={styles.holdCell}>
                    <Text style={styles.holdLabel}>今日盈亏</Text>
                    <Text style={[styles.holdValue, { color: trendColor(holding.isUp) }]}>
                      {formatSignedCny(holding.dayProfit)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null}

          {fromHoldings ? (
          <View style={styles.block}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>买入记录</Text>
              <Pressable
                onPress={() => {
                  setEditorLot(undefined);
                  setEditorOpen(true);
                }}
                style={({ pressed }) => [styles.addLotBtn, pressed && styles.pressed]}
              >
                <Text style={styles.addLot}>记一笔</Text>
              </Pressable>
            </View>
            <View style={styles.holdCard}>
              {holding?.lots.length ? (
                holding.lots.map((lot, index) => {
                  const lotColor = trendColor(lot.profitIsUp);
                  return (
                    <Pressable
                      key={lot.id}
                      onPress={() => {
                        setEditorLot(lot);
                        setEditorOpen(true);
                      }}
                      style={({ pressed }) => [
                        styles.lotRow,
                        index === holding.lots.length - 1 && styles.lotRowLast,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.lotMeta}>
                        <Text style={styles.lotDate}>{formatLotDate(lot.boughtAt)}</Text>
                        <Text style={styles.lotQty}>
                          {lot.shares} {unit}
                          <Text style={styles.lotCost}>  ·  成本 {lot.costPrice.toFixed(2)}</Text>
                        </Text>
                      </View>
                      <View style={styles.lotQuote}>
                        <Text style={[styles.lotProfit, { color: lotColor }]}>
                          {formatSignedCny(lot.profit)}
                        </Text>
                        <Text style={[styles.lotPercent, { color: lotColor }]}>
                          {lot.profitIsUp ? '+' : ''}
                          {lot.profitPercent.toFixed(2)}%
                        </Text>
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <Text style={styles.lotEmpty}>还没有买入记录</Text>
              )}
            </View>
          </View>
          ) : null}

          <View style={styles.block}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{fromHoldings ? '收益走势' : '价格走势'}</Text>
              <RangeTabs ranges={ranges} value={rangeKey} onChange={setRangeKey} />
            </View>
            <View style={styles.chartCard}>
            <LineChart
              data={chartData}
              width={chartWidth}
              height={220}
              color={chartColor}
              valueFormat={fromHoldings ? 'signed' : 'price'}
              gradientId={fromHoldings ? 'profitFill' : 'priceFill'}
            />

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>{fromHoldings ? '最高收益' : '区间最高'}</Text>
                <Text style={[styles.statValue, fromHoldings && { color: trendColor(stats.high >= 0) }]}>
                  {fromHoldings ? formatSignedCny(stats.high) : stats.high.toFixed(2)}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>{fromHoldings ? '最低收益' : '区间最低'}</Text>
                <Text style={[styles.statValue, fromHoldings && { color: trendColor(stats.low >= 0) }]}>
                  {fromHoldings ? formatSignedCny(stats.low) : stats.low.toFixed(2)}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>{fromHoldings ? '区间盈亏' : '涨跌幅'}</Text>
                <Text style={[styles.statValue, { color: chartColor }]}>
                  {fromHoldings
                    ? formatSignedCny(stats.change)
                    : `${stats.isUp ? '+' : ''}${stats.percent.toFixed(2)}%`}
                </Text>
              </View>
            </View>
            </View>
          </View>

          <Text style={styles.footer}>数据为模拟行情，仅用于展示</Text>
        </ScrollView>
      </SafeAreaView>

      {assetType ? (
        <HoldingEditor
          visible={editorOpen}
          product={product}
          assetType={assetType}
          lot={editorLot}
          onClose={() => setEditorOpen(false)}
          onSold={() => {
            if (from && isAssetKey(from) && (holding?.lotCount ?? 0) <= 1) {
              router.back();
            }
          }}
        />
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  quoteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  block: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    flexShrink: 0,
    marginRight: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  sectionMeta: {
    fontSize: 13,
    color: '#8E8E93',
  },
  lotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  lotRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  lotMeta: {
    flex: 1,
    paddingRight: 12,
  },
  lotDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  lotQty: {
    marginTop: 4,
    fontSize: 12,
    color: '#8E8E93',
  },
  lotCost: {
    color: '#8E8E93',
  },
  lotQuote: {
    alignItems: 'flex-end',
  },
  lotProfit: {
    fontSize: 16,
    fontWeight: '600',
  },
  lotPercent: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
  },
  lotEmpty: {
    paddingVertical: 20,
    textAlign: 'center',
    fontSize: 14,
    color: '#8E8E93',
  },
  holdCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  addLotBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  addLot: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  holdGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  holdCell: {
    width: '50%',
    paddingVertical: 8,
  },
  holdLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  holdValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  pressed: {
    opacity: 0.72,
  },
  code: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  priceRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.6,
  },
  unit: {
    marginLeft: 6,
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '500',
  },
  change: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  rangeScroll: {
    flex: 1,
  },
  rangeScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingLeft: 8,
  },
  rangeGroup: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
    padding: 2,
  },
  rangePill: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 0,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  rangeBtn: {
    flexShrink: 0,
    zIndex: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rangeText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
  rangeTextActive: {
    color: '#1D1D1F',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 8,
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
    marginTop: 20,
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.3)',
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F7',
  },
  missingText: {
    fontSize: 15,
    color: '#8E8E93',
  },
});
