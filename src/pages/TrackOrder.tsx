import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Search, Truck, MapPin, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface TrackingUpdate {
  status: string;
  message: string;
  location: string;
  timestamp: string;
}

interface OrderDetails {
  _id: string;
  trackingId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  estimatedDelivery?: string;
  trackingUpdates?: TrackingUpdate[];
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
  shippingAddress: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
  };
  paymentMethod: string;
}

const statusSteps = [
  { key: 'confirmed', label: 'Order Confirmed', icon: '✓' },
  { key: 'shipped', label: 'Shipped', icon: '📦' },
  { key: 'delivered', label: 'Delivered', icon: '✓' }
];

const statusColors: Record<string, string> = {
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  processing: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  shipped: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState("");
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Auto-track order if tracking ID is provided in URL
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setTrackingId(idFromUrl);
      handleTrackAuto(idFromUrl);
    }
  }, []);

  const handleTrackAuto = async (id: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/orders/track/${encodeURIComponent(id)}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Order not found");
        setOrder(null);
        return;
      }

      setOrder(data.order);
    } catch (err) {
      const errorMsg = "Failed to fetch order details";
      setError(errorMsg);
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingId.trim()) {
      setError("Please enter a tracking ID");
      return;
    }

    await handleTrackAuto(trackingId);
  };

  const getStatusProgress = (status: string) => {
    const statusIndex = statusSteps.findIndex(s => s.key === status);
    return statusIndex >= 0 ? (statusIndex + 1) / statusSteps.length * 100 : 0;
  };

  const isStatusReached = (stepKey: string, currentStatus: string) => {
    const stepIndex = statusSteps.findIndex(s => s.key === stepKey);
    const currentIndex = statusSteps.findIndex(s => s.key === currentStatus);
    return currentIndex >= stepIndex;
  };

  return (
    <>
      <Helmet>
        <title>Track Your Order | Vasstra</title>
        <meta name="description" content="Track your Vasstra order using your tracking ID" />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Track Your Order</h1>
            <p className="text-muted-foreground text-lg">
              Enter your tracking ID to see the status of your order
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tracking-id" className="text-base font-semibold">
                  Tracking ID
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="tracking-id"
                    placeholder="Enter your tracking ID..."
                    value={trackingId}
                    onChange={(e) => {
                      setTrackingId(e.target.value);
                      setError("");
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !trackingId.trim()}
                    className="px-8"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {isLoading ? "Tracking..." : "Track"}
                  </Button>
                </div>
                {error && (
                  <div className="flex gap-2 items-start text-sm text-destructive mt-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  You'll find your tracking ID in your order confirmation email
                </p>
              </div>
            </form>
          </div>

          {/* Order Details */}
          {order && (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold mb-1">Order Details</h2>
                    <p className="text-muted-foreground">Order #{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <Badge className={`${statusColors[order.status] || ''}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Order Date</p>
                    <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Total Amount</p>
                    <p className="font-bold text-lg text-primary">₹{order.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Items</p>
                    <p className="font-medium">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-6">Tracking Updates</h3>

                {order.trackingUpdates && order.trackingUpdates.length > 0 ? (
                  <div className="space-y-4">
                    {order.trackingUpdates.map((update, index) => (
                      <div key={index} className="flex gap-4 pb-4 last:pb-0">
                        {/* Timeline circle and line */}
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-green-500 text-white">
                            ✓
                          </div>
                          {index < (order.trackingUpdates?.length || 0) - 1 && (
                            <div className="w-1 h-16 mt-2 bg-green-500" />
                          )}
                        </div>

                        {/* Update content */}
                        <div className="pt-1 pb-2 flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold text-foreground capitalize">
                              {update.status.replace(/_/g, ' ')}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(update.timestamp).toLocaleDateString()} {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{update.message}</p>
                          {update.location && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {update.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {statusSteps.map((step, index) => (
                      <div key={step.key} className="flex gap-4">
                        {/* Timeline circle and line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              isStatusReached(step.key, order.status)
                                ? 'bg-green-500 text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {isStatusReached(step.key, order.status) ? '✓' : index + 1}
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div
                              className={`w-1 h-12 mt-2 ${
                                isStatusReached(statusSteps[index + 1].key, order.status)
                                  ? 'bg-green-500'
                                  : 'bg-muted'
                              }`}
                            />
                          )}
                        </div>

                        {/* Status content */}
                        <div className="pt-1 pb-4">
                          <p className="font-semibold text-foreground">{step.label}</p>
                          {isStatusReached(step.key, order.status) && (
                            <p className="text-sm text-green-600 mt-1">✓ Completed</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Estimated Delivery */}
              {order.estimatedDelivery && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-semibold mb-1">Estimated Delivery</p>
                      <p className="font-bold text-lg text-blue-600">
                        {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600 opacity-50" />
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                    {order.shippingAddress.name && (
                      <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
                    )}
                    {order.shippingAddress.street && (
                      <p className="text-foreground">{order.shippingAddress.street}</p>
                    )}
                    {(order.shippingAddress.city || order.shippingAddress.state) && (
                      <p className="text-foreground">
                        {order.shippingAddress.city && `${order.shippingAddress.city}, `}
                        {order.shippingAddress.state && `${order.shippingAddress.state} `}
                        {order.shippingAddress.zipCode && order.shippingAddress.zipCode}
                      </p>
                    )}
                    {order.shippingAddress.phone && (
                      <p className="text-foreground">Phone: {order.shippingAddress.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start border-b border-border pb-3 last:border-0">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        {(item.size || item.color) && (
                          <p className="text-xs text-muted-foreground">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && ' • '}
                            {item.color && `Color: ${item.color}`}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                <p className="font-medium capitalize text-foreground">
                  {order.paymentMethod.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          )}

          {/* No Order State */}
          {!order && !error && (
            <div className="bg-muted/30 rounded-xl border border-dashed border-border p-12 text-center">
              <Truck className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-lg">
                Enter your tracking ID above to view order details and track your shipment
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
