import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const RealTimeOrderUpdates = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Connect to your backend's websocket endpoint
    socket = io('http://localhost:3000', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('orderUpdated', (order: any) => {
      toast({
        title: 'Order Status Updated',
        description: `Your order is now ${order.status.replace('_', ' ')}`,
      });

      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    socket.on('orderCreated', () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    return () => {
      socket?.disconnect();
    };
  }, [user, toast, queryClient]);

  return null;
};

export default RealTimeOrderUpdates;
