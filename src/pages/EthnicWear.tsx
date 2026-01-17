import { useState, useEffect } from "react";
import CollectionLayout from "@/components/CollectionLayout";
import { ethnicSubcategories } from "@/data/products";
import { normalizeProduct } from "@/lib/normalizeProduct";

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function EthnicWear() {
  const [ethnicProducts, setEthnicProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const url = `${API_URL}/products?category=ethnic_wear`;
        console.log('Fetching ethnic wear products from:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error(`API Error: ${response.status} ${response.statusText}`);
          setEthnicProducts([]);
          return;
        }

        const data = await response.json();
        const mapped = (data.products || []).map((p: any) => normalizeProduct(p));
        setEthnicProducts(mapped);
      } catch (error) {
        console.error("Error fetching ethnic wear products:", error);
        if (error instanceof TypeError) {
          console.error("Network error - API may be unreachable at:", API_URL);
        }
        setEthnicProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filterCategories = ethnicSubcategories.map(s => s.name);

  return (
    <CollectionLayout
      title="Ethnic Wear Collection"
      subtitle="Timeless elegance meets contemporary design"
      metaTitle="Ethnic Wear | Vasstra - Premium Indian Fashion"
      metaDescription="Explore our exclusive ethnic wear collection. Shop kurta sets, anarkali suits, lehengas, and festive wear with free shipping above ₹999."
      products={ethnicProducts}
      filterCategories={filterCategories}
      heroBg="bg-gradient-to-b from-primary/10 to-background"
    />
  );
}
