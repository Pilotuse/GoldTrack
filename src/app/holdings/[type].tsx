import { trendColor } from '@/constants/base';
import { useHoldings } from '@/hooks/useHoldings';
import {
  formatCny,
  formatSignedCny,
  holdingTitles,
  holdingUnit,
  isAssetKey,
} from '@/mock/holdings';
import type { AssetKey } from '@/mock/profile';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Holdings() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const assetType: AssetKey = type && isAssetKey(type) ? type : 'etf';
  const title = holdingTitles[assetType];
  const unit = holdingUnit[assetType];
  const { list, summary } = useHoldings(assetType);
  const summaryColor = trendColor(summary.isUp);

  return (
    <LinearGradient
      colors={['#EBC688', '#F5F5F7']}
      locations={[0, 0.28]}
      style={styles.gradient}
    >
      <Stack.Screen
        options={{
          title,
          headerBackTitle: '我的',
          freezeOnBlur: false,
          headerRight: () => (
            <Pressable
              onPress={() => router.push(`/asset-config/${assetType}` as Href)}
              hitSlop={12}
              style={styles.headerBtn}
            >
              <Ionicons name="add" size={28} color="#1D1D1F" />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>总市值（元）</Text>
            <Text style={styles.summaryValue}>{formatCny(summary.marketValue)}</Text>
            <Text style={[styles.summaryDelta, { color: summaryColor }]}>
              今日 {formatSignedCny(summary.dayProfit)}
              <Text style={styles.dot}>  ·  </Text>
              持仓 {summary.count} 只
            </Text>
          </View>

          <View style={styles.listCard}>
            {list.length === 0 ? (
              <Text style={styles.empty}>暂无配置资产</Text>
            ) : (
              list.map((item, index) => {
                const color = trendColor(item.isUp);
                const profitColor = trendColor(item.profitIsUp);
                return (
                  <Pressable
                    key={item.productId}
                    onPress={() =>
                      router.push({
                        pathname: '/product/[id]',
                        params: { id: item.product.id, from: assetType },
                      })
                    }
                    style={({ pressed }) => [
                      styles.row,
                      index === list.length - 1 && styles.rowLast,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.meta}>
                      <Text style={styles.name}>{item.product.name}</Text>
                      <Text style={styles.code}>
                        {item.product.code}
                        <Text style={styles.shares}>
                          {'  '}·  {item.shares} {unit}
                          {item.lotCount > 1 ? `  ·  ${item.lotCount} 笔` : ''}
                        </Text>
                      </Text>
                    </View>
                    <View style={styles.quote}>
                      <Text style={styles.market}>{formatCny(item.marketValue)}</Text>
                      <Text style={[styles.day, { color }]}>
                        {item.isUp ? '+' : ''}
                        {item.dayChangePercent.toFixed(2)}%
                        {'  '}
                        {formatSignedCny(item.dayProfit)}
                      </Text>
                      <Text style={[styles.profit, { color: profitColor }]}>
                        累计 {formatSignedCny(item.profit)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                  </Pressable>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
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
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 32,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.6,
  },
  summaryDelta: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  dot: {
    color: '#C7C7CC',
    fontWeight: '500',
  },
  listCard: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  empty: {
    paddingVertical: 28,
    textAlign: 'center',
    fontSize: 14,
    color: '#8E8E93',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  pressed: {
    opacity: 0.72,
  },
  meta: {
    flex: 1,
    paddingRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  code: {
    marginTop: 4,
    fontSize: 12,
    color: '#8E8E93',
  },
  shares: {
    color: '#8E8E93',
  },
  quote: {
    alignItems: 'flex-end',
    marginRight: 6,
  },
  market: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  day: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
  },
  profit: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
  },
  headerBtn: {
    paddingHorizontal: 4,
  },
});
