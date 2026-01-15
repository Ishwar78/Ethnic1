import { Link, useLocation } from "react-router-dom";
import { User, Package, Heart, ShoppingCart, Ticket, LogOut, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

interface SidebarLink {
  title: string;
  icon: React.ElementType;
  tab: string;
  badge?: number;
}

interface UserSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export default function UserSidebar({ activeTab, onTabChange, onLogout }: UserSidebarProps) {
  const { user } = useAuth();
  const { totalItems: cartItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();

  const links: SidebarLink[] = [
    { title: "Profile", icon: User, tab: "profile" },
    { title: "My Orders", icon: Package, tab: "orders" },
    { title: "Track Order", icon: Truck, tab: "track" },
    { title: "Wishlist", icon: Heart, tab: "wishlist", badge: wishlistItems },
    { title: "Cart", icon: ShoppingCart, tab: "cart", badge: cartItems },
    { title: "Support", icon: Ticket, tab: "support" },
  ];

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border p-6 sticky top-24">
      {/* User Info */}
      <div className="text-center mb-6 pb-6 border-b border-border">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <User className="h-10 w-10 text-primary" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">{user?.name}</h2>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 mb-6">
        {links.map((link) => (
          <button
            key={link.tab}
            onClick={() => onTabChange(link.tab)}
            className={cn(
              "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              activeTab === link.tab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <link.icon className="h-5 w-5" />
              <span>{link.title}</span>
            </div>
            {link.badge !== undefined && link.badge > 0 && (
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  activeTab === link.tab
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/10 text-primary"
                )}
              >
                {link.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </div>
  );
}
