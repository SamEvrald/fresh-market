import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult, InvalidateQueryFilters } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

interface OrderItem {
  productId: string;
  quantity: number;
}

interface Shop {
  name: string;
}

interface Order {
  id: string;
  customer_id: string;
  shop_id: string;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  status: string;
  payment_status: string;
  payment_method: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  shops?: Shop;
  order_items?: any[];
  total_price?: number;
}

export const useOrders = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const ordersQuery = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/orders`);
      return data;
    },
    enabled: !!user,
  });

  const vendorOrdersQuery = useQuery<Order[]>({
    queryKey: ['vendor-orders'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/vendor-orders`);
      return data;
    },
    enabled: !!user && user.role === 'vendor',
  });

  const createOrder = useMutation({
    mutationFn: async (orderData: any) => {
      const { data } = await axios.post(`${API_BASE_URL}/orders`, orderData);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Order created successfully' });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: () => {
      toast({ title: 'Error creating order', variant: 'destructive' });
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { data } = await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, { status });
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Order status updated' });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: () => {
      toast({ title: 'Error updating order status', variant: 'destructive' });
    },
  });

  const getOrderById = (orderId: string): UseQueryResult<Order> => {
    return useQuery({
      queryKey: ['order', orderId],
      queryFn: async () => {
        const { data } = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
        return data;
      },
    });
  };

  return {
    orders: ordersQuery.data || [],
    isLoadingOrders: ordersQuery.isLoading,
    vendorOrders: vendorOrdersQuery.data || [],
    isLoadingVendorOrders: vendorOrdersQuery.isLoading,
    createOrder,
    updateOrderStatus,
    getOrderById,
  };
};
