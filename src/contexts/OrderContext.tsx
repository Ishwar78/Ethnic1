import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface Order {
  _id?: string;
  id?: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image: string;
    size?: string;
    color?: string;
  }>;
  subtotal?: number;
  shipping?: number;
  total?: number;
  totalAmount?: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    name?: string;
    street?: string;
    address?: string;
    city: string;
    state: string;
    pincode?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
  };
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "_id" | "createdAt" | "status">, paymentMethod: string, paymentDetails?: any) => Promise<string>;
  getOrder: (id: string) => Order | undefined;
  refreshOrders: () => Promise<void>;
  isLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);
const API_URL = import.meta.env.VITE_API_URL || '/api';

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch orders from backend when user logs in
  useEffect(() => {
    if (user && token) {
      refreshOrders();
    } else {
      setOrders([]);
    }
  }, [user, token]);

  const refreshOrders = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addOrder = async (
    orderData: Omit<Order, "id" | "_id" | "createdAt" | "status">,
    paymentMethod: string,
    paymentDetails?: any
  ): Promise<string> => {
    if (!token) {
      throw new Error('User not authenticated');
    }

    try {
      const payload = {
        items: orderData.items,
        totalAmount: orderData.totalAmount || orderData.total,
        shippingAddress: {
          name: `${orderData.shippingAddress?.firstName || ''} ${orderData.shippingAddress?.lastName || ''}`.trim(),
          street: orderData.shippingAddress?.street || orderData.shippingAddress?.address,
          city: orderData.shippingAddress?.city,
          state: orderData.shippingAddress?.state,
          zipCode: orderData.shippingAddress?.pincode || orderData.shippingAddress?.zipCode,
          country: orderData.shippingAddress?.country || 'India',
          phone: orderData.shippingAddress?.phone || '',
        },
        paymentMethod,
        paymentDetails,
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const data = await response.json();

      // Refresh orders list
      await refreshOrders();

      return data.order._id || data.order.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const getOrder = (id: string) => {
    return orders.find((order) => order._id === id || order.id === id);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, getOrder, refreshOrders, isLoading }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
