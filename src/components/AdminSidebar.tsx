import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  Sparkles,
  Shirt,
  Sun,
  Snowflake,
  Phone,
  Users,
  Package,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Layers,
  Tag,
  Image as ImageIcon,
  Ticket,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarItem {
  title: string;
  icon: React.ElementType;
  href?: string;
  items?: { title: string; href: string }[];
}

const frontendPages: SidebarItem[] = [
  { title: "Home", icon: Home, href: "/" },
  { title: "Bestsellers", icon: Sparkles, href: "/bestsellers" },
  { title: "New Arrivals", icon: Tag, href: "/new-arrivals" },
  {
    title: "Ethnic Wear",
    icon: Shirt,
    items: [
      { title: "All Ethnic Wear", href: "/ethnic-wear" },
      { title: "Kurta Sets", href: "/ethnic-wear/kurta-sets" },
      { title: "Anarkali Suits", href: "/ethnic-wear/anarkali-suits" },
      { title: "Lehengas", href: "/ethnic-wear/lehengas" },
      { title: "Party Wear", href: "/ethnic-wear/party-wear" },
      { title: "Festive Collection", href: "/ethnic-wear/festive-collection" },
    ],
  },
  {
    title: "Western Wear",
    icon: Layers,
    items: [
      { title: "All Western Wear", href: "/western-wear" },
      { title: "Tops & Tees", href: "/western-wear/tops-tees" },
      { title: "Dresses", href: "/western-wear/dresses" },
      { title: "Co-ord Sets", href: "/western-wear/coord-sets" },
      { title: "Casual Wear", href: "/western-wear/casual-wear" },
    ],
  },
  { title: "Summer Collection", icon: Sun, href: "/summer-collection" },
  { title: "Winter Wear", icon: Snowflake, href: "/winter-wear" },
  { title: "Contact", icon: Phone, href: "/contact" },
];

const adminSections: SidebarItem[] = [
  { title: "Overview", icon: BarChart3, href: "/admin?tab=overview" },
  { title: "Hero Slider", icon: Film, href: "/admin?tab=hero-media" },
  { title: "Products", icon: ShoppingBag, href: "/admin?tab=products" },
  { title: "Categories", icon: Layers, href: "/admin?tab=categories" },
  { title: "Coupons", icon: Ticket, href: "/admin?tab=coupons" },
  { title: "Banners", icon: ImageIcon, href: "/admin?tab=banners" },
  { title: "Users", icon: Users, href: "/admin?tab=users" },
  { title: "Orders", icon: Package, href: "/admin?tab=orders" },
  { title: "Tickets", icon: Phone, href: "/admin?tab=tickets" },
  { title: "Contact", icon: Phone, href: "/admin?tab=contact" },
  { title: "Settings", icon: Settings, href: "/admin?tab=settings" },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const location = useLocation();
  const { token } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  // Fetch new orders count (confirmed status)
  useEffect(() => {
    const fetchNewOrdersCount = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/orders/count/pending`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setPendingOrderCount(data.pendingCount || 0);
        }
      } catch (error) {
        console.error('Error fetching new orders count:', error);
      }
    };

    if (token) {
      fetchNewOrdersCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchNewOrdersCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token, API_URL]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href.includes("?")) {
      return location.pathname + location.search === href;
    }
    return location.pathname === href;
  };

  return (
    <aside
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        {!collapsed && (
          <h2 className="text-lg font-bold text-primary">Admin Panel</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-6">
          {/* Admin Sections */}
          <div>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                Dashboard
              </h3>
            )}
            <nav className="space-y-1">
              {adminSections.map((item) => (
                <Link
                  key={item.title}
                  to={item.href || "#"}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.href || "")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span>{item.title}</span>
                      {item.title === "Orders" && pendingOrderCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-auto h-5 min-w-5 flex items-center justify-center px-1.5"
                        >
                          {pendingOrderCount}
                        </Badge>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <Separator />

          {/* Frontend Pages */}
          <div>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                Frontend Pages
              </h3>
            )}
            <nav className="space-y-1">
              {frontendPages.map((item) => (
                <div key={item.title}>
                  {item.items ? (
                    <>
                      <button
                        onClick={() => toggleExpand(item.title)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground",
                          expandedItems.includes(item.title) && "bg-muted/50"
                        )}
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{item.title}</span>
                            <ChevronRight
                              className={cn(
                                "h-4 w-4 transition-transform",
                                expandedItems.includes(item.title) && "rotate-90"
                              )}
                            />
                          </>
                        )}
                      </button>
                      {!collapsed && expandedItems.includes(item.title) && (
                        <div className="ml-8 mt-1 space-y-1">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.href}
                              to={subItem.href}
                              target="_blank"
                              className={cn(
                                "block px-3 py-1.5 rounded-md text-sm transition-colors",
                                isActive(subItem.href)
                                  ? "text-primary font-medium"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.href || "#"}
                      target="_blank"
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive(item.href || "")
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Vasstra Admin v1.0
          </p>
        </div>
      )}
    </aside>
  );
}
