import { Product } from "@/data/products";

interface RelatedProductsOptions {
  currentProduct: Product;
  products: Product[];
  limit?: number;
}

/**
 * Calculate related products based on relevance scoring
 * Note: This function now requires the products array to be passed as a parameter
 * since products are now fetched from the API instead of stored locally.
 *
 * In ProductDetail.tsx, related products are fetched directly from the API.
 * This utility is kept for backward compatibility with other components.
 */
export function getRelatedProducts({ currentProduct, products, limit = 4 }: RelatedProductsOptions): Product[] {
  const priceRange = 0.2; // ±20%
  const minPrice = currentProduct.price * (1 - priceRange);
  const maxPrice = currentProduct.price * (1 + priceRange);

  // Score each product for relevance
  const scoredProducts = products
    .filter((p) => p._id !== currentProduct._id && p.id !== currentProduct.id)
    .map((product) => {
      let score = 0;

      // Same category (highest priority)
      if (product.category === currentProduct.category) {
        score += 50;
      }

      // Same subcategory (very high priority)
      if (product.subcategory && product.subcategory === currentProduct.subcategory) {
        score += 40;
      }

      // Price range match
      if (product.price >= minPrice && product.price <= maxPrice) {
        score += 20;
      }

      // Same season
      if (currentProduct.isSummer && product.isSummer) score += 10;
      if (currentProduct.isWinter && product.isWinter) score += 10;

      // Bonus for bestsellers and new items
      if (product.isBestseller) score += 5;
      if (product.isNew) score += 5;

      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product }) => product);

  // If not enough related products, fill with bestsellers from same category
  if (scoredProducts.length < limit) {
    const remaining = limit - scoredProducts.length;
    const existingIds = new Set([currentProduct._id, currentProduct.id, ...scoredProducts.map((p) => p._id || p.id)]);

    const fallbackProducts = products
      .filter((p) => !existingIds.has(p._id) && !existingIds.has(p.id))
      .filter((p) => p.category === currentProduct.category || p.isBestseller)
      .slice(0, remaining);

    return [...scoredProducts, ...fallbackProducts];
  }

  return scoredProducts;
}
