import { Product } from "@/data/products";

export function normalizeProduct(p: any): Product {
  return {
    _id: p._id,
    id: p._id,
    name: p.name || "",
    price: p.price || 0,
    originalPrice: p.originalPrice || p.price || 0,
    discount: p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
    image: p.image || (p.images && p.images[0]) || "",
    images: (p.images && p.images.length) ? p.images : (p.image ? [p.image] : []),
    category: p.category || "ethnic_wear",
    subcategory: p.subcategory || "",
    sizes: p.sizes || [],
    colors: p.colors || [],
    description: p.description || "",
    stock: typeof p.stock === "number" ? p.stock : 0,
    isActive: p.isActive !== false,
    isNew: !!p.isNew,
    isBestseller: !!p.isBestseller,
    isSummer: !!p.isSummer,
    isWinter: !!p.isWinter,
    createdAt: p.createdAt,
    rating: p.rating,
    reviews: p.reviews,
  };
}
