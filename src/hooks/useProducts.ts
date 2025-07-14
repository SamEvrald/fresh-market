// src/hooks/useProducts.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Removed: import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:3000/api/v1'; // Your NestJS backend URL

export const useProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/products?isAvailable=true`);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      const data = await response.json();
      // Assuming your backend returns shop data nested as 'shop' or directly
      // Adjust if your backend's DTO for products differs significantly.
      return data;
    }
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const createProduct = useMutation({
    mutationFn: async (productData: any) => {
      // Use FormData for file upload (image)
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description || "");
      formData.append('price', productData.price);
      // unit field removed
      formData.append('category', productData.category || "");
      formData.append('stockQuantity', productData.stockQuantity || productData.stock || 0);
      formData.append('isAvailable', productData.isAvailable ? "true" : "false");
      if (productData.imageFile) {
        formData.append('image', productData.imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/shops/me/products`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create product: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Product Created",
        description: "Your product has been successfully added."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...productData }: any) => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PATCH', // Assuming PATCH for partial updates
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update product: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Product Updated",
        description: "Your product has been successfully updated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product.",
        variant: "destructive"
      });
    }
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete product: ${response.statusText}`);
      }
      return response.status === 204 ? null : response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Product Deleted",
        description: "The product has been successfully deleted."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product.",
        variant: "destructive"
      });
    }
  });

  return {
    products,
    isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};