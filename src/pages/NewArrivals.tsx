import { useState, useEffect } from "react";
import CollectionLayout from "@/components/CollectionLayout";
import { Product } from "@/data/products";
import { normalizeProduct } from "@/lib/normalizeProduct";

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        if (data.success || data.products) {
          const filtered = (data.products || []).filter((p: any) => p.isNew);
          const mapped = filtered.map((p: any) => normalizeProduct(p));
          setProducts(mapped);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <CollectionLayout
        title="Loading..."
        metaTitle="New Arrivals"
        metaDescription="Explore our new arrivals"
        products={[]}
        filterCategories={[]}
        heroBg="bg-gradient-to-b from-gold/5 to-background"
      />
    );
  }

  return (
    <CollectionLayout
      title="New Arrivals"
      subtitle="Fresh & Latest"
      tagline="Discover our newest collections"
      metaTitle="New Arrivals | Vasstra"
      metaDescription="Explore our new arrivals"
      products={products}
      filterCategories={[]}
      heroBg="bg-gradient-to-b from-gold/5 to-background"
    />
  );
}
