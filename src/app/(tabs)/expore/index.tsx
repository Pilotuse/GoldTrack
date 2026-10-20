import GlassSearchInput from '@/components/GlassSearchInput';
import ProductRow from '@/components/ProductRow';
import { getProductsByType, type Product } from '@/mock/markets';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

function matchesQuery(product: Product, query: string) {
  if (!query) return true;
  const keyword = query.trim().toLowerCase();
  return (
    product.name.toLowerCase().includes(keyword) ||
    product.code.toLowerCase().includes(keyword)
  );
}

export default function explore() {
  const [searchText, setSearchText] = useState('');
  const insets = useSafeAreaInsets();
  const bottomPad = insets.bottom + 88;

  const goldList = useMemo(
    () => getProductsByType('gold').filter((item) => matchesQuery(item, searchText)),
    [searchText],
  );
  const etfList = useMemo(
    () => getProductsByType('etf').filter((item) => matchesQuery(item, searchText)),
    [searchText],
  );

  const openProduct = (id: string) => {
    router.push({ pathname: '/product/[id]', params: { id } });
  };

  return (
    <LinearGradient
      colors={['#EBC688', '#F5F5F7']}
      locations={[0, 0.35]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeContainer} edges={['top']}>
        <View style={styles.headerWrapper}>
          <Text style={styles.header_title}>探索</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.searchWrapper}>
            <GlassSearchInput
              placeholder="搜索积存金、ETF"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {goldList.length > 0 && (
            <View style={styles.block}>
              <Text style={styles.sectionText}>积存金</Text>
              <View style={styles.section}>
                {goldList.map((item, index) => (
                  <ProductRow
                    key={item.id}
                    product={item}
                    isLast={index === goldList.length - 1}
                    onPress={() => openProduct(item.id)}
                  />
                ))}
              </View>
            </View>
          )}

          {etfList.length > 0 && (
            <View style={styles.block}>
              <Text style={styles.sectionText}>ETF</Text>
              <View style={styles.section}>
                {etfList.map((item, index) => (
                  <ProductRow
                    key={item.id}
                    product={item}
                    isLast={index === etfList.length - 1}
                    onPress={() => openProduct(item.id)}
                  />
                ))}
              </View>
            </View>
          )}

          {goldList.length === 0 && etfList.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>未找到相关产品</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  header_title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  searchWrapper: {
    marginTop: 4,
    marginBottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  block: {
    marginTop: 16,
  },
  section: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  sectionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
    paddingHorizontal: 12,
  },
  empty: {
    marginTop: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
