import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Ticket, Copy, Percent, IndianRupee, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Coupon {
  _id?: string;
  id?: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt?: string;
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AdminCouponManagement = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/coupons`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }

      const data = await response.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        minOrderAmount: formData.minOrderAmount,
        maxDiscount: formData.maxDiscount ? parseInt(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
      };

      if (editingCoupon?._id) {
        const response = await fetch(`${API_URL}/coupons/${editingCoupon._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to update coupon');
        }

        toast({
          title: "Success",
          description: "Coupon updated successfully",
        });
      } else {
        const response = await fetch(`${API_URL}/coupons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create coupon');
        }

        toast({
          title: "Success",
          description: "Coupon created successfully",
        });
      }

      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save coupon",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: 0,
      minOrderAmount: 0,
      maxDiscount: "",
      usageLimit: "",
      startDate: "",
      endDate: "",
      isActive: true
    });
    setEditingCoupon(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      startDate: new Date(coupon.startDate).toISOString().split('T')[0],
      endDate: new Date(coupon.endDate).toISOString().split('T')[0],
      isActive: coupon.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Are you sure you want to delete coupon ${coupon.code}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/coupons/${coupon._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete coupon');
      }

      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });

      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      const response = await fetch(`${API_URL}/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !coupon.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update coupon');
      }

      toast({
        title: "Success",
        description: "Coupon status updated",
      });

      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast({
        title: "Error",
        description: "Failed to update coupon",
        variant: "destructive",
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const activeCoupons = coupons.filter(c => c.isActive && !isExpired(c.endDate));
  const totalUsage = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Coupon Management</h2>
          <p className="text-muted-foreground">Create and manage discount coupons</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SUMMER25"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountType">Discount Type</Label>
                  <Select 
                    value={formData.discountType} 
                    onValueChange={(value: "percentage" | "fixed") => 
                      setFormData({ ...formData, discountType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    {formData.discountType === "percentage" ? "Percentage" : "Amount"}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                    min={0}
                    max={formData.discountType === "percentage" ? 100 : undefined}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minOrderAmount">Min Order (₹)</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) })}
                    min={0}
                  />
                </div>
                
                {formData.discountType === "percentage" && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Max Discount (₹)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      placeholder="No limit"
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="Unlimited"
                  min={1}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>Active</Label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1" disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingCoupon ? "Update" : "Create"} Coupon
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCoupons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading coupons...</span>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No coupons created yet.
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
              <div
                key={coupon._id || coupon.id} 
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    coupon.isActive && !isExpired(coupon.endDate) 
                      ? 'bg-primary/10' 
                      : 'bg-muted'
                  }`}>
                    {coupon.discountType === "percentage" ? (
                      <Percent className={`h-6 w-6 ${
                        coupon.isActive && !isExpired(coupon.endDate) 
                          ? 'text-primary' 
                          : 'text-muted-foreground'
                      }`} />
                    ) : (
                      <IndianRupee className={`h-6 w-6 ${
                        coupon.isActive && !isExpired(coupon.endDate) 
                          ? 'text-primary' 
                          : 'text-muted-foreground'
                      }`} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold font-mono text-lg">{coupon.code}</h3>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => copyCode(coupon.code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {isExpired(coupon.endDate) && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                      {!coupon.isActive && !isExpired(coupon.endDate) && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {coupon.discountType === "percentage" 
                        ? `${coupon.discountValue}% off` 
                        : `₹${coupon.discountValue} off`}
                      {coupon.maxDiscount && ` (Max ₹${coupon.maxDiscount})`}
                      {" • "}Min order ₹{coupon.minOrderAmount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Used {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ""} times
                      {" • "}Valid till {new Date(coupon.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={coupon.isActive}
                    onCheckedChange={() => toggleActive(coupon)}
                    disabled={isExpired(coupon.endDate)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(coupon)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCouponManagement;
