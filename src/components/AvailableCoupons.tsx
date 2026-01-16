import { useState, useEffect } from "react";
import { Percent, IndianRupee, Copy, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  endDate: string;
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function AvailableCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveCoupons();
  }, []);

  const fetchActiveCoupons = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/coupons/active`);

      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }

      const data = await response.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return null;
  }

  if (coupons.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Exclusive Offers
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Save more with our special coupon codes. Apply at checkout to get instant discounts!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <Card key={coupon._id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {coupon.discountType === "percentage" ? (
                      <Percent className="h-6 w-6 text-primary" />
                    ) : (
                      <IndianRupee className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Save</p>
                  <p className="text-2xl md:text-3xl font-bold text-primary">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}%`
                      : `₹${coupon.discountValue}`}
                    {coupon.maxDiscount && coupon.discountType === "percentage" && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        up to ₹{coupon.maxDiscount}
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  {coupon.minOrderAmount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Min order: ₹{coupon.minOrderAmount.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Valid until: {new Date(coupon.endDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 bg-muted rounded-lg p-2 text-center">
                    <p className="font-mono text-sm font-bold text-foreground">
                      {coupon.code}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={copiedCode === coupon.code ? "default" : "outline"}
                    onClick={() => handleCopyCoupon(coupon.code)}
                    className="flex-shrink-0"
                  >
                    {copiedCode === coupon.code ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Apply coupon code at checkout to get your discount
          </p>
        </div>
      </div>
    </section>
  );
}
