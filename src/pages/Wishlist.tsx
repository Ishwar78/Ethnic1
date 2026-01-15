import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      category: item.category,
    });
  };

  const handleMoveToCart = (item: typeof items[0]) => {
    handleAddToCart(item);
    removeFromWishlist(item.id);
  };

  return (
    <>
      <Helmet>
        <title>My Wishlist | Vasstra - Ethnic Fashion</title>
        <meta name="description" content="View your saved items and favorite products at Vasstra." />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Wishlist</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-primary fill-primary/20" />
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                My Wishlist
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              {items.length > 0 
                ? `You have ${items.length} item${items.length > 1 ? 's' : ''} saved`
                : "Your wishlist is empty"
              }
            </p>
          </div>

          {items.length === 0 ? (
            /* Empty State */
            <div className="max-w-md mx-auto text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-12 w-12 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                Your wishlist is empty
              </h2>
              <p className="text-muted-foreground mb-8">
                Start adding items you love to your wishlist. They'll appear here for easy access.
              </p>
              <Link to="/shop">
                <Button variant="gold" size="lg" className="gap-2">
                  Explore Products
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            /* Wishlist Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="group bg-card rounded-lg shadow-soft overflow-hidden animate-fade-in hover:shadow-hover transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image */}
                  <Link to={`/product/${item.id}`} className="block relative aspect-[3/4] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.discount > 0 && (
                      <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                        -{item.discount}%
                      </span>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="p-4">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {item.category}
                    </span>
                    <Link to={`/product/${item.id}`}>
                      <h3 className="font-display text-lg font-semibold text-foreground mt-1 group-hover:text-primary transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-display text-xl font-bold text-primary">
                        ₹{item.price.toLocaleString()}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{item.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="gold"
                        className="flex-1 gap-2"
                        onClick={() => handleMoveToCart(item)}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Move to Cart
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Continue Shopping */}
          {items.length > 0 && (
            <div className="text-center mt-12">
              <Link to="/shop">
                <Button variant="outline" size="lg" className="gap-2">
                  Continue Shopping
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
