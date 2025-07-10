// src/hooks/usePayments.ts

// Removed: import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:3000/api/v1'; // Your NestJS backend URL

export const usePayments = () => {
  const { toast } = useToast();

  const processMTNPayment = async (paymentData: {
    orderId: string;
    amount: number;
    phoneNumber: string;
    customerName: string;
  }) => {
    try {
      // Assuming your backend has an endpoint for MTN payments
      const response = await fetch(`${API_BASE_URL}/payments/mtn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `MTN payment failed: ${response.statusText}`);
      }

      const data = await response.json();

      toast({
        title: "Payment Request Created",
        description: "Please complete the payment using the provided USSD code or QR code.",
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('MTN payment failed:', error);
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const processAirtelPayment = async (paymentData: {
    orderId: string;
    amount: number;
    phoneNumber: string;
    customerName: string;
  }) => {
    // Placeholder for Airtel Money integration
    console.log('Airtel payment integration coming soon:', paymentData);
    toast({
      title: "Coming Soon",
      description: "Airtel Money payment integration is under development.",
      variant: "destructive"
    });
    return { success: false, error: 'Not implemented yet' };
  };

  return {
    processMTNPayment,
    processAirtelPayment,
  };
};