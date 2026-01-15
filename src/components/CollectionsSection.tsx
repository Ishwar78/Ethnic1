import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

const collections = [
  { name: "Diwali Sale 🔥", image: product5, href: "/shop?category=diwali-sale", badge: "Up to 50% Off" },
  { name: "Ethnic Wear", image: product1, href: "/shop?category=ethnic-wear" },
  { name: "Western Wear", image: product2, href: "/shop?category=western-wear" },
  { name: "Tops & Tees", image: product6, href: "/shop?category=tops" },
  { name: "Co-ord Sets", image: product3, href: "/shop?category=coord-sets" },
  { name: "Lehengas", image: product4, href: "/shop?category=lehengas" },
];

export default function CollectionsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-gold font-medium tracking-widest uppercase text-sm">
            Explore
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Shop by Collection
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Curated collections of handpicked ethnic wear for every occasion
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {collections.map((collection, index) => (
            <Link
              key={collection.name}
              to={collection.href}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                {/* Image Container */}
                <div className="relative w-full aspect-square rounded-full overflow-hidden border-4 border-transparent group-hover:border-gold transition-all duration-500 shadow-card group-hover:shadow-gold">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Badge */}
                {collection.badge && (
                  <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                    {collection.badge}
                  </span>
                )}
              </div>

              {/* Collection Name */}
              <h3 className="font-display text-lg font-semibold text-center mt-4 text-foreground group-hover:text-primary transition-colors">
                {collection.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
