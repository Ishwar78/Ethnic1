import { useState, useEffect } from "react";
import CollectionLayout from "@/components/CollectionLayout";
import { westernSubcategories } from "@/data/products";
import { normalizeProduct } from "@/lib/normalizeProduct";

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function WesternWear() {
  const [westernProducts, setWesternProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/products?category=western_wear`);
        if (response.ok) {
          const data = await response.json();
          const mapped = (data.products || []).map((p: any) => normalizeProduct(p));
          setWesternProducts(mapped);
        } else {
          setWesternProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setWesternProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filterCategories = westernSubcategories.map(s => s.name);

  return (
    <CollectionLayout
      title="Modern Western Styles"
      subtitle="Contemporary fashion for the modern woman"
      metaTitle="Western Wear | Vasstra - Modern Fashion"
      metaDescription="Shop our western wear collection. Trendy tops, dresses, co-ord sets, and casual wear. Free shipping above ₹999."
      products={westernProducts}
      filterCategories={filterCategories}
      heroBg="bg-gradient-to-b from-secondary/10 to-background"
    />
  );
}
