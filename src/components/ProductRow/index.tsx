import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { trendColor } from '@/constants/base';
import { getChange, getLatestPrice, type Product } from '@/mock/markets';

type ProductRowProps = {
  product: Product;
  isLast?: boolean;
  onPress: () => void;
};

export default function ProductRow({ product, isLast, onPress }: ProductRowProps) {
  const price = getLatestPrice(product);
  const change = getChange(product);
  const color = trendColor(change.isUp);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, isLast && styles.rowLast, pressed && styles.pressed]}
    >
      <View style={styles.meta}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.code}>{product.code}</Text>
      </View>
      <View style={styles.quote}>
        <Text style={[styles.price, { color }]}>{price.toFixed(2)}</Text>
        <Text style={[styles.change, { color }]}>
          {change.isUp ? '+' : ''}
          {change.percent.toFixed(2)}%
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  pressed: {
    opacity: 0.72,
  },
  meta: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  code: {
    marginTop: 3,
    fontSize: 12,
    color: '#8E8E93',
  },
  quote: {
    alignItems: 'flex-end',
    marginRight: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  change: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
  },
});
