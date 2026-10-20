import {
  addLotState,
  assetKeyFromProductType,
  createInitialHoldings,
  getHolding,
  getHoldings,
  getHoldingsSummary,
  removeHoldingState,
  removeLotState,
  updateLotState,
  type HoldingsState,
} from '@/mock/holdings';
import { getProductById } from '@/mock/markets';
import type { AssetKey } from '@/mock/profile';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type LotInput = { shares: number; costPrice: number };

type HoldingsContextValue = {
  state: HoldingsState;
  addLot: (type: AssetKey, productId: string, input: LotInput) => void;
  updateLot: (type: AssetKey, lotId: string, input: LotInput) => void;
  removeLot: (type: AssetKey, lotId: string) => void;
  removeHolding: (type: AssetKey, productId: string) => void;
};

const HoldingsContext = createContext<HoldingsContextValue | null>(null);

export function HoldingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createInitialHoldings);

  const value = useMemo<HoldingsContextValue>(
    () => ({
      state,
      addLot: (type, productId, input) => {
        setState((current) => addLotState(current, type, productId, input));
      },
      updateLot: (type, lotId, input) => {
        setState((current) => updateLotState(current, type, lotId, input));
      },
      removeLot: (type, lotId) => {
        setState((current) => removeLotState(current, type, lotId));
      },
      removeHolding: (type, productId) => {
        setState((current) => removeHoldingState(current, type, productId));
      },
    }),
    [state],
  );

  return <HoldingsContext.Provider value={value}>{children}</HoldingsContext.Provider>;
}

function useHoldingsContext() {
  const context = useContext(HoldingsContext);
  if (!context) {
    throw new Error('HoldingsProvider missing');
  }
  return context;
}

export function useHoldings(type: AssetKey) {
  const { state } = useHoldingsContext();
  return {
    list: getHoldings(state, type),
    summary: getHoldingsSummary(state, type),
  };
}

export function useHoldingItem(type: AssetKey, productId?: string) {
  const { state } = useHoldingsContext();
  if (!productId) return undefined;
  return getHolding(state, type, productId);
}

export function useHoldingsActions() {
  const { addLot, updateLot, removeLot, removeHolding } = useHoldingsContext();
  return { addLot, updateLot, removeLot, removeHolding };
}

export function useHoldingsState() {
  return useHoldingsContext().state;
}

export function useHoldingPosition(productId?: string) {
  const { state } = useHoldingsContext();
  const product = productId ? getProductById(productId) : undefined;
  if (!product) return undefined;

  const type = assetKeyFromProductType(product.type);
  const item = getHoldings(state, type).find((holding) => holding.productId === product.id);
  return { type, product, item };
}
