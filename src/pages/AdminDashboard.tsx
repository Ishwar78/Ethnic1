import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/AdminSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, User, Package, ShoppingCart, BarChart3, Search, Trash2, MapPin, Phone, Mail, Loader2, Menu, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductManagement from "@/components/ProductManagement";
import AdminContactManagement from "@/components/AdminContactManagement";
import AdminTicketManagement from "@/components/AdminTicketManagement";
import AdminBannerManagement from "@/components/AdminBannerManagement";
import AdminCategoryManagement from "@/components/AdminCategoryManagement";
import AdminCouponManagement from "@/components/AdminCouponManagement";
import AdminHeroMediaManagement from "@/components/AdminHeroMediaManagement";
import AdminVideoManagement from "@/components/AdminVideoManagement";
import PaymentManagement from "@/components/PaymentManagement";
import SizeChartManagement from "@/components/SizeChartManagement";
import InvoiceDisplay from "@/components/InvoiceDisplay";
import AdminInvoiceManagement from "@/components/AdminInvoiceManagement";

interface DashboardStats {
  totalUsers: number;
  adminUsers: number;
  activeUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface AdminOrder {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
  trackingId?: string;
  items?: any[];
  shippingAddress?: any;
  paymentMethod?: string;
  paymentDetails?: any;
}

// Color name to hex mapping
const colorMap: { [key: string]: string } = {
  'Red': '#DC2626',
  'Blue': '#1E3A8A',
  'Green': '#059669',
  'Yellow': '#EAB308',
  'Pink': '#EC4899',
  'Purple': '#7C3AED',
  'Orange': '#EA580C',
  'Black': '#000000',
  'White': '#FFFFFF',
  'Gray': '#6B7280',
  'Brown': '#92400E',
  'Burgundy': '#722F37',
  'Maroon': '#800000',
  'Ivory': '#FFFFF0',
  'Teal': '#0D9488',
  'Gold': '#FBBF24',
  'Silver': '#D1D5DB',
  'Navy': '#001F3F',
  'Khaki': '#F0E68C',
  'Beige': '#F5F5DC',
};

function getColorHex(colorName: string): string {
  const lowerName = colorName.toLowerCase();
  for (const [key, value] of Object.entries(colorMap)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }
  return '#6B7280'; // Default gray
}

export default function AdminDashboard() {
  const { user, token, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string>("");
  const [updatingTrackingId, setUpdatingTrackingId] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  // Check if user is admin
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      navigate('/vastra/admin');
    }
  }, [user, navigate, authLoading]);

  // Fetch dashboard stats
  useEffect(() => {
    if (!token) return;

    fetchStats();
  }, [token]);

  // Initialize tracking ID when order is selected
  useEffect(() => {
    if (selectedOrder && selectedOrder.trackingId) {
      setTrackingId(selectedOrder.trackingId);
    }
  }, [selectedOrder]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const query = searchTerm ? `?search=${searchTerm}` : '';
      const response = await fetch(`${API_URL}/admin/users${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'User deleted successfully',
        });
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'User status updated',
        });
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: `Order status updated to ${status}`,
        });
        // Update the selected order
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status });
        }
        // Refresh orders
        fetchOrders();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update order status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const updateTrackingId = async (orderId: string, newTrackingId: string) => {
    if (!newTrackingId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a tracking ID',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUpdatingTrackingId(true);
      const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ trackingId: newTrackingId }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Tracking ID updated successfully',
        });
        // Update the selected order
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, trackingId: newTrackingId });
        }
        // Refresh orders
        fetchOrders();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update tracking ID',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating tracking ID:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tracking ID',
        variant: 'destructive',
      });
    } finally {
      setUpdatingTrackingId(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const currentTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    // Update URL with new tab using navigate
    navigate(`/admin?tab=${value}`, { replace: false });

    // Fetch data for specific tabs
    if (value === 'users') fetchUsers();
    if (value === 'orders') fetchOrders();
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Vasstra</title>
        <meta name="description" content="Vasstra Admin Dashboard" />
      </Helmet>

      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />

        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, orders, and view statistics</p>
          </div>

          <Tabs value={currentTab} className="space-y-6" onValueChange={handleTabChange}>
            <TabsList className="flex flex-wrap gap-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="hero-media">Hero Slider</TabsTrigger>
              <TabsTrigger value="videos">Trending Videos</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="coupons">Coupons</TabsTrigger>
              <TabsTrigger value="banners">Banners</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="size-charts">Size Charts</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                      <p className="text-xs text-muted-foreground">{stats.activeUsers} active</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.adminUsers}</div>
                      <p className="text-xs text-muted-foreground">With admin access</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalOrders}</div>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Total earned</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Hero Media Tab */}
            <TabsContent value="hero-media" className="space-y-6">
              <AdminHeroMediaManagement />
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos" className="space-y-6">
              <AdminVideoManagement />
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <ProductManagement />
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <AdminCategoryManagement />
            </TabsContent>

            {/* Coupons Tab */}
            <TabsContent value="coupons" className="space-y-6">
              <AdminCouponManagement />
            </TabsContent>

            {/* Banners Tab */}
            <TabsContent value="banners" className="space-y-6">
              <AdminBannerManagement />
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-6">
              <PaymentManagement />
            </TabsContent>

            {/* Invoice Settings Tab */}
            <TabsContent value="invoices" className="space-y-6">
              <AdminInvoiceManagement />
            </TabsContent>

            {/* Size Charts Tab */}
            <TabsContent value="size-charts" className="space-y-6">
              <SizeChartManagement />
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="search" className="text-foreground">Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={fetchUsers}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Role</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 text-sm text-foreground">{u.name}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{u.email}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              u.role === 'admin' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              u.isActive
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleUserStatus(u._id, u.isActive)}
                              >
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteUser(u._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found. Try a different search.
                </div>
              )}
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Button onClick={fetchOrders} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Refresh Orders'}
              </Button>

              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No orders found.</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <Card key={order._id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div>
                                <h4 className="font-semibold text-foreground">{order.userId?.name}</h4>
                                <p className="text-sm text-muted-foreground">{order.userId?.email}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm mt-3">
                              <div>
                                <p className="text-muted-foreground">Amount</p>
                                <p className="font-medium">₹{order.totalAmount?.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Items</p>
                                <p className="font-medium">{order.items?.length || 0}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Status</p>
                                <span className={`px-2 py-1 rounded text-xs font-medium inline-block mt-1 ${
                                  order.status === 'delivered'
                                    ? 'bg-green-100 text-green-800'
                                    : order.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : order.status === 'shipped'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}>
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Tickets Tab */}
            <TabsContent value="tickets" className="space-y-6">
              <AdminTicketManagement />
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-6">
              <AdminContactManagement />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Settings</CardTitle>
                  <CardDescription>Manage your admin account settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-foreground">Current User</Label>
                      <p className="mt-1 text-sm text-muted-foreground">{user?.name} ({user?.email})</p>
                    </div>
                    <div>
                      <Label className="text-foreground">Role</Label>
                      <p className="mt-1 text-sm font-medium text-foreground">{user?.role}</p>
                    </div>
                    <div>
                      <Label className="text-foreground">Member Since</Label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(user?.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Invoice Display */}
      {selectedOrder && (
        <InvoiceDisplay
          orderId={selectedOrder._id}
          open={showInvoice}
          onOpenChange={setShowInvoice}
          token={token}
        />
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Customer Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Name</p>
                          <p className="font-medium">{selectedOrder.userId?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium break-all">{selectedOrder.userId?.email}</p>
                        </div>
                      </div>
                      {selectedOrder.userId?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">Phone</p>
                            <p className="font-medium">{selectedOrder.userId?.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Shipping Address</h3>
                      <div className="space-y-3 text-sm bg-muted/20 rounded-lg p-3">
                        {(selectedOrder.shippingAddress.name || (selectedOrder.shippingAddress.firstName && selectedOrder.shippingAddress.lastName)) && (
                          <div>
                            <p className="text-muted-foreground text-xs font-medium">Full Name</p>
                            <p className="font-medium">
                              {selectedOrder.shippingAddress.name || `${selectedOrder.shippingAddress.firstName || ''} ${selectedOrder.shippingAddress.lastName || ''}`.trim()}
                            </p>
                          </div>
                        )}
                        {selectedOrder.shippingAddress.phone && (
                          <div className="bg-primary/5 border border-primary/20 rounded p-2">
                            <p className="text-muted-foreground text-xs font-medium mb-1">Mobile No</p>
                            <p className="font-semibold text-foreground">{selectedOrder.shippingAddress.phone}</p>
                          </div>
                        )}
                        {(selectedOrder.shippingAddress.street || selectedOrder.shippingAddress.address) && (
                          <div>
                            <p className="text-muted-foreground text-xs font-medium">Address</p>
                            <p className="text-foreground">{selectedOrder.shippingAddress.street || selectedOrder.shippingAddress.address}</p>
                          </div>
                        )}
                        {(selectedOrder.shippingAddress.city || selectedOrder.shippingAddress.state || selectedOrder.shippingAddress.zipCode || selectedOrder.shippingAddress.pincode) && (
                          <div className="grid grid-cols-2 gap-3">
                            {selectedOrder.shippingAddress.city && (
                              <div>
                                <p className="text-muted-foreground text-xs font-medium">City</p>
                                <p className="text-foreground">{selectedOrder.shippingAddress.city}</p>
                              </div>
                            )}
                            {selectedOrder.shippingAddress.state && (
                              <div>
                                <p className="text-muted-foreground text-xs font-medium">State</p>
                                <p className="text-foreground">{selectedOrder.shippingAddress.state}</p>
                              </div>
                            )}
                            {(selectedOrder.shippingAddress.zipCode || selectedOrder.shippingAddress.pincode) && (
                              <div>
                                <p className="text-muted-foreground text-xs font-medium">PIN Code</p>
                                <p className="text-foreground">{selectedOrder.shippingAddress.zipCode || selectedOrder.shippingAddress.pincode}</p>
                              </div>
                            )}
                            {selectedOrder.shippingAddress.country && (
                              <div>
                                <p className="text-muted-foreground text-xs font-medium">Country</p>
                                <p className="text-foreground">{selectedOrder.shippingAddress.country}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Order Date</p>
                      <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium inline-block mt-1 ${
                        selectedOrder.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : selectedOrder.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : selectedOrder.status === 'shipped'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment</p>
                      <p className="font-medium capitalize">{selectedOrder.paymentMethod?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-semibold text-lg">₹{selectedOrder.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Order Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground">Product</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground">Category</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground">Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground">Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground">Size</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground">Color</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-foreground">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedOrder.items?.map((item: any, index: number) => (
                          <tr key={index} className="hover:bg-muted/30">
                            <td className="px-4 py-3 text-sm text-foreground">{item.name}</td>
                            <td className="px-4 py-3 text-sm">
                              {item.category ? (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {item.category.replace(/_/g, ' ')}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground">₹{item.price?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-foreground">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{item.size || '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              {item.color ? (
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-5 h-5 rounded border border-border"
                                    style={{backgroundColor: getColorHex(item.color)}}
                                    title={item.color}
                                  />
                                  <span className="text-muted-foreground">{item.color}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-foreground font-medium">
                              ₹{((item.price || 0) * (item.quantity || 0)).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Additional Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Order Notes</h3>
                    <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Tracking ID Update */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-3">Tracking ID</h3>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Label className="text-foreground mb-2 block">Set Tracking ID</Label>
                      <Input
                        placeholder="e.g., TRACK123456 or Shipment ID"
                        value={trackingId || (selectedOrder?.trackingId as string) || ""}
                        onChange={(e) => setTrackingId(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        This ID will be shown to customers to track their order
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        updateTrackingId(selectedOrder._id, trackingId || (selectedOrder?.trackingId as string) || "");
                      }}
                      disabled={updatingTrackingId || !trackingId?.trim()}
                    >
                      {updatingTrackingId ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </Button>
                  </div>
                </div>

                {/* Order Status Update */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-3">Update Order Status</h3>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Label className="text-foreground mb-2 block">New Status</Label>
                      <Select
                        value={newOrderStatus || selectedOrder.status}
                        onValueChange={setNewOrderStatus}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => {
                        if (newOrderStatus && newOrderStatus !== selectedOrder.status) {
                          updateOrderStatus(selectedOrder._id, newOrderStatus);
                        }
                      }}
                      disabled={!newOrderStatus || newOrderStatus === selectedOrder.status || updatingOrderId === selectedOrder._id}
                    >
                      {updatingOrderId === selectedOrder._id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update'
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowInvoice(true)}
                >
                  View Invoice
                </Button>
                <Button variant="outline" onClick={() => {
                  setSelectedOrder(null);
                  setNewOrderStatus(null);
                  setTrackingId("");
                }}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
