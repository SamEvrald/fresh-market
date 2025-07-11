import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, Clock, MapPin, Phone, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart"; // For addToCart
import { useShops } from "@/hooks/useShops"; // New: Import useShops hook
import { useProducts } from "@/hooks/useProducts"; // New: Import useProducts hook

const ShopProfile = () => {
  const { id } = useParams(); // Shop ID from URL
  const { toast } = useToast();
  const { addToCart } = useCart();

  const { data: shop, isLoading: isLoadingShop, error: shopError } = useShops().shops; // Use useShops to get all active shops
  const { data: products, isLoading: isLoadingProducts, error: productsError } = useProducts().products; // Use useProducts to get all active products

  // Filter the shops and products client-side for the specific shop ID
  const currentShop = shop?.find((s: any) => s.id === id);
  const shopProducts = products?.filter((p: any) => p.shopId === id && p.isAvailable); // Ensure products have shopId and isAvailable

  useEffect(() => {
    if (shopError) {
      toast({
        title: "Error fetching shop",
        description: shopError.message || "Failed to load shop details.",
        variant: "destructive",
      });
    }
    if (productsError) {
      toast({
        title: "Error fetching products",
        description: productsError.message || "Failed to load products for this shop.",
        variant: "destructive",
      });
    }
  }, [shopError, productsError, toast]);


  if (isLoadingShop || isLoadingProducts) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-8 text-center">
          <p>Loading shop and products...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!currentShop) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-red-600">Shop Not Found</h2>
          <p className="text-gray-600">The shop you are looking for does not exist or is not active.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Shop Banner Image (if available) */}
          {currentShop.banner_image_url && (
            <img
              src={currentShop.banner_image_url}
              alt={currentShop.name}
              className="w-full h-48 object-cover"
            />
          )}

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-gray-800">{currentShop.name}</h1>
              {currentShop.shop_type && (
                <Badge variant="secondary" className="px-3 py-1 text-sm bg-green-100 text-green-700">
                  {currentShop.shop_type.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              )}
            </div>

            {/* Shop Owner Info (assuming owner is part of shop data from backend) */}
            {currentShop.owner && (
              <p className="text-gray-600 mb-4">
                Owned by: <span className="font-semibold">{currentShop.owner.fullName || 'N/A'}</span>
              </p>
            )}

            {/* Shop Products */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Products from {currentShop.name}</h2>
              {shopProducts && shopProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shopProducts.map((product: any) => (
                    <Card key={product.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className-="relative">
                        <img
                          src={product.image_url || "https://via.placeholder.com/200"}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        {!product.is_available && (
                          <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                            <span className="text-white font-semibold">Out of Stock</span>
                          </div>
                        )}
                        {product.category && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                            {product.category}
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xl font-bold text-green-600">
                            ₹{product.price || 0}
                          </span>
                          <span className="text-gray-500 text-sm">per {product.unit || 'unit'}</span>
                        </div>

                        <Button
                          onClick={() => addToCart(product)}
                          disabled={!product.is_available}
                          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300"
                        >
                          {product.is_available ? "Add to Cart" : "Out of Stock"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No products available from this shop yet.</p>
              )}
            </div>

            {/* Shop Info */}
            <Card className="mt-8">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Shop Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-gray-600">{currentShop.address}, {currentShop.city}</p>
                    </div>
                  </div>
                  {currentShop.contact_phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Contact</p>
                        <p className="text-sm text-gray-600">{currentShop.contact_phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Hours</p>
                      <p className="text-sm text-gray-600">{currentShop.business_hours || '8:00 AM - 8:00 PM'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Delivery Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Radius</span>
                    <span className="font-semibold">{currentShop.delivery_radius || 5} km</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full bg-green-500 hover:bg-green-600 text-lg py-3"
                onClick={() => window.location.href = '/cart'}
              >
                View Cart & Checkout
              </Button>
              <Button variant="outline" className="w-full">
                Contact Shop
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ShopProfile;