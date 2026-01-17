import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { User, Mail, Phone, MapPin, Edit2, Save, X, Package, ShoppingBag, Calendar, Search, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserSidebar from "@/components/UserSidebar";
import UserCartSection from "@/components/UserCartSection";
import UserWishlistSection from "@/components/UserWishlistSection";
import SupportTicketForm from "@/components/SupportTicketForm";
import InvoiceDisplay from "@/components/InvoiceDisplay";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  processing: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  shipped: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
};

export default function UserDashboard() {
  const { user, logout, updateProfile, token, isLoading: authLoading } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [trackingError, setTrackingError] = useState("");
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }

    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      street: user.address?.street || "",
      city: user.address?.city || "",
      state: user.address?.state || "",
      zipCode: user.address?.zipCode || "",
      country: user.address?.country || "",
    });
  }, [user, navigate]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      });

      if (result.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    navigate("/");
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      setTrackingError("Please enter a tracking ID");
      return;
    }

    setIsTrackingLoading(true);
    setTrackingError("");
    setTrackedOrder(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${API_URL}/orders/track/${encodeURIComponent(trackingId)}`);
      const data = await response.json();

      if (!response.ok) {
        setTrackingError(data.error || "Order not found");
        return;
      }

      setTrackedOrder(data.order);
    } catch (error) {
      setTrackingError("Failed to fetch order details");
    } finally {
      setIsTrackingLoading(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[600px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-lg">Loading your dashboard...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center py-16">
              <h1 className="font-display text-2xl font-bold mb-4">Please Log In</h1>
              <p className="text-muted-foreground mb-8">
                You need to be logged in to view your dashboard.
              </p>
              <Button asChild>
                <Link to="/auth">Go to Login</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">My Orders</h2>
            {orders.length === 0 ? (
              <div className="bg-card rounded-2xl shadow-card border border-border p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-6">
                  When you place orders, they'll appear here.
                </p>
                <Button asChild variant="gold">
                  <a href="/shop">Start Shopping</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const orderId = order.id || order._id || "Unknown";
                  return (
                    <div
                      key={order._id || order.id}
                      className="bg-card rounded-xl shadow-card border border-border p-6 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold">Order #{orderId}</h3>
                            <Badge variant="outline" className={statusColors[order.status] || ""}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.createdAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">
                            ₹{(order.total || order.totalAmount || 0).toLocaleString("en-IN")}
                          </p>
                          <p className="text-sm text-muted-foreground">{order.items?.length || 0} items</p>
                        </div>
                      </div>

                      {/* Items Section */}
                      {order.items && order.items.length > 0 && (
                        <div className="bg-muted/30 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-sm mb-3 text-foreground">Order Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between text-sm">
                                <div>
                                  <span>{item.name} x {item.quantity}</span>
                                  {item.size && <span className="text-xs text-muted-foreground ml-2">(Size: {item.size})</span>}
                                  {item.color && <span className="text-xs text-muted-foreground ml-2">(Color: {item.color})</span>}
                                </div>
                                <span className="text-muted-foreground">
                                  ₹{item.price?.toLocaleString("en-IN") || "0"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Shipping Address Section */}
                      {order.shippingAddress && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-sm mb-3 text-foreground">Shipping Address</h4>
                          <div className="space-y-2 text-sm text-foreground">
                            {(order.shippingAddress.firstName || order.shippingAddress.name) && (
                              <p className="font-medium">
                                {order.shippingAddress.firstName && order.shippingAddress.lastName
                                  ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                                  : order.shippingAddress.name || ''}
                              </p>
                            )}
                            {order.shippingAddress.address && <p>{order.shippingAddress.address}</p>}
                            {order.shippingAddress.city && (
                              <p>
                                {order.shippingAddress.city}
                                {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                                {order.shippingAddress.pincode && ` ${order.shippingAddress.pincode}`}
                              </p>
                            )}
                            {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                          </div>
                        </div>
                      )}

                      {/* Tracking ID Section */}
                      {order.trackingId && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Tracking ID</p>
                              <p className="font-mono text-sm font-bold text-foreground">{order.trackingId}</p>
                            </div>
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              <Link to={`/track-order?id=${order.trackingId}`}>
                                Track Order
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* View Invoice Button */}
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => {
                          setSelectedOrderForInvoice(order._id || order.id);
                          setShowInvoice(true);
                        }}
                        className="w-full"
                      >
                        View Invoice
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "wishlist":
        return <UserWishlistSection />;

      case "cart":
        return <UserCartSection />;

      case "support":
        return <SupportTicketForm />;

      case "track":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Track Order</h2>
            <div className="bg-card rounded-2xl shadow-card border border-border p-8">
              <form onSubmit={handleTrackOrder} className="mb-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Enter Tracking ID
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="e.g., INV-1234567890-ABCD"
                          value={trackingId}
                          onChange={(e) => setTrackingId(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <Button type="submit" variant="gold" disabled={isTrackingLoading}>
                        {isTrackingLoading ? "Tracking..." : "Track"}
                      </Button>
                    </div>
                    {trackingError && <p className="text-sm text-destructive mt-2">{trackingError}</p>}
                  </div>
                </div>
              </form>

              {trackedOrder && (
                <div className="space-y-6">
                  {/* Order Tracking Timeline */}
                  <div className="bg-muted/30 rounded-lg p-6">
                    <h4 className="font-semibold text-sm mb-6 text-foreground">Order Timeline</h4>
                    <div className="relative">
                      {/* Timeline visualization */}
                      <div className="space-y-4">
                        {[
                          { status: 'pending', label: 'Order Placed', icon: '📦' },
                          { status: 'confirmed', label: 'Confirmed', icon: '✓' },
                          { status: 'processing', label: 'Processing', icon: '⚙' },
                          { status: 'shipped', label: 'Shipped', icon: '🚚' },
                          { status: 'delivered', label: 'Delivered', icon: '✓' },
                        ].map((step, index, arr) => {
                          const isActive = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'].indexOf(trackedOrder.status?.toLowerCase() || 'pending') >= index;
                          return (
                            <div key={step.status} className="flex items-start gap-4">
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0 ${
                                isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                              }`}>
                                {step.icon}
                              </div>
                              <div className="flex-1 pt-1">
                                <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {step.label}
                                </p>
                              </div>
                              {index < arr.length - 1 && (
                                <div className={`absolute left-4 top-10 w-0.5 h-12 ${
                                  isActive ? 'bg-primary' : 'bg-muted'
                                }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Order Status Card */}
                  <div className="bg-muted/30 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Current Status</p>
                        <p className="text-2xl font-bold text-foreground">
                          {trackedOrder.status?.charAt(0).toUpperCase() + (trackedOrder.status?.slice(1) || '')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-primary">
                          ₹{(trackedOrder.totalAmount || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {trackedOrder.items && trackedOrder.items.length > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                      <h4 className="font-semibold text-sm mb-4 text-foreground">Order Items</h4>
                      <div className="space-y-3">
                        {trackedOrder.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <div>
                              <p className="font-medium">{item.name} x {item.quantity}</p>
                              {item.size && <p className="text-xs text-muted-foreground">(Size: {item.size})</p>}
                              {item.color && <p className="text-xs text-muted-foreground">(Color: {item.color})</p>}
                            </div>
                            <span className="text-foreground font-semibold">
                              ₹{(item.price || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {trackedOrder.shippingAddress && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                      <h4 className="font-semibold text-sm mb-4 text-foreground">Shipping Address</h4>
                      <div className="space-y-2 text-sm text-foreground">
                        {trackedOrder.shippingAddress.name && (
                          <p className="font-medium">{trackedOrder.shippingAddress.name}</p>
                        )}
                        {trackedOrder.shippingAddress.street && (
                          <p>{trackedOrder.shippingAddress.street}</p>
                        )}
                        {(trackedOrder.shippingAddress.city || trackedOrder.shippingAddress.state) && (
                          <p>
                            {trackedOrder.shippingAddress.city}
                            {trackedOrder.shippingAddress.city && trackedOrder.shippingAddress.state ? ', ' : ''}
                            {trackedOrder.shippingAddress.state}
                            {trackedOrder.shippingAddress.zipCode && ` ${trackedOrder.shippingAddress.zipCode}`}
                          </p>
                        )}
                        {trackedOrder.shippingAddress.phone && (
                          <p>Phone: {trackedOrder.shippingAddress.phone}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Order Date</p>
                        <p className="font-medium">
                          {new Date(trackedOrder.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Payment Method</p>
                        <p className="font-medium">
                          {trackedOrder.paymentMethod?.charAt(0).toUpperCase() + (trackedOrder.paymentMethod?.slice(1) || '')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-card rounded-2xl shadow-card border border-border p-8">
            {isEditing ? (
              <>
                <h3 className="font-display text-2xl font-bold mb-6">Edit Profile</h3>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="pt-4">
                    <h4 className="font-semibold mb-4">Address</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          name="street"
                          placeholder="123 Main Street"
                          value={formData.street}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">Zip Code</Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex gap-3">
                    <Button variant="gold" className="flex-1" onClick={handleSaveProfile} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-2xl font-bold">Profile Information</h3>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </label>
                    <p className="text-lg">{user.name}</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </label>
                    <p className="text-lg">{user.email}</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </label>
                    <p className="text-lg">{user.phone || "Not provided"}</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </label>
                    {user.address && (user.address.street || user.address.city) ? (
                      <div className="text-lg space-y-1">
                        {user.address.street && <p>{user.address.street}</p>}
                        <p>
                          {user.address.city && `${user.address.city}, `}
                          {user.address.state && `${user.address.state} `}
                          {user.address.zipCode}
                        </p>
                        {user.address.country && <p>{user.address.country}</p>}
                      </div>
                    ) : (
                      <p className="text-lg text-muted-foreground">Not provided</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </label>
                    <p className="text-lg">
                      {user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Not available"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>My Dashboard | Vasstra</title>
        <meta name="description" content="Manage your Vasstra account and view orders" />
      </Helmet>

      <Header />

      {/* Invoice Display */}
      {selectedOrderForInvoice && (
        <InvoiceDisplay
          orderId={selectedOrderForInvoice}
          open={showInvoice}
          onOpenChange={setShowInvoice}
          token={token}
        />
      )}

      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">My Dashboard</h1>
            <p className="text-muted-foreground text-lg">Manage your account, orders, and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <UserSidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onLogout={handleLogout}
              />
            </div>

            <div className="lg:col-span-3">{renderContent()}</div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
