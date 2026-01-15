// Configuration data only - NO HARDCODED PRODUCTS
// All products are fetched from the admin API

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  originalPrice: number;
  discount?: number;
  image: string;
  images?: string[];
  category: string;
  subcategory?: string;
  sizes?: string[];
  colors?: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  isSummer?: boolean;
  isWinter?: boolean;
  description?: string;
  stock?: number;
  isActive?: boolean;
  createdAt?: string;
  rating?: number;
  reviews?: any[];
}

export const categories = ["All", "Ethnic Wear", "Western Wear"];

export const sizes = ["S", "M", "L", "XL", "XXL", "XXXL", "Free Size"];

export const colors = [
  { name: "Burgundy", hex: "#722F37" },
  { name: "Blue", hex: "#1E3A8A" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Green", hex: "#059669" },
  { name: "Maroon", hex: "#800000" },
  { name: "Ivory", hex: "#FFFFF0" },
  { name: "Teal", hex: "#0D9488" },
  { name: "Orange", hex: "#EA580C" },
  { name: "Red", hex: "#DC2626" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#000000" },
  { name: "Gold", hex: "#FBBF24" },
];

export const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest First", value: "newest" },
  { label: "Popularity", value: "popularity" },
];

export const ethnicSubcategories = [
  { name: "Kurta Sets", href: "/ethnic-wear/kurta-sets" },
  { name: "Anarkali Suits", href: "/ethnic-wear/anarkali-suits" },
  { name: "Lehengas", href: "/ethnic-wear/lehengas" },
  { name: "Party Wear", href: "/ethnic-wear/party-wear" },
  { name: "Festive Collection", href: "/ethnic-wear/festive-collection" },
];

export const westernSubcategories = [
  { name: "Tops & Tees", href: "/western-wear/tops-tees" },
  { name: "Dresses", href: "/western-wear/dresses" },
  { name: "Co-ord Sets", href: "/western-wear/coord-sets" },
  { name: "Casual Wear", href: "/western-wear/casual-wear" },
];
