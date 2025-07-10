
import { Clock, CheckCircle, Truck, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";

const OrderTracking = () => {
  const { user } = useAuth();
  const { orders, isLoading } = useOrders();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "out_for_delivery": return <Truck className="w-5 h-5 text-blue-500" />;
      case "preparing": return <Package className="w-5 h-5 text-yellow-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      delivered: "bg-green-100 text-green-800",
      out_for_delivery: "bg-blue-100 text-blue-800",
      preparing: "bg-yellow-100 text-yellow-800",
      pending: "bg-gray-100 text-gray-800",
      confirmed: "bg-purple-100 text-purple-800"
    };
    
    const labels = {
      delivered: "Delivered",
      out_for_delivery: "Out for Delivery",
      preparing: "Preparing",
      pending: "Pending",
      confirmed: "Confirmed"
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Please Sign In</h1>
            <p className="text-xl text-gray-600">You need to be logged in to view your orders.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Loading your orders...</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Tracking</h1>
          <p className="text-xl text-gray-600">Track your fresh fruit deliveries</p>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Orders Yet</h2>
            <p className="text-xl text-gray-600 mb-8">You haven't placed any orders yet.</p>
            <Button 
              onClick={() => window.location.href = '/products'}
              className="bg-green-500 hover:bg-green-600"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span>Order #{order.id.slice(-8)}</span>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Placed on {new Date(order.created_at).toLocaleDateString()} • {order.shops?.name || 'Unknown Shop'}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-lg font-bold mt-1">₹{order.total_amount || 0}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Details */}
                    <div>
                      <h3 className="font-semibold mb-4">Order Details</h3>
                      
                      {order.order_items && order.order_items.length > 0 ? (
                        <div className="space-y-3 mb-6">
                          {order.order_items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span>{item.quantity}x {item.products?.name || 'Unknown Item'}</span>
                              <span className="font-semibold">₹{item.total_price || 0}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 mb-6">No items found</p>
                      )}

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Address:</span>
                          <span className="font-medium">{order.delivery_address || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status:</span>
                          <span className="font-medium">{order.payment_status || 'Pending'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Status */}
                    <div>
                      <h3 className="font-semibold mb-4">Order Status</h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-3 h-3 rounded-full mt-1 bg-green-500" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">Order Placed</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-1 ${
                            ['confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(order.status) 
                              ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <div className="flex-1">
                            <p className={`font-medium ${
                              ['confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(order.status)
                                ? 'text-gray-800' : 'text-gray-400'
                            }`}>
                              Order Confirmed
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-1 ${
                            ['preparing', 'out_for_delivery', 'delivered'].includes(order.status) 
                              ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <div className="flex-1">
                            <p className={`font-medium ${
                              ['preparing', 'out_for_delivery', 'delivered'].includes(order.status)
                                ? 'text-gray-800' : 'text-gray-400'
                            }`}>
                              Preparing Order
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-1 ${
                            ['out_for_delivery', 'delivered'].includes(order.status) 
                              ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <div className="flex-1">
                            <p className={`font-medium ${
                              ['out_for_delivery', 'delivered'].includes(order.status)
                                ? 'text-gray-800' : 'text-gray-400'
                            }`}>
                              Out for Delivery
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-1 ${
                            order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <div className="flex-1">
                            <p className={`font-medium ${
                              order.status === 'delivered' ? 'text-gray-800' : 'text-gray-400'
                            }`}>
                              Delivered
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 mt-6 pt-6 border-t">
                    {order.status === "delivered" && (
                      <>
                        <Button variant="outline">Rate Order</Button>
                        <Button variant="outline">Reorder</Button>
                      </>
                    )}
                    {order.status !== "delivered" && (
                      <Button variant="outline">Contact Shop</Button>
                    )}
                    <Button variant="outline">Download Invoice</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-800 mb-3">Need Help?</h3>
            <p className="text-blue-700 mb-4">
              If you have any questions about your order or delivery, we're here to help!
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" className="border-blue-300 text-blue-700">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default OrderTracking;
