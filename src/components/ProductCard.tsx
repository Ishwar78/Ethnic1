import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Product } from "@/data/products";
import QuickViewModal from "@/components/QuickViewModal";

interface ProductCardProps {
  product: Product;
  index?: number;
  showTrending?: boolean;
}

export default function ProductCard({ product, index = 0, showTrending = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      discount: product.discount,
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsQuickViewOpen(true);
  };

  // Get the second image for hover state, or use the main image if only one is available
  const hoverImage = product.images && product.images.length > 1 ? product.images[1] : product.image;
  const productId = product.id || product._id;

  return (
    <>
      <div
        className="group animate-fade-in"
        style={{ animationDelay: `${index * 50}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden rounded-lg bg-card shadow-soft group-hover:shadow-hover transition-all duration-500">
          <Link to={`/product/${productId}`} className="block relative aspect-[3/4] overflow-hidden">
            <img
              src={isHovered ? hoverImage : product.image}
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
              {product.isBestseller && showTrending && (
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">TRENDING</span>
              )}
              {product.isBestseller && !showTrending && (
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">BESTSELLER</span>
              )}
            </div>

            <div className={cn(
              "absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300",
              isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
            )}>
              <button
                onClick={handleToggleWishlist}
                className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md",
                  isWishlisted ? "bg-destructive text-destructive-foreground" : "bg-background text-foreground hover:bg-primary hover:text-primary-foreground"
                )}
              >
                <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
              </button>
              <button
                onClick={handleQuickView}
                className="h-9 w-9 rounded-full bg-background text-foreground hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300 shadow-md"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>

            <div className={cn(
              "absolute bottom-0 left-0 right-0 p-3 transition-all duration-300",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <Button variant="gold" className="w-full gap-2" onClick={handleAddToCart}>
                <ShoppingBag className="h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </Link>

          <div className="p-4">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{product.category}</span>
            <Link to={`/product/${productId}`}>
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

      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
