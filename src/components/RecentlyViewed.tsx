import { useRef } from "react";
import { Link } from "react-router-dom";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RecentlyViewedItem } from "@/hooks/useRecentlyViewed";

interface RecentlyViewedProps {
  items: RecentlyViewedItem[];
}

export default function RecentlyViewed({ items }: RecentlyViewedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-display text-2xl font-bold text-foreground">
              Recently Viewed
            </h2>
          </div>
          <div className="hidden sm:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Horizontal Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item, index) => {
            const itemKey = item.id || `recently-viewed-${index}-${item.name}`;
            return (
            <Link
              key={itemKey}
              to={`/product/${item.id}`}
              className={cn(
                "flex-shrink-0 w-[180px] group animate-fade-in snap-start",
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300">
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {item.discount > 0 && (
                    <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-1.5 py-0.5 rounded">
                      -{item.discount}%
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-primary text-sm">
                      ₹{item.price.toLocaleString()}
                    </span>
                    {item.originalPrice > item.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{item.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
            );
          })}
        </div>

        {/* Mobile Navigation */}
        <div className="flex sm:hidden justify-center gap-4 mt-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-9 w-9"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-9 w-9"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
