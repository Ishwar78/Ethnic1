import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Heart, Share2, Truck, Shield, RotateCcw, Minus, Plus, ChevronRight, Star, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ReviewForm, { Review } from "@/components/ReviewForm";
import ProductImageGallery from "@/components/ProductImageGallery";
import RelatedProducts from "@/components/RelatedProducts";
import RecentlyViewed from "@/components/RecentlyViewed";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { getStoredReviews, saveReview } from "@/lib/reviews";
import { Product } from "@/data/products";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Color name to hex mapping
const colorMap: { [key: string]: string } = {
  'Red': '#DC2626',
  'Blue': '#1E3A8A',
  'Green': '#059669',
  'Yellow': '#EAB308',
  'Pink': '#EC4899',
  'Purple': '#7C3AED',
  'Orange': '#EA580C',
  'Black': '#000000',
  'White': '#FFFFFF',
  'Gray': '#6B7280',
  'Brown': '#92400E',
  'Burgundy': '#722F37',
  'Maroon': '#800000',
  'Ivory': '#FFFFF0',
  'Teal': '#0D9488',
  'Gold': '#FBBF24',
  'Silver': '#D1D5DB',
  'Navy': '#001F3F',
  'Khaki': '#F0E68C',
  'Beige': '#F5F5DC',
};

