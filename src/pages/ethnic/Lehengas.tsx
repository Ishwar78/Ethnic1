import { useState, useEffect } from "react";
import CollectionLayout from "@/components/CollectionLayout";
import { Product } from "@/data/products";
import { normalizeProduct } from "@/lib/normalizeProduct";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Lehengas() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/products?category=ethnic_wear`);
        const data = await response.json();
        if (data.success || data.products) {
          const filtered = (data.products || []).filter((p: any) => p.subcategory === "Lehengas");
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
        metaTitle="Lehengas"
        metaDescription="Explore our beautiful collection of lehengas"
        products={[]}
        filterCategories={[]}
        heroBg="bg-gradient-to-b from-primary/5 to-background"
      />
    );
  }

  return (
    <CollectionLayout
      title="Lehengas"
      subtitle="Royal Bridal Collection"
      tagline="Make your special day unforgettable"
      metaTitle="Lehengas | Vasstra"
      metaDescription="Explore our beautiful collection of lehengas"
      products={products}
      filterCategories={[]}
      heroBg="bg-gradient-to-b from-primary/5 to-background"
    />
  );
}
