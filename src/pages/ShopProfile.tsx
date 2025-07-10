
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, Clock, MapPin, Phone, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";


const ShopProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopData = async () => {
      if (!id) return;

      try {
        // Fetch shop details
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select(`
            *,
            profiles:owner_id (full_name)
          `)
          .eq('id', id)
          .single();

        if (shopError) throw shopError;
        setShop(shopData);

        // Fetch shop products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', id)
          .eq('is_available', true);

        if (productsError) throw productsError;
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching shop data:', error);
        toast({
          title: "Error",
          description: "Failed to load shop information.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Loading shop information...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Shop Not Found</h1>
            <p className="text-xl text-gray-600">The shop you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <Card className="mb-8 overflow-hidden">
          <div className="relative h-64 md:h-80">
            <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-500 flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-4xl font-bold mb-2">{shop.name}</h1>
                <div className="flex items-center space-x-4 mb-2">
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    {shop.shop_type || 'Fruit Shop'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {shop.business_hours || '8:00 AM - 8:00 PM'}
                  </span>
                </div>
              </div>
            </div>
            {shop.is_active && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Open Now
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">About {shop.name}</h2>
                <p className="text-gray-600 mb-6">
                  {shop.description || 'Welcome to our fresh fruit shop! We provide quality fruits to our customers.'}
                </p>
              </CardContent>
            </Card>

            {/* Products Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Available Products</h2>
                {products.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No products available at the moment.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {products.map((product) => (
                      <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-square relative">
                          <img
                            src={product.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {!product.is_available && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white font-semibold">Out of Stock</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xl font-bold text-green-600">
                              ₹{product.price || 0}
                            </span>
                            <span className="text-gray-500 text-sm">per {product.unit || 'unit'}</span>
                          </div>
                          
                          <Button
                            onClick={() => addToCart({ ...product, shops: { name: shop.name } })}
                            disabled={!product.is_available}
                            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300"
                          >
                            {product.is_available ? (
                              <>
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Add to Cart
                              </>
                            ) : (
                              "Out of Stock"
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shop Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Shop Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-gray-600">{shop.address || 'Address not provided'}</p>
                      {shop.city && (
                        <p className="text-sm text-gray-600">{shop.city}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Hours</p>
                      <p className="text-sm text-gray-600">{shop.business_hours || '8:00 AM - 8:00 PM'}</p>
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
                    <span className="font-semibold">{shop.delivery_radius || 5} km</span>
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
