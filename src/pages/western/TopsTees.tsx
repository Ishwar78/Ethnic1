import { useState, useEffect } from "react";
import CollectionLayout from "@/components/CollectionLayout";
import { Product } from "@/data/products";
import { normalizeProduct } from "@/lib/normalizeProduct";

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function TopsTees() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/products?category=western_wear`);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        if (data.success || data.products) {
          const filtered = (data.products || []).filter((p: any) => p.subcategory === "Tops & Tees");
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
        metaTitle="Tops & Tees"
        metaDescription="Explore our tops and tees collection"
        products={[]}
        filterCategories={[]}
        heroBg="bg-gradient-to-b from-secondary/10 to-background"
      />
    );
  }

  return (
    <CollectionLayout
      title="Tops & Tees"
      subtitle="Casual & Comfortable"
      tagline="Everyday style essentials"
      metaTitle="Tops & Tees | Vasstra"
      metaDescription="Explore our tops and tees collection"
      products={products}
      filterCategories={[]}
      heroBg="bg-gradient-to-b from-secondary/10 to-background"
    />
  );
}
