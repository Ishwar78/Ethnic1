import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Filter, Grid3X3, LayoutGrid, Heart, Eye, ShoppingBag, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { normalizeProduct } from "@/lib/normalizeProduct";

const API_URL = import.meta.env.VITE_API_URL || '/api';

const defaultCategories = ["All", "Ethnic Wear", "Western Wear"];
const sizes = ["S", "M", "L", "XL", "XXL", "XXXL", "Free Size"];
const colors = [
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

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest First", value: "newest" },
];

interface Product {
  _id: string;
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  category: string;
  sizes: string[];
  colors: string[];
  isNew?: boolean;
  isBestseller?: boolean;
}

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        const url = `${API_URL}/categories`;
        console.log('Fetching categories from:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error(`API Error: ${response.status} ${response.statusText}`);
          setCategories([]);
          return;
        }

        const data = await response.json();
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (error instanceof TypeError) {
          console.error("Network error - API may be unreachable at:", API_URL);
        }
        setCategories([]);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle category from URL parameter
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategorySlug(categoryParam);
      // Find the category name from slug
      const category = categories.find(c => c.slug === categoryParam);
      if (category) {
        setSelectedCategory(category.name);
      } else {
        setSelectedCategory(categoryParam);
      }
    }
  }, [searchParams, categories]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const url = `${API_URL}/products`;
        console.log('Fetching shop products from:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error(`API Error: ${response.status} ${response.statusText}`);
          setProducts([]);
          return;
        }

        const data = await response.json();
        const mappedProducts = (data.products || []).map((p: any) => normalizeProduct(p));
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching shop products:', error);
        if (error instanceof TypeError) {
          console.error("Network error - API may be unreachable at:", API_URL);
        }
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    // Filter by category
    if (selectedCategory !== "All") {
      // Check if product category matches selected category (case-insensitive)
      const selectedCat = categories.find(c => c.name === selectedCategory || c.slug === selectedCategorySlug);
      if (selectedCat) {
        // Try to match by category name or slug
        const productCategory = product.category?.toLowerCase() || '';
        const catName = selectedCat.name?.toLowerCase() || '';
        const catSlug = selectedCat.slug?.toLowerCase() || '';
        if (!productCategory.includes(catName) && !productCategory.includes(catSlug)) {
          return false;
        }
      }
    }
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    if (selectedSizes.length > 0 && !selectedSizes.some((s) => product.sizes.includes(s))) return false;
    if (selectedColors.length > 0 && !selectedColors.some((c) => product.colors.includes(c))) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "newest": return b.id - a.id;
      default: return 0;
    }
  });

  return (
    <>
      <Helmet>
        <title>Shop Ethnic Wear | Vasstra - Premium Indian Fashion</title>
        <meta name="description" content="Browse our collection of premium ethnic wear. Shop suits, lehengas, sarees & more with free shipping above ₹999." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-16">
          {/* Page Header */}
          <div className="bg-muted/30 py-12">
            <div className="container mx-auto px-4">
              <nav className="text-sm text-muted-foreground mb-4">
                <Link to="/" className="hover:text-primary">Home</Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">Shop</span>
              </nav>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                Shop Collection
              </h1>
              <p className="text-muted-foreground mt-2">
                {sortedProducts.length} products found
              </p>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <aside className={cn(
                "w-full lg:w-72 shrink-0",
                "lg:block",
                isFilterOpen ? "block" : "hidden lg:block"
              )}>
                <div className="bg-card rounded-lg p-6 shadow-soft sticky top-28">
                  <h3 className="font-display text-xl font-semibold mb-6">Filters</h3>

                  {/* Price Range */}
                  <div className="mb-8">
                    <h4 className="font-medium mb-4">Price Range</h4>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={20000}
                      step={500}
                      className="mb-3"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>₹{priceRange[0].toLocaleString()}</span>
                      <span>₹{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mb-8">
                    <h4 className="font-medium mb-4">Category</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedCategory("All");
                          setSelectedCategorySlug(null);
                        }}
                        className={cn(
                          "block w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                          selectedCategory === "All"
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        All
                      </button>
                      {isCategoriesLoading ? (
                        <div className="text-xs text-muted-foreground">Loading categories...</div>
                      ) : (
                        categories.map((cat) => (
                          <button
                            key={cat._id || cat.id}
                            onClick={() => {
                              setSelectedCategory(cat.name);
                              setSelectedCategorySlug(cat.slug);
                            }}
                            className={cn(
                              "block w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                              (selectedCategory === cat.name || selectedCategorySlug === cat.slug)
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            )}
                          >
                            {cat.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="mb-8">
                    <h4 className="font-medium mb-4">Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSizes((prev) =>
                            prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
                          )}
                          className={cn(
                            "h-10 w-12 rounded border text-sm font-medium transition-all",
                            selectedSizes.includes(size)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="mb-8">
                    <h4 className="font-medium mb-4">Color</h4>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColors((prev) =>
                            prev.includes(color.name) ? prev.filter((c) => c !== color.name) : [...prev, color.name]
                          )}
                          className={cn(
                            "h-8 w-8 rounded-full border-2 transition-all",
                            selectedColors.includes(color.name)
                              ? "border-primary ring-2 ring-primary ring-offset-2"
                              : "border-transparent"
                          )}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setPriceRange([0, 20000]);
                      setSelectedCategory("All");
                      setSelectedCategorySlug(null);
                      setSelectedSizes([]);
                      setSelectedColors([]);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <Button
                    variant="outline"
                    className="lg:hidden"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>

                  <div className="flex items-center gap-4">
                    {/* Grid Toggle */}
                    <div className="hidden md:flex items-center gap-2 border rounded-md p-1">
                      <button
                        onClick={() => setGridCols(3)}
                        className={cn(
                          "p-2 rounded transition-colors",
                          gridCols === 3 ? "bg-muted" : "hover:bg-muted/50"
                        )}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setGridCols(4)}
                        className={cn(
                          "p-2 rounded transition-colors",
                          gridCols === 4 ? "bg-muted" : "hover:bg-muted/50"
                        )}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Products */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading products...</span>
                  </div>
                ) : (
                  <>
                    <div className={cn(
                      "grid gap-4 md:gap-6",
                      gridCols === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    )}>
                      {sortedProducts.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                      ))}
                    </div>

                    {sortedProducts.length === 0 && (
                      <div className="text-center py-16">
                        <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
                        <Button variant="outline" className="mt-4" onClick={() => {
                          setPriceRange([0, 20000]);
                          setSelectedCategory("All");
                          setSelectedSizes([]);
                          setSelectedColors([]);
                        }}>
                          Clear Filters
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
}

function ProductCard({ product, index }: { product: typeof products[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div
      className="group animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-lg bg-card shadow-soft group-hover:shadow-hover transition-all duration-500">
        <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden">
          <img
            src={isHovered ? product.hoverImage : product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            loading="lazy"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.discount > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                -{product.discount}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-gold text-charcoal text-xs font-bold px-2 py-1 rounded">NEW</span>
            )}
            {product.isBestseller && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">BESTSELLER</span>
            )}
          </div>

          <div className={cn(
            "absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          )}>
            <button
              onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md",
                isWishlisted ? "bg-destructive text-destructive-foreground" : "bg-background text-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
            </button>
            <button className="h-9 w-9 rounded-full bg-background text-foreground hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300 shadow-md">
              <Eye className="h-4 w-4" />
            </button>
          </div>

          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-3 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <Button variant="gold" className="w-full gap-2">
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </Link>

        <div className="p-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{product.category}</span>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-display text-lg font-semibold text-foreground mt-1 group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-display text-xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
