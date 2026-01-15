import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Package, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/contexts/OrderContext";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import InvoiceDisplay from "@/components/InvoiceDisplay";

const statusColors = {
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  processing: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  shipped: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
};

export default function OrderHistory() {
  const { orders, isLoading } = useOrders();
  const { user, isLoading: authLoading, token } = useAuth();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-4">Sign in to view orders</h1>
              <p className="text-muted-foreground mb-6">
                Please sign in to view your order history.
              </p>
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Order History | Vasstra</title>
        <meta name="description" content="View your past orders and track shipments at Vasstra." />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Order History</span>
          </nav>
        </div>

        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">Order History</h1>

          {isLoading ? (
            <div className="max-w-md mx-auto text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold mb-4">You have not placed any orders yet</h2>
              <p className="text-muted-foreground mb-6">
                Once you place an order, it will appear here.
              </p>
              <Button asChild>
                <Link to="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const orderId = order._id || order.id;
                const totalAmount = order.totalAmount || order.total;
                const paymentMethodDisplay = order.paymentMethod
                  ? order.paymentMethod.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                  : 'Not specified';

                return (
                  <div
                    key={orderId}
                    className="bg-card border border-border rounded-xl p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-display text-lg font-semibold">
                            Order #{orderId.toString().slice(-8).toUpperCase()}
                          </h3>
                          <Badge
                            variant="outline"
                            className={statusColors[order.status] || "bg-gray-500/10 text-gray-600 border-gray-500/20"}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Placed on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-display text-xl font-bold text-primary">
                          ₹{totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {order.items.map((item, index) => (
                        <div
                          key={`${orderId}-${item.name}-${index}`}
                          className="flex gap-4 p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="w-16 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-medium line-clamp-1">{item.name}</p>
                              {item.category && (
                                <Badge variant="secondary" className="flex-shrink-0 text-xs">
                                  {item.category.replace(/_/g, ' ')}
                                </Badge>
                              )}
                            </div>
                            {item.size && (
                              <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                            )}
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            <p className="text-sm font-semibold text-primary mt-1">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                          <p className="text-sm font-medium">{paymentMethodDisplay}</p>
                        </div>
                        {order.shippingAddress && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Shipping to</p>
                            <p className="text-sm font-medium">{order.shippingAddress.city}</p>
                          </div>
                        )}
                      </div>

                      {order.shippingAddress && (
                        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium mb-2">Full Address</p>
                          <p className="text-sm text-muted-foreground">
                            {order.shippingAddress.name},{" "}
                            {order.shippingAddress.street || order.shippingAddress.address},{" "}
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                          </p>
                        </div>
                      )}

                      <Button
                        className="w-full sm:w-auto"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Order Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Invoice Display */}
      {selectedOrderForInvoice && (
        <InvoiceDisplay
          orderId={selectedOrderForInvoice}
          open={showInvoice}
          onOpenChange={setShowInvoice}
          token={token}
        />
      )}

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Order Header */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                    <p className="font-semibold text-foreground">#{selectedOrder._id?.toString().slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                    <p className="font-semibold text-foreground">
                      {format(new Date(selectedOrder.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge className={`mt-1 ${
                      selectedOrder.status === 'delivered' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                      selectedOrder.status === 'shipped' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                      selectedOrder.status === 'confirmed' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                      selectedOrder.status === 'processing' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                      'bg-gray-500/10 text-gray-600 border-gray-500/20'
                    }`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                    <p className="font-semibold text-primary text-lg">₹{(selectedOrder.total || selectedOrder.totalAmount).toLocaleString()}</p>
                  </div>
                </div>

                <Separator />

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Items Ordered</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any, index: number) => (
                      <div key={index} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="w-16 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{item.name}</p>
                          {item.size && <p className="text-xs text-muted-foreground">Size: {item.size}</p>}
                          {item.color && <p className="text-xs text-muted-foreground">Color: {item.color}</p>}
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="text-sm font-semibold text-primary mt-1">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Shipping Address</h3>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-2">
                      {(selectedOrder.shippingAddress.firstName || selectedOrder.shippingAddress.name) && (
                        <p className="font-medium text-foreground">
                          {selectedOrder.shippingAddress.firstName && selectedOrder.shippingAddress.lastName
                            ? `${selectedOrder.shippingAddress.firstName} ${selectedOrder.shippingAddress.lastName}`
                            : selectedOrder.shippingAddress.name || ''}
                        </p>
                      )}
                      {selectedOrder.shippingAddress.phone && (
                        <p className="text-sm text-foreground">Phone: {selectedOrder.shippingAddress.phone}</p>
                      )}
                      {(selectedOrder.shippingAddress.address || selectedOrder.shippingAddress.street) && (
                        <p className="text-sm text-foreground">
                          {selectedOrder.shippingAddress.address || selectedOrder.shippingAddress.street}
                        </p>
                      )}
                      {(selectedOrder.shippingAddress.city || selectedOrder.shippingAddress.state || selectedOrder.shippingAddress.pincode) && (
                        <p className="text-sm text-foreground">
                          {selectedOrder.shippingAddress.city && `${selectedOrder.shippingAddress.city}, `}
                          {selectedOrder.shippingAddress.state && `${selectedOrder.shippingAddress.state} `}
                          {selectedOrder.shippingAddress.pincode || selectedOrder.shippingAddress.zipCode}
                        </p>
                      )}
                      {selectedOrder.shippingAddress.country && (
                        <p className="text-sm text-foreground">{selectedOrder.shippingAddress.country}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                    <p className="font-medium text-foreground">
                      {selectedOrder.paymentMethod ? selectedOrder.paymentMethod.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Not specified'}
                    </p>
                  </div>
                  {selectedOrder.trackingId && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tracking ID</p>
                      <p className="font-medium text-foreground font-mono">{selectedOrder.trackingId}</p>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">₹{(selectedOrder.subtotal || 0).toLocaleString()}</span>
                    </div>
                    {selectedOrder.shipping > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-foreground">₹{selectedOrder.shipping.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedOrder.shipping === 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-green-600">FREE</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary">₹{(selectedOrder.total || selectedOrder.totalAmount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedOrderForInvoice(selectedOrder._id || selectedOrder.id);
                    setShowInvoice(true);
                  }}
                >
                  View Invoice
                </Button>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}
