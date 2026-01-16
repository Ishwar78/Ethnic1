import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Product } from "@/data/products";
import { normalizeProduct } from "@/lib/normalizeProduct";

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Fetch products when modal opens
  useEffect(() => {
    if (isOpen && products.length === 0) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch(`${API_URL}/products?limit=100`);
      if (response.ok) {
        const data = await response.json();
        const normalizedProducts = (data.products || []).map((p: any) => normalizeProduct(p));
        setProducts(normalizedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Get min/max prices from products
  const minPrice = products.length > 0 ? Math.min(...products.map((p) => p.price)) : 0;
  const maxPrice = products.length > 0 ? Math.max(...products.map((p) => p.price)) : 20000;

  // Filter products based on search query, category, and price
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery =
        query.trim() === "" ||
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(query.toLowerCase())) ||
        (product.subcategory && product.subcategory.toLowerCase().includes(query.toLowerCase()));

      const categoryDisplay = product.category === 'ethnic_wear' ? 'Ethnic Wear' : 'Western Wear';
      const matchesCategory =
        selectedCategory === "All" ||
        categoryDisplay === selectedCategory ||
        (product.subcategory && product.subcategory.toLowerCase().includes(selectedCategory.toLowerCase()));

      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesQuery && matchesCategory && matchesPrice;
    });
  }, [query, selectedCategory, priceRange, products]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setHighlightedIndex(-1);
      setShowFilters(false);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredProducts.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        handleProductClick(filteredProducts[highlightedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, highlightedIndex, filteredProducts, onClose]);

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product._id || product.id}`);
    onClose();
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setPriceRange([minPrice, maxPrice]);
  };

  const hasActiveFilters = selectedCategory !== "All" || priceRange[0] > minPrice || priceRange[1] < maxPrice;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-auto mt-20 w-full max-w-2xl px-4">
        <div className="rounded-2xl bg-background shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlightedIndex(-1);
              }}
              className="flex-1 border-0 bg-transparent text-lg focus-visible:ring-0 placeholder:text-muted-foreground/60"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "relative",
                showFilters && "bg-primary/10 text-primary"
              )}
            >
              <SlidersHorizontal className="h-5 w-5" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-gold" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="p-4 border-b border-border bg-muted/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Filters</span>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs h-7"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {["All", "Ethnic Wear", "Western Wear"].map((cat) => (
                    <Badge
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-primary/10"
                      )}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Price Range
                  </label>
                  <span className="text-sm font-medium">
                    ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                  </span>
                </div>
                <Slider
                  min={minPrice}
                  max={maxPrice}
                  step={500}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {filteredProducts.length > 0 ? (
              <div className="p-2">
                {filteredProducts.slice(0, 8).map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className={cn(
                      "w-full flex items-center gap-4 p-3 rounded-lg transition-all text-left",
                      highlightedIndex === index
                        ? "bg-primary/10"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{product.category}</span>
                        {product.subcategory && (
                          <>
                            <span>•</span>
                            <span>{product.subcategory}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-primary">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="block text-xs text-muted-foreground line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                {filteredProducts.length > 8 && (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    + {filteredProducts.length - 8} more results
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">No products found</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
              </span>
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] ml-1">↓</kbd>
                  <span className="ml-1">to navigate</span>
                </span>
                <span className="hidden sm:inline">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">Enter</kbd>
                  <span className="ml-1">to select</span>
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">Esc</kbd>
                  <span className="ml-1">to close</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
