import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Truck, Shield, CheckCircle2, Loader2, X, DollarSign, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface SavedAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
}

// Function to check if two addresses are identical
const areAddressesEqual = (addr1: SavedAddress, addr2: SavedAddress): boolean => {
  return (
    addr1.street?.toLowerCase().trim() === addr2.street?.toLowerCase().trim() &&
    addr1.city?.toLowerCase().trim() === addr2.city?.toLowerCase().trim() &&
    addr1.state?.toLowerCase().trim() === addr2.state?.toLowerCase().trim() &&
    addr1.zipCode?.trim() === addr2.zipCode?.trim()
  );
};

// Function to deduplicate addresses
const deduplicateAddresses = (addresses: SavedAddress[]): SavedAddress[] => {
  const seen: SavedAddress[] = [];
  for (const addr of addresses) {
    const isDuplicate = seen.some(seenAddr => areAddressesEqual(seenAddr, addr));
    if (!isDuplicate) {
      seen.push(addr);
    }
  }
  return seen;
};

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, totalSavings, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { user, token } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [upiTransactionId, setUpiTransactionId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    discountType: string;
    discountValue: number;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [isLoadingPaymentSettings, setIsLoadingPaymentSettings] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch payment settings on component mount
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/payment-settings/public`);
        if (response.ok) {
          const data = await response.json();
          setPaymentSettings(data.paymentSettings);
        }
      } catch (error) {
        console.error('Error fetching payment settings:', error);
      } finally {
        setIsLoadingPaymentSettings(false);
      }
    };

    fetchPaymentSettings();
  }, []);

  // Fetch saved addresses from user profile
  useEffect(() => {
    if (user) {
      const addresses: SavedAddress[] = [];

      // Load multiple addresses if available
      if (user.addresses && user.addresses.length > 0) {
        addresses.push(...user.addresses.map(addr => ({
          street: addr.street || '',
          city: addr.city || '',
          state: addr.state || '',
          zipCode: addr.zipCode || '',
          country: addr.country || '',
          phone: addr.phone || '',
        })));
      }
      // Fallback to primary address if no multiple addresses exist
      else if (user.address && (user.address.street || user.address.city)) {
        addresses.push({
          street: user.address.street || '',
          city: user.address.city || '',
          state: user.address.state || '',
          zipCode: user.address.zipCode || '',
          country: user.address.country || '',
          phone: user.phone || '',
        });
      }

      // Deduplicate addresses before setting them
      const uniqueAddresses = deduplicateAddresses(addresses);
      setSavedAddresses(uniqueAddresses);
      if (uniqueAddresses.length > 0) {
        setSelectedAddressIndex(0);
        setIsAddingNewAddress(false);
      } else {
        setIsAddingNewAddress(true);
      }
    } else {
      setIsAddingNewAddress(true);
    }
  }, [user]);

  // Update form fields when selected address changes
  useEffect(() => {
    if (!formRef.current) return;

    const addressInput = formRef.current.querySelector('input[name="address"]') as HTMLInputElement;
    const cityInput = formRef.current.querySelector('input[name="city"]') as HTMLInputElement;
    const stateInput = formRef.current.querySelector('input[name="state"]') as HTMLInputElement;
    const pincodeInput = formRef.current.querySelector('input[name="pincode"]') as HTMLInputElement;
    const phoneInput = formRef.current.querySelector('input[name="phone"]') as HTMLInputElement;
    const firstNameInput = formRef.current.querySelector('input[name="firstName"]') as HTMLInputElement;
    const lastNameInput = formRef.current.querySelector('input[name="lastName"]') as HTMLInputElement;

    // Set user's name on component mount
    if (user && user.name) {
      const nameParts = user.name.split(' ');
      if (firstNameInput && !firstNameInput.value) firstNameInput.value = nameParts[0] || '';
      if (lastNameInput && !lastNameInput.value) lastNameInput.value = nameParts.slice(1).join(' ') || '';
    }

    if (selectedAddressIndex !== null && savedAddresses[selectedAddressIndex]) {
      const address = savedAddresses[selectedAddressIndex];
      if (addressInput) addressInput.value = address.street || '';
      if (cityInput) cityInput.value = address.city || '';
      if (stateInput) stateInput.value = address.state || '';
      if (pincodeInput) pincodeInput.value = address.zipCode || '';
      if (phoneInput) phoneInput.value = address.phone || '';
    } else if (isAddingNewAddress) {
      // Clear address fields when adding new address
      if (addressInput) addressInput.value = '';
      if (cityInput) cityInput.value = '';
      if (stateInput) stateInput.value = '';
      if (pincodeInput) pincodeInput.value = '';
    }
  }, [selectedAddressIndex, savedAddresses, isAddingNewAddress, user]);

  const shippingCost = subtotal >= 999 ? 0 : 99;
  const discountAmount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal + shippingCost - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const response = await fetch(
        `${API_URL}/coupons/validate/${encodeURIComponent(couponCode.toUpperCase())}?orderAmount=${subtotal}`,
        {
          method: 'GET',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Invalid coupon code");
        return;
      }

      setAppliedCoupon({
        code: data.coupon.code,
        discount: data.coupon.discount,
        discountType: data.coupon.discountType,
        discountValue: data.coupon.discountValue,
      });

      toast.success(`Coupon ${data.coupon.code} applied! You saved ₹${data.coupon.discount}`);
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast.error("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate transaction ID for UPI payments - it's now mandatory
    if (paymentMethod === 'upi' && !upiTransactionId.trim()) {
      toast.error("Please enter your UPI transaction ID");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData(e.currentTarget);
      const shippingAddress = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        address: formData.get("address") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        pincode: formData.get("pincode") as string,
        phone: formData.get("phone") as string,
      };

      // Save new address to user profile if adding new address
      if (isAddingNewAddress && token && user) {
        try {
          const newAddr: SavedAddress = {
            street: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.pincode,
            country: "India",
            phone: shippingAddress.phone,
          };

          // Check if this address already exists to prevent duplicates
          const isDuplicate = savedAddresses.some(addr => areAddressesEqual(addr, newAddr));

          if (!isDuplicate) {
            const response = await fetch(`${API_URL}/auth/profile`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                addAddress: {
                  label: `${shippingAddress.firstName || 'Home'}`,
                  street: shippingAddress.address,
                  city: shippingAddress.city,
                  state: shippingAddress.state,
                  zipCode: shippingAddress.pincode,
                  country: "India",
                  phone: shippingAddress.phone,
                },
                phone: shippingAddress.phone,
              }),
            });

            if (response.ok) {
              const updatedUserData = await response.json();
              // Update saved addresses with the new address and deduplicate
              if (updatedUserData.user?.addresses) {
                const mappedAddresses = updatedUserData.user.addresses.map((addr: any) => ({
                  street: addr.street || '',
                  city: addr.city || '',
                  state: addr.state || '',
                  zipCode: addr.zipCode || '',
                  country: addr.country || '',
                  phone: addr.phone || '',
                }));
                setSavedAddresses(deduplicateAddresses(mappedAddresses));
              }
              toast.success("Address saved successfully!");
            } else {
              console.error('Failed to save address to profile');
              toast.error("Failed to save address");
            }
          }
        } catch (error) {
          console.error('Error saving address:', error);
          toast.error("Error saving address");
        }
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create order on backend
      // Transaction ID is only for UPI payments (optional)
      const paymentDetails = paymentMethod === "upi" ? { transactionId: upiTransactionId || undefined } :
                            undefined;

      const newOrderId = await addOrder({
        items: [...items],
        subtotal,
        shipping: shippingCost,
        total,
        totalAmount: total,
        shippingAddress,
        paymentDetails,
      }, paymentMethod);

      setOrderId(newOrderId);
      setIsProcessing(false);
      setOrderComplete(true);
      clearCart();
      setUpiTransactionId("");
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error('Error placing order:', error);
      setIsProcessing(false);
      toast.error(error instanceof Error ? error.message : "Failed to place order");
    }
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center py-16">
              <h1 className="font-display text-2xl font-bold mb-4">Your cart is empty</h1>
              <p className="text-muted-foreground mb-6">
                Add some items to your cart before checking out.
              </p>
              <Button asChild>
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (orderComplete) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center py-16">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-4">Order Confirmed!</h1>
              <p className="text-muted-foreground mb-2">
                Thank you for your order. We've sent a confirmation email with order details.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Order #{orderId}
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link to="/dashboard?tab=orders">My Dashboard</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/shop">Continue Shopping</Link>
                </Button>
              </div>
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
        <title>Checkout | Vasstra - Secure Payment</title>
        <meta name="description" content="Complete your order securely at Vasstra. Free shipping on orders above ₹999." />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/shop" className="hover:text-primary">Shop</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Checkout</span>
          </nav>
        </div>

        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left - Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Contact Information */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold mb-6">Contact Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="your@email.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Saved Addresses */}
                {savedAddresses.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="font-display text-xl font-semibold mb-6">Your Saved Addresses</h2>
                    <RadioGroup
                      value={isAddingNewAddress ? "new" : (selectedAddressIndex?.toString() ?? "-1")}
                      onValueChange={(value) => {
                        if (value === "new") {
                          setIsAddingNewAddress(true);
                          setSelectedAddressIndex(null);
                        } else {
                          setIsAddingNewAddress(false);
                          const index = parseInt(value);
                          setSelectedAddressIndex(index);
                          // Populate form fields
                          const address = savedAddresses[index];
                          if (address && formRef.current) {
                            (formRef.current.querySelector('input[name="address"]') as HTMLInputElement).value = address.street || '';
                            (formRef.current.querySelector('input[name="city"]') as HTMLInputElement).value = address.city || '';
                            (formRef.current.querySelector('input[name="state"]') as HTMLInputElement).value = address.state || '';
                            (formRef.current.querySelector('input[name="pincode"]') as HTMLInputElement).value = address.zipCode || '';
                            (formRef.current.querySelector('input[name="phone"]') as HTMLInputElement).value = address.phone || '';
                          }
                        }
                      }}
                    >
                      <div className="space-y-3">
                        {savedAddresses.map((address, index) => (
                          <label
                            key={index}
                            className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedAddressIndex === index && !isAddingNewAddress
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <RadioGroupItem value={index.toString()} className="mt-1" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {address.street && `${address.street}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.city && `${address.city}, `}
                                {address.state && `${address.state} `}
                                {address.zipCode}
                              </p>
                              {address.phone && <p className="text-xs text-muted-foreground">Phone: {address.phone}</p>}
                            </div>
                          </label>
                        ))}

                        {/* Add New Address Option */}
                        <label
                          className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                            isAddingNewAddress
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value="new" />
                          <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            <span className="font-medium text-sm">Add New Address</span>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Shipping Address */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold mb-6">Shipping Address</h2>
                  <div className="grid gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="First name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="Street address"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                      <Input id="apartment" name="apartment" placeholder="Apartment, suite, etc." />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder="City"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          placeholder="State"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode">PIN Code</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          placeholder="PIN code"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold mb-6">Promo Code</h2>
                  <div className="space-y-4">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div>
                          <p className="font-semibold text-green-600">{appliedCoupon.code}</p>
                          <p className="text-sm text-green-600">
                            Discount: ₹{appliedCoupon.discount}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleApplyCoupon();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={isValidatingCoupon || !couponCode.trim()}
                        >
                          {isValidatingCoupon && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold mb-6">Payment Method</h2>
                  {isLoadingPaymentSettings ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading payment options...</p>
                    </div>
                  ) : (!paymentSettings?.upiEnabled && !paymentSettings?.codEnabled) ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <p className="text-sm text-red-600">
                        ⚠ No payment options available. Please contact support.
                      </p>
                    </div>
                  ) : (
                    <RadioGroup value={paymentMethod} onValueChange={(value) => {
                      setPaymentMethod(value);
                      if (value !== "upi") {
                        setUpiTransactionId("");
                      }
                    }}>
                      <div className="space-y-3">
                        {/* UPI Payment - Show if enabled */}
                        {paymentSettings?.upiEnabled && (
                          <label
                            htmlFor="upi"
                            className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                              paymentMethod === "upi" ? "border-primary bg-primary/5" : "border-border"
                            }`}
                          >
                            <RadioGroupItem value="upi" id="upi" />
                            <div className="h-5 w-5 flex items-center justify-center text-muted-foreground font-bold text-xs">
                              UPI
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">UPI Payment</span>
                              <p className="text-sm text-muted-foreground">Pay with Google Pay, PhonePe, Paytm</p>
                            </div>
                          </label>
                        )}

                        {/* COD - Show if enabled */}
                        {paymentSettings?.codEnabled && (
                          <label
                            htmlFor="cod"
                            className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                              paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border"
                            }`}
                          >
                            <RadioGroupItem value="cod" id="cod" />
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                              <span className="font-medium">Cash on Delivery (COD)</span>
                              <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                            </div>
                          </label>
                        )}

                        {/* No payment options available */}
                        {!paymentSettings?.upiEnabled && !paymentSettings?.codEnabled && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            <p className="text-sm text-red-600">
                              ⚠ No payment options available. Please contact support.
                            </p>
                          </div>
                        )}
                      </div>
                    </RadioGroup>
                  )}

                  {/* UPI Payment Details */}
                  {paymentMethod === "upi" && paymentSettings?.upiEnabled && (
                    <div className="mt-6 pt-6 border-t border-border space-y-5">
                      <h3 className="font-semibold text-lg">UPI Payment Instructions</h3>

                      {/* QR Code Section */}
                      {paymentSettings?.upiQrCode && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-foreground">Step 1: Scan QR Code</p>
                          <div className="flex flex-col items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                            <img
                              src={paymentSettings.upiQrCode}
                              alt="UPI QR Code"
                              className="w-48 h-48 border-2 border-blue-500/50 rounded-lg p-2 bg-white shadow-md"
                            />
                            <p className="text-sm font-medium text-foreground">Scan with Google Pay, PhonePe, or Paytm</p>
                          </div>
                        </div>
                      )}

                      {/* UPI Address/ID Section */}
                      {paymentSettings?.upiAddress && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-foreground">Step 2: UPI Address</p>
                          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase">UPI ID</p>
                            <p className="font-mono text-base font-bold text-foreground break-all bg-white/50 rounded p-3 text-center">
                              {paymentSettings.upiAddress}
                            </p>
                            <p className="text-xs text-muted-foreground mt-3">
                              You can enter this manually in your payment app if QR scan doesn't work
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Transaction ID Field */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-foreground">Step 3: Enter Transaction ID</p>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="upi-transaction-id" className="text-foreground font-medium">
                              Transaction ID <span className="text-red-500 font-bold">*</span>
                            </Label>
                            <Input
                              id="upi-transaction-id"
                              placeholder="e.g., UPI123456789 or UPIN7D3Q4K"
                              value={upiTransactionId}
                              onChange={(e) => setUpiTransactionId(e.target.value)}
                              className="font-mono text-sm bg-white"
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              After completing payment, find your transaction ID in your UPI app under "Recent Transactions" or "Payment Confirmation". This field is mandatory.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Alternative Payment Methods */}
                      {paymentSettings?.paymentCodes && paymentSettings.paymentCodes.filter((code: any) => code.isActive).length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-foreground">Alternative Payment Apps</p>
                          <div className="grid grid-cols-1 gap-3">
                            {paymentSettings.paymentCodes.filter((code: any) => code.isActive).map((code: any, index: number) => (
                              <div key={index} className="border border-border rounded-lg p-4 bg-muted/20">
                                <p className="text-sm font-semibold text-foreground mb-3 capitalize">
                                  {code.name.replace(/_/g, ' ')}
                                </p>
                                {code.qrCode && (
                                  <div className="flex flex-col items-center gap-3 mb-3">
                                    <img
                                      src={code.qrCode}
                                      alt={code.name}
                                      className="w-40 h-40 border border-border rounded p-1 bg-white"
                                    />
                                  </div>
                                )}
                                {code.address && (
                                  <div className="bg-white/50 rounded p-2">
                                    <p className="text-xs font-mono text-center text-foreground break-all font-semibold">
                                      {code.address}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* COD Details */}
                  {paymentMethod === "cod" && (
                    <div className="mt-6 pt-6 border-t border-border space-y-4">
                      <h3 className="font-semibold">Cash on Delivery</h3>
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <div className="space-y-3">
                          <p className="text-sm text-foreground font-medium">
                            ✓ You will pay ₹{total.toLocaleString()} when you receive your order.
                          </p>
                          <p className="text-sm text-muted-foreground">
                            No payment is required right now. Our delivery partner will collect payment at your doorstep.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right - Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                  <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>

                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.size}`} className="flex gap-3">
                        <div className="relative w-16 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                            {item.category && (
                              <Badge variant="outline" className="flex-shrink-0 text-xs">
                                {item.category.replace(/_/g, ' ')}
                              </Badge>
                            )}
                          </div>
                          {item.size && (
                            <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                          )}
                          <p className="text-sm font-semibold text-primary mt-1">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Savings</span>
                        <span>-₹{totalSavings.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={shippingCost === 0 ? "text-green-600" : ""}>
                        {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-display text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-primary">₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Truck className="h-4 w-4" />
                      <span>Fast Delivery</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : `Pay ₹${total.toLocaleString()}`}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    By placing this order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}
