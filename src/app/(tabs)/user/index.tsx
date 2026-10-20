import Avatar from '@/components/Avatar';
import Sparkline from '@/components/Sparkline';
import { trendBg, trendColor } from '@/constants/base';
import { useHoldingsState } from '@/hooks/useHoldings';
import { getPortfolioAssets } from '@/mock/holdings';
import {
  formatCny,
  formatSignedCny,
  getChangeAmount,
  getDailyReview,
  getTotalAssets,
  type AssetItem,
} from '@/mock/profile';
import { useProfile } from '@/context/ProfileContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

function AssetCard({ item }: { item: AssetItem }) {
  const up = item.changePercent >= 0;
  const color = trendColor(up);
  const [chartWidth, setChartWidth] = useState(0);
  const changeAmount = getChangeAmount(item.amount, item.changePercent);

  const openHoldings = () => {
    router.push(`/holdings/${item.key}` as import('expo-router').Href);
  };

  return (
    <Pressable
      onPress={openHoldings}
      style={({ pressed }) => [styles.assetCard, pressed && styles.pressed]}
      onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
    >
      <View style={styles.assetTop}>
        <Text style={styles.assetName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={[styles.percentPill, { backgroundColor: trendBg(up) }]}>
          <Text style={[styles.percentText, { color }]}>
            {up ? '+' : ''}
            {item.changePercent.toFixed(2)}%
          </Text>
        </View>
      </View>

      <Text style={styles.assetAmount}>{formatCny(item.amount)}</Text>
      <Text style={[styles.assetDelta, { color }]}>{formatSignedCny(changeAmount)}</Text>

      <View style={styles.sparkWrap}>
        {chartWidth > 0 && (
          <Sparkline
            data={item.profitTrend}
            color={color}
            width={chartWidth}
            height={32}
            gradientId={`spark-${item.key}`}
          />
        )}
      </View>
    </Pressable>
  );
}

export default function UserProfile() {
  const { profile } = useProfile();
  const holdings = useHoldingsState();
  const assets = getPortfolioAssets(holdings);
  const insets = useSafeAreaInsets();
  const total = getTotalAssets(assets);
  const totalColor = trendColor(total.isUp);
  const review = getDailyReview(assets);
  const reviewProfitColor = trendColor(review.profitIsUp);
  const now = new Date();
  const reviewDate = `${now.getMonth() + 1}.${now.getDate()}`;

  return (
    <LinearGradient
      colors={['#EBC688', '#F5F5F7']}
      locations={[0, 0.28]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>我的</Text>
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={12}
            style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
          >
            <Ionicons name="settings-outline" size={20} color="#3A3A3C" />
          </Pressable>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={[styles.bodyContent, { paddingBottom: insets.bottom + 88 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <Pressable
              onPress={() => router.push('/account')}
              style={({ pressed }) => [styles.profileRow, pressed && styles.pressed]}
            >
              <Avatar
                uri={profile.avatarUri}
                initial={profile.avatarInitial}
                size={48}
                fontSize={20}
              />
              <View style={styles.profileMeta}>
                <Text style={styles.nickname}>{profile.nickname}</Text>
                <Text style={styles.userId}>ID {profile.userId}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
            </Pressable>

            <View style={styles.heroDivider} />

            <Text style={styles.totalLabel}>总资产（元）</Text>
            <Text style={styles.totalAmount}>{formatCny(total.amount)}</Text>
            <Text style={[styles.totalDelta, { color: totalColor }]}>
              今日 {total.isUp ? '+' : ''}
              {total.changePercent.toFixed(2)}%
              <Text style={styles.totalDeltaDot}>  ·  </Text>
              {formatSignedCny(total.changeAmount)}
            </Text>
          </View>

          <View style={styles.reviewBlock}>
            <Text style={styles.reviewTitle}>{reviewDate} 资产盘点</Text>
            <View style={styles.reviewCard}>
            <View style={styles.reviewRow}>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>昨日结余</Text>
                <Text style={styles.reviewValue}>{formatCny(review.yesterday)}</Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>今日流入</Text>
                <Text style={[styles.reviewValue, { color: trendColor(true) }]}>
                  {formatSignedCny(review.inflow)}
                </Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>今日流出</Text>
                <Text style={[styles.reviewValue, { color: trendColor(false) }]}>
                  {formatSignedCny(-review.outflow)}
                </Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>浮动盈亏</Text>
                <Text style={[styles.reviewValue, { color: reviewProfitColor }]}>
                  {formatSignedCny(review.profit)}
                </Text>
              </View>
            </View>
            <Text style={styles.reviewHint}>
              {review.best.name}贡献最大
              <Text style={styles.reviewHintDot}>  ·  </Text>
              {review.worst.name}拖累
            </Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.gridRow}>
              {assets.slice(0, 2).map((item) => (
                <AssetCard key={item.key} item={item} />
              ))}
            </View>
            <View style={styles.gridRow}>
              {assets.slice(2).map((item) => (
                <AssetCard key={item.key} item={item} />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const CARD = {
  backgroundColor: 'rgba(255, 255, 255, 0.62)',
  borderRadius: 22,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: 'rgba(255, 255, 255, 0.9)',
} as const;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.4,
  },
  settingsBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  pressed: {
    opacity: 0.65,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
  },
  heroCard: {
    ...CARD,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileMeta: {
    marginLeft: 12,
    flex: 1,
  },
  nickname: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  userId: {
    marginTop: 3,
    fontSize: 12,
    color: '#8E8E93',
    letterSpacing: 0.2,
  },
  heroDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 14,
  },
  totalLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  totalAmount: {
    marginTop: 4,
    fontSize: 34,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.8,
  },
  totalDelta: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  totalDeltaDot: {
    color: '#C7C7CC',
    fontWeight: '500',
  },
  reviewBlock: {
    marginTop: 16,
  },
  reviewTitle: {
    paddingHorizontal: 12,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  reviewCard: {
    ...CARD,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  reviewRow: {
    flexDirection: 'row',
  },
  reviewItem: {
    flex: 1,
  },
  reviewLabel: {
    fontSize: 11,
    color: '#8E8E93',
  },
  reviewValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.2,
  },
  reviewHint: {
    marginTop: 12,
    fontSize: 12,
    color: '#8E8E93',
  },
  reviewHintDot: {
    color: '#C7C7CC',
  },
  grid: {
    marginTop: 12,
    gap: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  assetCard: {
    ...CARD,
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  assetTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  assetName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  percentPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  assetAmount: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.4,
  },
  assetDelta: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  sparkWrap: {
    marginTop: 8,
    marginHorizontal: -12,
  },
});
