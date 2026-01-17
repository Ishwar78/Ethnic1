import { useState, useEffect } from "react";
import CollectionLayout from "@/components/CollectionLayout";
import { Product } from "@/data/products";
import { normalizeProduct } from "@/lib/normalizeProduct";

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function CoordSets() {
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
          const filtered = (data.products || []).filter((p: any) => p.subcategory === "Co-ord Sets");
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
        metaTitle="Co-ord Sets"
        metaDescription="Explore our co-ord sets collection"
        products={[]}
        filterCategories={[]}
        heroBg="bg-gradient-to-b from-secondary/10 to-background"
      />
    );
  }

  return (
    <CollectionLayout
      title="Co-ord Sets"
      subtitle="Perfectly Matched"
      tagline="Coordinated style for the modern woman"
      metaTitle="Co-ord Sets | Vasstra"
      metaDescription="Explore our co-ord sets collection"
      products={products}
      filterCategories={[]}
      heroBg="bg-gradient-to-b from-secondary/10 to-background"
    />
  );
}
