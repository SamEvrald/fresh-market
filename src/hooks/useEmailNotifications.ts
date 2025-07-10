// src/hooks/useEmailNotifications.ts

// Removed: import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = 'http://localhost:3000/api/v1'; // Your NestJS backend URL

export const useEmailNotifications = () => {
  const sendEmail = async (emailData: {
    to: string;
    subject: string;
    type: 'order_confirmation' | 'order_status_update' | 'welcome' | 'password_reset';
    data?: any;
  }) => {
    try {
      // Assuming your backend has an endpoint to send emails
      const response = await fetch(`${API_BASE_URL}/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Email sending failed: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      console.error('Email sending failed:', error);
      return { success: false, error };
    }
  };

  const sendOrderConfirmation = async (orderData: {
    customerEmail: string;
    customerName: string;
    orderId: string;
    totalAmount: number;
    deliveryAddress: string;
    status: string;
  }) => {
    return sendEmail({
      to: orderData.customerEmail,
      subject: `Order Confirmation - #${orderData.orderId}`,
      type: 'order_confirmation',
      data: orderData
    });
  };

  const sendOrderStatusUpdate = async (orderData: {
    customerEmail: string;
    customerName: string;
    orderId: string;
    status: string;
    totalAmount: number;
  }) => {
    return sendEmail({
      to: orderData.customerEmail,
      subject: `Order Status Update - #${orderData.orderId}`,
      type: 'order_status_update',
      data: orderData
    });
  };

  const sendWelcomeEmail = async (userData: {
    customerEmail: string;
    customerName: string;
  }) => {
    return sendEmail({
      to: userData.customerEmail,
      subject: 'Welcome to Fresh Market!', // Changed 'FruitHub!' to 'Fresh Market!'
      type: 'welcome',
      data: userData
    });
  };

  const sendPasswordResetEmail = async (userData: {
    customerEmail: string;
    customerName: string;
    resetLink: string;
  }) => {
    return sendEmail({
      to: userData.customerEmail,
      subject: 'Password Reset Request for Fresh Market Account', // Changed 'FruitHub!' to 'Fresh Market!'
      type: 'password_reset',
      data: userData
    });
  };

  return {
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendWelcomeEmail,
    sendPasswordResetEmail
  };
};