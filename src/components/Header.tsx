import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown, ChevronRight, User, LogOut, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { ethnicSubcategories, westernSubcategories } from "@/data/products";
import SearchModal from "@/components/SearchModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuItem {
  name: string;
  href: string;
  submenu?: { name: string; href: string }[];
}

const menuItems: MenuItem[] = [
  { name: "Home", href: "/" },
  { name: "Bestsellers", href: "/bestsellers" },
  { name: "New Arrivals", href: "/new-arrivals" },
  { 
    name: "Ethnic Wear", 
    href: "/ethnic-wear",
    submenu: ethnicSubcategories
  },
  { 
    name: "Western Wear", 
    href: "/western-wear",
    submenu: westernSubcategories
  },
  { name: "Summer Collection", href: "/summer-collection" },
  { name: "Winter Wear", href: "/winter-wear" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { totalItems: wishlistItems } = useWishlist();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setExpandedMobileMenu(null);
  }, [location.pathname]);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-soft py-2"
            : "bg-transparent py-4"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-2xl md:text-3xl font-bold text-primary tracking-wide">
                Vasstra
              </span>
              <span className="hidden sm:block text-gold text-xs font-body tracking-widest uppercase">
                Ethnic Elegance
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.submenu && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "font-body text-sm font-medium px-4 py-2 rounded-md transition-all relative group flex items-center gap-1",
                      isActive(item.href)
                        ? "text-primary bg-primary/5"
                        : "text-foreground/80 hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    {item.name}
                    {item.submenu && (
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        activeDropdown === item.name && "rotate-180"
                      )} />
                    )}
                    {isActive(item.href) && (
                      <span className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gold" />
                    )}
                  </Link>

                  {/* Mega Dropdown */}
                  {item.submenu && (
                    <div
                      className={cn(
                        "absolute top-full left-0 mt-1 w-64 bg-background rounded-lg shadow-card border border-border overflow-hidden transition-all duration-200 origin-top",
                        activeDropdown === item.name
                          ? "opacity-100 scale-100 visible"
                          : "opacity-0 scale-95 invisible"
                      )}
                    >
                      <div className="p-2">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.name}
                            to={subitem.href}
                            className="flex items-center justify-between px-4 py-3 rounded-md text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors"
                          >
                            {subitem.name}
                            <ChevronRight className="h-4 w-4 opacity-50" />
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-border p-3">
                        <Link
                          to={item.href}
                          className="block text-center text-sm font-medium text-primary hover:underline"
                        >
                          View All {item.name}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="hidden sm:flex relative">
                  <Heart className="h-5 w-5" />
                  {wishlistItems > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                      {wishlistItems > 99 ? "99+" : wishlistItems}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Account */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden sm:flex">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        My Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="cursor-pointer">
                        <Package className="h-4 w-4 mr-2" />
                        Order History
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/track-order" className="cursor-pointer">
                        <Truck className="h-4 w-4 mr-2" />
                        Track Order
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wishlist" className="cursor-pointer">
                        <Heart className="h-4 w-4 mr-2" />
                        My Wishlist
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="cursor-pointer">
                            <span className="h-4 w-4 mr-2 flex items-center justify-center text-xs font-bold">⚙️</span>
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="icon" className="hidden sm:flex">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}

              <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gold text-charcoal text-xs font-bold flex items-center justify-center">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-500",
          isMobileMenuOpen ? "visible" : "invisible"
        )}
      >
        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-charcoal/50 backdrop-blur-sm transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-background shadow-2xl transition-transform duration-500 ease-out overflow-y-auto",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full pt-20 pb-8 px-6">
            <nav className="flex flex-col gap-1">
              {menuItems.map((item, index) => (
                <div
                  key={item.name}
                  className={cn(
                    "opacity-0 translate-x-8",
                    isMobileMenuOpen && "animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() => setExpandedMobileMenu(
                          expandedMobileMenu === item.name ? null : item.name
                        )}
                        className={cn(
                          "w-full flex items-center justify-between font-display text-xl py-3 border-b border-border transition-all",
                          isActive(item.href) ? "text-primary" : "text-foreground hover:text-primary"
                        )}
                      >
                        {item.name}
                        <ChevronDown className={cn(
                          "h-5 w-5 transition-transform duration-200",
                          expandedMobileMenu === item.name && "rotate-180"
                        )} />
                      </button>

                      {/* Accordion Content */}
                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-300",
                          expandedMobileMenu === item.name ? "max-h-96" : "max-h-0"
                        )}
                      >
                        <div className="py-2 pl-4 space-y-1">
                          {item.submenu.map((subitem) => (
                            <Link
                              key={subitem.name}
                              to={subitem.href}
                              className="block py-2 text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {subitem.name}
                            </Link>
                          ))}
                          <Link
                            to={item.href}
                            className="block py-2 text-primary font-medium"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            View All →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={cn(
                        "font-display text-xl py-3 border-b border-border block transition-all",
                        isActive(item.href) ? "text-primary" : "text-foreground hover:text-primary"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            <div className="mt-auto space-y-4 pt-8">
              {/* User Info for Mobile */}
              {user ? (
                <div className="p-4 bg-muted/50 rounded-lg mb-4">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  <div className="flex gap-2 mt-3">
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <User className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Package className="h-4 w-4" />
                        Orders
                      </Button>
                    </Link>
                    <Link to="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Truck className="h-4 w-4" />
                        Track
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full gap-2 mb-4">
                    <User className="h-5 w-5" />
                    Sign In / Sign Up
                  </Button>
                </Link>
              )}

              <div className="flex gap-4">
                <Button variant="ghost" size="icon" onClick={() => { setIsMobileMenuOpen(false); setIsSearchOpen(true); }}>
                  <Search className="h-5 w-5" />
                </Button>
                <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" size="icon" className="relative">
                    <Heart className="h-5 w-5" />
                    {wishlistItems > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                        {wishlistItems}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>

              {/* Sticky Cart Button for Mobile */}
              <Button 
                variant="gold" 
                className="w-full gap-2"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
              >
                <ShoppingBag className="h-5 w-5" />
                View Cart {totalItems > 0 && `(${totalItems})`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
