// src/hooks/useShops.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Removed: import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:3000/api/v1'; // Your NestJS backend URL

export const useShops = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shops, isLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/shops?isActive=true`);
      if (!response.ok) {
        throw new Error(`Failed to fetch shops: ${response.statusText}`);
      }
      const data = await response.json();
      // Assuming your backend returns profile data nested as 'owner.fullName'
      // If 'profiles:owner_id (full_name)' was a Supabase specific syntax for joining,
      // your backend might return 'owner: { fullName: string }' directly.
      return data;
    }
  });

  const createShop = useMutation({
    mutationFn: async (shopData: any) => {
      const response = await fetch(`${API_BASE_URL}/shops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shopData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create shop: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast({
        title: "Shop Created",
        description: "Your shop has been successfully created and is pending approval."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create shop.",
        variant: "destructive"
      });
    }
  });

  const updateShop = useMutation({
    mutationFn: async ({ id, ...shopData }: any) => {
      const response = await fetch(`${API_BASE_URL}/shops/${id}`, {
        method: 'PATCH', // Assuming PATCH for partial updates
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shopData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update shop: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast({
        title: "Shop Updated",
        description: "Your shop has been successfully updated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update shop.",
        variant: "destructive"
      });
    }
  });

  const deleteShop = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/shops/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete shop: ${response.statusText}`);
      }
      // No content returned for successful delete usually, but check if backend sends anything
      return response.status === 204 ? null : response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast({
        title: "Shop Deleted",
        description: "The shop has been successfully deleted."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete shop.",
        variant: "destructive"
      });
    }
  });

  return {
    shops,
    isLoading,
    createShop,
    updateShop,
    deleteShop,
  };
};