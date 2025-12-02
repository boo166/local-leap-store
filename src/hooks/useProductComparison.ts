import { useState, useEffect, useCallback } from 'react';

export interface CompareProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  category: string;
  inventory_count: number;
  stores: {
    id: string;
    name: string;
  };
}

const MAX_COMPARE_ITEMS = 4;
const STORAGE_KEY = 'compare_products';

export const useProductComparison = () => {
  const [compareProducts, setCompareProducts] = useState<CompareProduct[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCompareProducts(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compareProducts));
  }, [compareProducts]);

  const addToCompare = useCallback((product: CompareProduct) => {
    setCompareProducts(prev => {
      if (prev.some(p => p.id === product.id)) {
        return prev;
      }
      if (prev.length >= MAX_COMPARE_ITEMS) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareProducts([]);
  }, []);

  const isInCompare = useCallback((productId: string) => {
    return compareProducts.some(p => p.id === productId);
  }, [compareProducts]);

  const canAddMore = compareProducts.length < MAX_COMPARE_ITEMS;

  return {
    compareProducts,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    canAddMore,
    maxItems: MAX_COMPARE_ITEMS,
  };
};
