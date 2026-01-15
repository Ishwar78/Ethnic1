import { useState, useEffect, useCallback } from "react";
import { Product } from "@/data/products";

const RECENTLY_VIEWED_KEY = "vasstra-recently-viewed";
const MAX_ITEMS = 10;

export interface RecentlyViewedItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  hoverImage: string;
  category: string;
  subcategory?: string;
  viewedAt: number;
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(RECENTLY_VIEWED_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
  }, [items]);

  const addToRecentlyViewed = useCallback((product: Product) => {
    setItems((prev) => {
      // Remove if already exists
      const filtered = prev.filter((item) => item.id !== product.id);
      
      // Add to the beginning
      const newItem: RecentlyViewedItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        image: product.image,
        hoverImage: product.hoverImage,
        category: product.category,
        subcategory: product.subcategory,
        viewedAt: Date.now(),
      };
      
      // Keep only MAX_ITEMS
      return [newItem, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const getRecentlyViewed = useCallback((excludeId?: number, limit = 4) => {
    return items
      .filter((item) => item.id !== excludeId)
      .slice(0, limit);
  }, [items]);

  const clearRecentlyViewed = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    addToRecentlyViewed,
    getRecentlyViewed,
    clearRecentlyViewed,
  };
}
