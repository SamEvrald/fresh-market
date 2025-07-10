
import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PaymentModal from "@/components/PaymentModal";
import { useCartIntegration } from "@/hooks/useCartIntegration";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ShoppingCartPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { processOrder, isProcessing } = useCartIntegration();
  
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  
  const deliveryFee = 50;
  const freeDeliveryThreshold = 500;

  const subtotal = getCartTotal();
  const isEligibleForFreeDelivery = subtotal >= freeDeliveryThreshold;
  const finalDeliveryFee = isEligibleForFreeDelivery ? 0 : deliveryFee;
  const total = subtotal + finalDeliveryFee;

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Please Sign In",
        description: "You need to be logged in to checkout.",
        variant: "destructive"
      });
      return;
    }

    if (!deliveryAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter your delivery address to proceed.",
        variant: "destructive"
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart is Empty",
        description: "Please add items to your cart before checkout.",
        variant: "destructive"
      });
      return;
    }

    // Process the order
    const order = await processOrder({
      items: cartItems,
      deliveryAddress,
      total,
      deliveryFee: finalDeliveryFee
    });

    if (order) {
      setCurrentOrder({
        id: order.id,
        total: total,
        customerName: user.user_metadata?.full_name || 'Customer'
      });
      setIsPaymentModalOpen(true);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Please Sign In</h1>
            <p className="text-xl text-gray-600 mb-8">
              You need to be logged in to view your cart.
            </p>
            <Button 
              size="lg" 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => window.location.href = '/auth'}
            >
              Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
            <p className="text-xl text-gray-600 mb-8">
              Looks like you haven't added any fruits to your cart yet.
            </p>
            <Button 
              size="lg" 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => window.location.href = '/products'}
            >
              Start Shopping
            </Button>
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-gray-600 text-sm">{item.shop}</p>
                      <p className="text-green-600 font-semibold">
                        ₹{item.price} per {item.unit}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ₹{item.price * item.quantity}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Enter your delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="mb-4"
                />
                <Button variant="outline" size="sm" className="w-full">
                  Use Current Location
                </Button>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className={isEligibleForFreeDelivery ? "line-through text-gray-500" : ""}>
                    ₹{deliveryFee}
                  </span>
                </div>
                
                {isEligibleForFreeDelivery && (
                  <div className="text-green-600 text-sm font-semibold">
                    🎉 Free delivery unlocked!
                  </div>
                )}
                
                {!isEligibleForFreeDelivery && (
                  <div className="text-orange-600 text-sm">
                    Add ₹{freeDeliveryThreshold - subtotal} more for free delivery
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full bg-green-500 hover:bg-green-600 text-lg py-3"
                >
                  {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                </Button>
                
                <div className="text-center text-sm text-gray-500">
                  Secure checkout powered by SSL encryption
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Accepted Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-blue-600 font-semibold">💳</div>
                    <div className="text-xs">Cards</div>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <div className="text-yellow-600 font-semibold">📱</div>
                    <div className="text-xs">MTN Money</div>
                  </div>
                  <div className="bg-red-50 p-2 rounded">
                    <div className="text-red-600 font-semibold">💰</div>
                    <div className="text-xs">Airtel Money</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {currentOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          orderData={currentOrder}
        />
      )}

      <Footer />
    </div>
  );
};

export default ShoppingCartPage;
