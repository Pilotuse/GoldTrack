import HoldingEditor from '@/components/HoldingEditor';
import { trendColor } from '@/constants/base';
import { useHoldingsState } from '@/hooks/useHoldings';
import {
  configTitles,
  getHolding,
  holdingTitles,
  holdingUnit,
  isAssetKey,
  productTypeByAsset,
} from '@/mock/holdings';
import { getChange, getLatestPrice, getProductsByType, type Product } from '@/mock/markets';
import type { AssetKey } from '@/mock/profile';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatQty(value: number) {
  return Number.isInteger(value) ? String(value) : String(value);
}

export default function AssetConfig() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const assetType: AssetKey = type && isAssetKey(type) ? type : 'etf';
  const holdingsState = useHoldingsState();
  const unit = holdingUnit[assetType];
  const products = getProductsByType(productTypeByAsset[assetType]);
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <LinearGradient
      colors={['#EBC688', '#F5F5F7']}
      locations={[0, 0.28]}
      style={styles.gradient}
    >
      <Stack.Screen
        options={{
          title: configTitles[assetType],
          headerBackTitle: holdingTitles[assetType],
        }}
      />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.listCard}>
            {products.map((product, index) => {
              const holding = getHolding(holdingsState, assetType, product.id);
              const price = getLatestPrice(product);
              const change = getChange(product);
              const color = trendColor(change.isUp);

              return (
                <Pressable
                  key={product.id}
                  onPress={() => setSelected(product)}
                  style={({ pressed }) => [
                    styles.row,
                    index === products.length - 1 && styles.rowLast,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.meta}>
                    <Text style={styles.name}>{product.name}</Text>
                    <Text style={styles.code}>
                      {product.code}
                      {holding ? (
                        <Text style={styles.holdingQty}>
                          {'  '}·  {formatQty(holding.shares)} {unit}
                          {holding.lotCount > 1 ? `  ·  ${holding.lotCount} 笔` : ''}
                        </Text>
                      ) : null}
                    </Text>
                  </View>
                  <View style={styles.quote}>
                    <Text style={[styles.price, { color }]}>{price.toFixed(2)}</Text>
                    <Text style={[styles.change, { color }]}>
                      {change.isUp ? '+' : ''}
                      {change.percent.toFixed(2)}%
                    </Text>
                  </View>
                  <View style={[styles.action, holding && styles.actionOn]}>
                    <Ionicons name="add" size={16} color={holding ? '#1D1D1F' : '#8E8E93'} />
                    <Text style={[styles.actionText, holding && styles.actionTextOn]}>买入</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>

      <HoldingEditor
        visible={selected != null}
        product={selected}
        assetType={assetType}
        onClose={() => setSelected(null)}
      />
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
  listCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
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
  holdingQty: {
    color: '#8E8E93',
  },
  quote: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  change: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
  },
  action: {
    minWidth: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
  },
  actionOn: {
    backgroundColor: 'rgba(235, 198, 136, 0.45)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  actionTextOn: {
    color: '#1D1D1F',
  },
});
