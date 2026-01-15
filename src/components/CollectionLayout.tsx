import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Filter, Grid3X3, LayoutGrid } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Product, sizes, colors, sortOptions } from "@/data/products";

interface CollectionLayoutProps {
  title: string;
  subtitle?: string;
  tagline?: string;
  metaTitle: string;
  metaDescription: string;
  products: Product[];
  showTrending?: boolean;
  filterCategories?: string[];
  heroBg?: string;
}

export default function CollectionLayout({
  title,
  subtitle,
  tagline,
  metaTitle,
  metaDescription,
  products,
  showTrending = false,
  filterCategories = [],
  heroBg = "bg-muted/30",
}: CollectionLayoutProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState(showTrending ? "popularity" : "featured");

  const categories = ["All", ...filterCategories];

  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== "All" && product.subcategory !== selectedCategory && product.category !== selectedCategory) return false;
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    if (selectedSizes.length > 0 && !selectedSizes.some((s) => product.sizes.includes(s))) return false;
    if (selectedColors.length > 0 && !selectedColors.some((c) => product.colors.includes(c))) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "newest": return (a.isNew ? 0 : 1) - (b.isNew ? 0 : 1);
      case "popularity": return (a.isBestseller ? 0 : 1) - (b.isBestseller ? 0 : 1);
      default: return 0;
    }
  });

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-16">
          {/* Hero Banner */}
          <div className={cn("py-12 md:py-16", heroBg)}>
            <div className="container mx-auto px-4 text-center">
              <nav className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
                <Link to="/" className="hover:text-primary">Home</Link>
                <span>/</span>
                <span className="text-foreground">{title}</span>
              </nav>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg md:text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
                  {subtitle}
                </p>
              )}
              {tagline && (
                <p className="text-gold font-medium mt-4 text-lg tracking-wide">
                  {tagline}
                </p>
              )}
              <p className="text-muted-foreground mt-4">
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
                  {filterCategories.length > 0 && (
                    <div className="mb-8">
                      <h4 className="font-medium mb-4">Category</h4>
                      <div className="space-y-2">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                              "block w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                              selectedCategory === cat
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

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
                <div className={cn(
                  "grid gap-4 md:gap-6",
                  gridCols === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                )}>
                  {sortedProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} showTrending={showTrending} />
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