function getColorHex(colorName: string): string | null {
  // Try exact match first
  if (colorMap[colorName]) {
    return colorMap[colorName];
  }

  // Try case-insensitive match
  const lowerName = colorName.toLowerCase();
  for (const [key, value] of Object.entries(colorMap)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }

  return null;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToRecentlyViewed, getRecentlyViewed } = useRecentlyViewed();

  const [product, setProduct] = useState<Product | null>(null);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [sizeChart, setSizeChart] = useState<any>(null);
  const [isSizeChartLoading, setIsSizeChartLoading] = useState(false);

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsProductLoading(true);
        const response = await fetch(`${API_URL}/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          const fetchedProduct = data.product;
          setProduct(fetchedProduct);
          addToRecentlyViewed(fetchedProduct);

          // Fetch related products
          fetchRelatedProducts(fetchedProduct);
        } else {
          navigate('/shop');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/shop');
      } finally {
        setIsProductLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate, addToRecentlyViewed]);

  // Fetch related products
  const fetchRelatedProducts = async (currentProduct: Product) => {
    try {
      const response = await fetch(`${API_URL}/products?limit=20`);
      if (response.ok) {
        const data = await response.json();
        const products = data.products || [];

        // Calculate relevance score and sort
        const scoredProducts = products
          .filter((p: Product) => p._id !== currentProduct._id)
          .map((product: Product) => {
            let score = 0;

            if (product.category === currentProduct.category) score += 50;
            if (product.subcategory === currentProduct.subcategory) score += 40;

            const priceRange = currentProduct.price * 0.2;
            if (product.price >= currentProduct.price - priceRange &&
                product.price <= currentProduct.price + priceRange) {
              score += 20;
            }

            if (product.isBestseller) score += 5;
            if (product.isNew) score += 5;

            return { product, score };
          })
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 4)
          .map(({ product }) => product);

        setRelatedProducts(scoredProducts);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  // Get recently viewed (excluding current product)
  const recentlyViewedItems = product ? getRecentlyViewed(product._id || product.id, 4) : [];

  // Check if wishlisted
  const isWishlisted = product ? isInWishlist(product._id || product.id) : false;

  // Load reviews on mount
  useEffect(() => {
    if (product) {
      const productId = product._id || product.id;
      const storedReviews = getStoredReviews(productId as any);
      setReviews(storedReviews);
    }
  }, [product]);

  // Reset state when product changes
  useEffect(() => {
    setSelectedSize(null);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Fetch size chart when dialog opens
  useEffect(() => {
    if (isSizeChartOpen && !sizeChart && product) {
      fetchSizeChart();
    }
  }, [isSizeChartOpen, product]);

  const fetchSizeChart = async () => {
    try {
      setIsSizeChartLoading(true);
      const productId = product?._id || product?.id;
      if (!productId) {
        setSizeChart(null);
        return;
      }

      const response = await fetch(`${API_URL}/size-charts/product/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setSizeChart(data.sizeChart || null);
      }
    } catch (error) {
      console.error('Error fetching size chart:', error);
      setSizeChart(null);
    } finally {
      setIsSizeChartLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const handleReviewSubmitted = (newReview: Review) => {
    saveReview(newReview);
    setReviews((prev) => [newReview, ...prev]);
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Check if color is required and selected
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    addToCart(
      {
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        category: product.category,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Check if color is required and selected
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    addToCart(
      {
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        category: product.category,
      },
      quantity
    );
    navigate("/checkout");
  };

  const handleToggleWishlist = () => {
    if (!product) return;

    toggleWishlist({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      discount: product.discount || 0,
    });
  };

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  // Get breadcrumb category link
  const getCategoryLink = () => {
    if (!product) return "/shop";
    const categoryLower = (product.category || '').toLowerCase();
    if (categoryLower.includes('ethnic')) return "/ethnic-wear";
    if (categoryLower.includes('western')) return "/western-wear";
    return "/shop";
  };

  if (isProductLoading) {
    return (
      <>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="pt-24 pb-16">
            <div className="container mx-auto px-4 py-16">
              <div className="flex items-center justify-center min-h-[600px]">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">Loading product details...</p>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="pt-24 pb-16">
            <div className="container mx-auto px-4 py-16">
              <div className="text-center">
                <h1 className="font-display text-3xl font-bold text-foreground mb-4">Product Not Found</h1>
                <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.name} | Vasstra - Premium Ethnic Fashion</title>
        <meta name="description" content={`Buy ${product.name} at ₹${product.price}. Premium quality ${product.category.toLowerCase()} with free shipping. Shop now at Vasstra!`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description || product.name,
            "image": product.image,
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": averageRating.toFixed(1),
              "reviewCount": reviews.length
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-16">
          {/* Breadcrumb */}
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
              <Link to={getCategoryLink()} className="hover:text-primary transition-colors">
                {product.category}
              </Link>
              {product.subcategory && (
                <>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  <span className="text-muted-foreground">{product.subcategory}</span>
                </>
              )}
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
              <span className="text-foreground line-clamp-1">{product.name}</span>
            </nav>
          </div>

          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Image Gallery */}
              <ProductImageGallery
                images={product.images && product.images.length > 0 ? product.images : [product.image]}
                productName={product.name}
                discount={product.discount || 0}
              />

              {/* Product Info */}
              <div className="space-y-6">
                {/* Category & Name */}
                <div>
                  <span className="text-gold font-medium text-sm uppercase tracking-wider">
                    {product.category}
                    {product.subcategory && ` • ${product.subcategory}`}
                    {product.isNew && ' • NEW'}
                    {product.isBestseller && ' • BESTSELLER'}
                  </span>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
                    {product.name}
                  </h1>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-5 w-5",
                            star <= Math.round(averageRating)
                              ? "text-gold fill-gold"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground text-sm">
                      ({reviews.length} reviews)
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-display text-4xl font-bold text-primary">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-sm font-medium text-destructive bg-destructive/10 px-2 py-1 rounded">
                        Save ₹{(product.originalPrice - product.price).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>

                {/* Availability Status */}
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-sm font-medium text-green-600">In Stock</span>
                </div>

                {/* Size Selector */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Select Size</h3>
                      <button
                        onClick={() => setIsSizeChartOpen(true)}
                        className="text-sm text-primary hover:underline transition-colors"
                      >
                        Size Guide
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "h-12 min-w-[48px] px-4 rounded-md border-2 font-medium transition-all",
                            selectedSize === size
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Available Colors</h3>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className="flex flex-col items-center gap-2 group transition-all"
                          title={color}
                        >
                          <div
                            className={cn(
                              "h-12 w-12 rounded-full border-2 transition-all",
                              selectedColor === color
                                ? "border-primary ring-2 ring-primary ring-offset-2 scale-110"
                                : "border-border group-hover:border-primary"
                            )}
                            style={{
                              backgroundColor: getColorHex(color) || '#cccccc',
                            }}
                          />
                          <span className={cn(
                            "text-xs text-center max-w-[60px] truncate font-medium transition-colors",
                            selectedColor === color
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}>
                            {color}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <h3 className="font-medium mb-3">Quantity</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-12 w-12 flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                        className="h-12 w-12 flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <Button variant="gold" size="xl" className="flex-1 gap-2" onClick={handleAddToCart}>
                      <ShoppingBag className="h-5 w-5" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-14 w-14 flex-shrink-0"
                      onClick={handleToggleWishlist}
                    >
                      <Heart className={cn("h-5 w-5", isWishlisted && "fill-destructive text-destructive")} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-14 w-14 flex-shrink-0">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button variant="hero" size="xl" className="w-full" onClick={handleBuyNow}>
                    Buy It Now
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-3 gap-4 py-6 border-y border-border">
                  <div className="flex flex-col items-center text-center">
                    <Truck className="h-6 w-6 text-gold mb-2" />
                    <span className="text-sm font-medium">Free Shipping</span>
                    <span className="text-xs text-muted-foreground">Above ₹999</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Shield className="h-6 w-6 text-gold mb-2" />
                    <span className="text-sm font-medium">Secure Payment</span>
                    <span className="text-xs text-muted-foreground">100% Safe</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <RotateCcw className="h-6 w-6 text-gold mb-2" />
                    <span className="text-sm font-medium">Easy Returns</span>
                    <span className="text-xs text-muted-foreground">7 Days</span>
                  </div>
                </div>

                {/* Policy Notice */}
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Note:</span> No Return | No Exchange | No COD
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="mt-16">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 overflow-x-auto">
                <TabsTrigger
                  value="description"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
                >
                  Reviews ({reviews.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-8">
                <div className="max-w-3xl">
                  {product.description ? (
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {product.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No detailed description available. Please contact us for more information.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Reviews Summary */}
                  <div className="lg:col-span-1">
                    <div className="bg-card rounded-xl p-6 shadow-soft sticky top-28">
                      <div className="text-center mb-6">
                        <div className="font-display text-5xl font-bold text-foreground">
                          {averageRating.toFixed(1)}
                        </div>
                        <div className="flex justify-center gap-0.5 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "h-5 w-5",
                                star <= Math.round(averageRating)
                                  ? "text-gold fill-gold"
                                  : "text-muted-foreground"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Based on {reviews.length} reviews
                        </p>
                      </div>

                      {/* Rating Distribution */}
                      <div className="space-y-2">
                        {ratingDistribution.map(({ star, count, percentage }) => (
                          <div key={star} className="flex items-center gap-3">
                            <span className="text-sm w-3">{star}</span>
                            <Star className="h-4 w-4 text-gold fill-gold" />
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gold rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-8">
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reviews List & Form */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Review Form */}
                    <ReviewForm productId={product._id || product.id || '0'} onReviewSubmitted={handleReviewSubmitted} />

                    {/* Reviews List */}
                    <div className="space-y-6">
                      <h3 className="font-display text-xl font-semibold">
                        Customer Reviews ({reviews.length})
                      </h3>
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-border pb-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-medium text-primary">
                                  {review.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">{review.name}</span>
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={cn(
                                        "h-4 w-4",
                                        star <= review.rating
                                          ? "text-gold fill-gold"
                                          : "text-muted-foreground"
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <p className="text-muted-foreground mt-3">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <RelatedProducts
                products={relatedProducts}
                title="You May Also Like"
                subtitle="Similar styles you'll love"
              />
            </div>
          )}

          {/* Recently Viewed */}
          {recentlyViewedItems.length > 0 && (
            <RecentlyViewed items={recentlyViewedItems} />
          )}
        </main>

        {/* Mobile Sticky Add to Cart */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 lg:hidden z-40">
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="font-display text-lg font-bold text-primary">
                ₹{product.price.toLocaleString()}
              </p>
              {product.originalPrice > product.price && (
                <p className="text-xs text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </p>
              )}
            </div>
            <Button variant="gold" className="flex-1 gap-2" onClick={handleAddToCart}>
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>

        <Footer />
        <WhatsAppButton />
      </div>

      {/* Size Chart Modal */}
      <Dialog open={isSizeChartOpen} onOpenChange={setIsSizeChartOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Size Chart - {product.name}</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {isSizeChartLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin">⏳</div>
                <span className="ml-2 text-muted-foreground">Loading size chart...</span>
              </div>
            ) : sizeChart && sizeChart.sizes && sizeChart.sizes.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Measurements in {sizeChart.unit}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border px-4 py-2 text-left font-semibold">Size</th>
                        {sizeChart.sizes[0]?.measurements.map((m: any, i: number) => (
                          <th
                            key={i}
                            className="border border-border px-4 py-2 text-left font-semibold"
                          >
                            {m.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChart.sizes.map((size: any, sizeIndex: number) => (
                        <tr
                          key={sizeIndex}
                          className={sizeIndex % 2 === 0 ? "bg-background" : "bg-muted/30"}
                        >
                          <td className="border border-border px-4 py-3 font-semibold">
                            {size.label}
                          </td>
                          {size.measurements.map((m: any, mIndex: number) => (
                            <td
                              key={mIndex}
                              className="border border-border px-4 py-3"
                            >
                              {m.value} {sizeChart.unit}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-sm text-muted-foreground mt-4 p-3 bg-muted/30 rounded">
                  <p className="font-semibold mb-1">How to measure:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Chest: Measure across the bust at the fullest point</li>
                    <li>Waist: Measure at the natural waistline</li>
                    <li>Length: Measure from shoulder to desired hemline</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">📏 Size chart not available for this product yet.</p>
                <p className="text-sm">
                  Please refer to the product description or contact us for sizing information.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
