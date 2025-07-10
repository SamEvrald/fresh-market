
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useToast } from '@/hooks/use-toast';

export const useCartIntegration = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const { sendOrderConfirmation } = useEmailNotifications();
  const { toast } = useToast();

  const processOrder = async (orderData: {
    items: any[];
    deliveryAddress: string;
    total: number;
    deliveryFee: number;
  }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to place an order.",
        variant: "destructive"
      });
      return null;
    }

    setIsProcessing(true);

    try {
      // Create order in database
      const order = await createOrder.mutateAsync({
        customer_id: user.id,
        shop_id: orderData.items[0]?.shopId || null, // Assuming single shop for now
        total_amount: orderData.total,
        delivery_fee: orderData.deliveryFee,
        delivery_address: orderData.deliveryAddress,
        status: 'pending',
        payment_status: 'pending',
        payment_method: null
      });

      // Send order confirmation email
      await sendOrderConfirmation({
        customerEmail: user.email || '',
        customerName: user.user_metadata?.full_name || 'Customer',
        orderId: order.id,
        totalAmount: orderData.total,
        deliveryAddress: orderData.deliveryAddress,
        status: 'pending'
      });

      toast({
        title: "Order Created",
        description: "Your order has been created successfully. Please complete payment.",
      });

      return order;
    } catch (error: any) {
      console.error('Order processing failed:', error);
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processOrder,
    isProcessing
  };
};
