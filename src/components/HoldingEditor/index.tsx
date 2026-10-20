import { useHoldingsActions } from '@/hooks/useHoldings';
import { useKeyboardOffset } from '@/hooks/useKeyboardOffset';
import { getDefaultShares, holdingUnit, type HoldingLot } from '@/mock/holdings';
import { getLatestPrice, type Product } from '@/mock/markets';
import type { AssetKey } from '@/mock/profile';
import { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatQty(value: number) {
  return Number.isInteger(value) ? String(value) : String(value);
}

type HoldingEditorProps = {
  visible: boolean;
  product: Product | null;
  assetType: AssetKey;
  lot?: HoldingLot;
  onClose: () => void;
  onSold?: () => void;
};

export default function HoldingEditor({
  visible,
  product,
  assetType,
  lot,
  onClose,
  onSold,
}: HoldingEditorProps) {
  const { addLot, updateLot, removeLot } = useHoldingsActions();
  const insets = useSafeAreaInsets();
  const restPad = Math.max(insets.bottom, 20);
  const keyboardOffset = useKeyboardOffset(visible, restPad);
  const unit = holdingUnit[assetType];
  const [sharesText, setSharesText] = useState('');
  const [costText, setCostText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible || !product) return;
    setSharesText(lot ? formatQty(lot.shares) : String(getDefaultShares(assetType)));
    setCostText((lot?.costPrice ?? getLatestPrice(product)).toFixed(2));
    setError('');
  }, [visible, product, lot?.id, lot?.shares, lot?.costPrice, assetType]);

  const saveLot = () => {
    if (!product) return;

    const shares = Number(sharesText);
    const costPrice = Number(costText);

    if (!Number.isFinite(shares) || shares <= 0) {
      setError(`请输入大于 0 的买入数量（${unit}）`);
      return;
    }
    if (!Number.isFinite(costPrice) || costPrice < 0) {
      setError('请输入有效的买入成本');
      return;
    }

    const input = {
      shares: Number(shares.toFixed(4)),
      costPrice: Number(costPrice.toFixed(2)),
    };

    if (lot) {
      updateLot(assetType, lot.id, input);
    } else {
      addLot(assetType, product.id, input);
    }
    onClose();
  };

  const sellLot = () => {
    if (!lot) return;
    removeLot(assetType, lot.id);
    onClose();
    onSold?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: restPad,
              transform: [{ translateY: Animated.multiply(keyboardOffset, -1) }],
            },
          ]}
        >
          <View style={styles.sheetExtend} />
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{lot ? '编辑这笔' : '记一笔买入'}</Text>
          <Text style={styles.sheetSub}>
            {product?.name}
            {product ? `  ·  最新 ${getLatestPrice(product).toFixed(2)} ${product.unit}` : ''}
          </Text>

          <Text style={styles.fieldLabel}>买入数量（{unit}）</Text>
          <TextInput
            value={sharesText}
            onChangeText={(text) => {
              setSharesText(text);
              setError('');
            }}
            keyboardType="decimal-pad"
            placeholder="例如 1"
            placeholderTextColor="#C7C7CC"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>买入成本（{product?.unit ?? '元'}）</Text>
          <TextInput
            value={costText}
            onChangeText={(text) => {
              setCostText(text);
              setError('');
            }}
            keyboardType="decimal-pad"
            placeholder="这一笔的买入单价"
            placeholderTextColor="#C7C7CC"
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={saveLot}
            style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
          >
            <Text style={styles.saveText}>{lot ? '保存' : '确认买入'}</Text>
          </Pressable>

          {lot ? (
            <Pressable
              onPress={sellLot}
              style={({ pressed }) => [styles.sellBtn, pressed && styles.pressed]}
            >
              <Text style={styles.sellText}>卖出这笔</Text>
            </Pressable>
          ) : (
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>取消</Text>
            </Pressable>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  sheet: {
    backgroundColor: '#F5F5F7',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    overflow: 'visible',
  },
  sheetExtend: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    height: 400,
    backgroundColor: '#F5F5F7',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D1D6',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  sheetSub: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 13,
    color: '#8E8E93',
  },
  fieldLabel: {
    marginBottom: 8,
    fontSize: 13,
    color: '#8E8E93',
  },
  input: {
    height: 46,
    marginBottom: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    fontSize: 16,
    color: '#1D1D1F',
  },
  error: {
    marginTop: -6,
    marginBottom: 12,
    fontSize: 13,
    color: '#FF3B30',
  },
  saveBtn: {
    height: 46,
    marginTop: 2,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D1D1F',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sellBtn: {
    height: 44,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
  },
  cancelBtn: {
    height: 44,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  pressed: {
    opacity: 0.72,
  },
});
