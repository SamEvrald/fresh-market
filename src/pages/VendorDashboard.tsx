import { useState, useEffect } from "react";
import { Plus, Package, DollarSign, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useShops } from "@/hooks/useShops";
import { useProducts } from "@/hooks/useProducts";
import api from "@/api/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE_URL = 'http://localhost:3000/api/v1'; // Your NestJS backend URL

const CATEGORY_LIST = [
  { value: 'local', label: 'Local' },
  { value: 'organic', label: 'Organic' },
  { value: 'exotic', label: 'Exotic' },
  { value: 'citrus', label: 'Citrus' },
];

const VendorDashboard = () => {
  const { toast } = useToast();

  const [activeOrders, setActiveOrders] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [monthlyGrowth, setMonthlyGrowth] = useState(0); // This will need backend calculation
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  // Using the existing useProducts hook for product data
  const { products, isLoading: productsLoading, createProduct } = useProducts();
  // Using the existing useShops hook for shop data (if needed for vendor-specific dashboard info)
  const { shops, isLoading: shopsLoading, updateShop } = useShops();

  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
    imageFile: null,
    isAvailable: true,
  });

  useEffect(() => {
   const fetchDashboardData = async () => {
  try {
    // --- Fetch Shop-specific Products ---
    const { data: productsData } = await api.get('/shops/me/products');
    setTotalProducts(productsData.length);

    const sortedProducts = [...productsData]
      .sort((a: any, b: any) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 4);
    setTopProducts(sortedProducts.map((p: any) => ({
      name: p.name,
      sold: p.sold || 0,
      revenue: (p.sold || 0) * (p.price || 0)
    })));

    // --- Fetch Shop-specific Orders ---
    const { data: ordersData } = await api.get('/shops/me/orders');

    const active = ordersData.filter((order: any) =>
      ['New', 'Preparing', 'Out for Delivery'].includes(order.status)
    ).length;
    setActiveOrders(active);

    const today = new Date().toISOString().split('T')[0];
    let revenueToday = 0;
    const recent: any[] = [];

    ordersData.forEach((order: any) => {
      if (order.createdAt?.startsWith(today)) {
        revenueToday += order.total_amount || 0;
      }
      recent.push({
        id: order.id,
        customer: order.customer_name || 'N/A',
        items: order.items.map((item: any) => `${item.quantity}x ${item.product_name}`).join(', '),
        amount: order.total_amount,
        status: order.status,
        time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    });

    setTodayRevenue(revenueToday);
    setRecentOrders(recent.slice(0, 5));

    setMonthlyGrowth(18.5); // Placeholder
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to load dashboard data.",
      variant: "destructive",
    });
  }
};
    fetchDashboardData();
  }, [toast, products, shops]); // Dependencies: re-run if products or shops data from hooks change

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-100 text-blue-800";
      case "Preparing": return "bg-yellow-100 text-yellow-800";
      case "Out for Delivery": return "bg-purple-100 text-purple-800";
      case "Delivered": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddProduct = () => {
    setShowProductModal(true);
  };

  const handleProductInputChange = (field: string, value: string) => {
    setProductForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProductForm(prev => ({ ...prev, imageFile: e.target.files[0] }));
    }
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate({
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      category: productForm.category,
      stockQuantity: parseInt(productForm.stock),
      isAvailable: productForm.isAvailable,
      imageFile: productForm.imageFile,
    });
    setShowProductModal(false);
    setProductForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      imageUrl: "",
      imageFile: null,
      isAvailable: true,
    });
  };

 const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
  try {
    await api.patch(`/shops/me/orders/${orderId}/status`, { status: newStatus });

    toast({
      title: "Order Status Updated",
      description: `Order ${orderId} status changed to ${newStatus}.`,
    });

    window.location.reload();
  } catch (error: any) {
    console.error("Error updating order status:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to update order status.",
      variant: "destructive",
    });
  }
};



  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Vendor Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your shop overview.</p>
          </div>
          <Button className="bg-green-500 hover:bg-green-600" onClick={handleAddProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <p className="text-3xl font-bold text-gray-800">{activeOrders}</p>
                </div>
                <Package className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Revenue</p>
                  <p className="text-3xl font-bold text-gray-800">RWF {todayRevenue}</p>
                </div>
                <DollarSign className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-3xl font-bold text-gray-800">{totalProducts}</p>
                </div>
                <Users className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Growth</p>
                  <p className="text-3xl font-bold text-gray-800">+{monthlyGrowth}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="products">My Products</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Shop Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-semibold">{order.id}</p>
                            <p className="text-sm text-gray-600">{order.customer}</p>
                          </div>
                          <div>
                            <p className="text-sm">{order.items}</p>
                            <p className="text-sm text-gray-500">{order.time}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold">RWF {order.amount}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => handleUpdateOrderStatus(order.id, "Delivered")}>
                          Update to Delivered
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productsLoading ? (
                    <div>Loading products...</div>
                  ) : (
                    topProducts.map((product: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.sold} sold</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">RWF {product.revenue}</p>
                          <p className="text-sm text-gray-600">Revenue</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* These would ideally come from your backend's analytics endpoint */}
                    <div className="flex justify-between">
                      <span>This Week</span>
                      <span className="font-semibold">RWF 12,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Week</span>
                      <span className="font-semibold">RWF 10,200</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Growth</span>
                      <span className="font-semibold">+22%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* These would ideally come from your backend's analytics/customer endpoint */}
                    <div className="flex justify-between">
                      <span>Total Customers</span>
                      <span className="font-semibold">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Repeat Customers</span>
                      <span className="font-semibold">89</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg. Order Value</span>
                      <span className="font-semibold">RWF 285</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shop Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Update Shop Information {/* This would trigger useShops.updateShop */}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Manage Business Hours
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Delivery Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Payment Methods {/* Integrates with usePayments */}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Product Creation Modal */}
        <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input id="productName" value={productForm.name} onChange={e => handleProductInputChange("name", e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="productDescription">Description</Label>
                <Textarea id="productDescription" value={productForm.description} onChange={e => handleProductInputChange("description", e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="productPrice">Price</Label>
                <Input id="productPrice" type="number" min="0" step="0.01" value={productForm.price} onChange={e => handleProductInputChange("price", e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="productStock">Stock</Label>
                <Input id="productStock" type="number" min="0" value={productForm.stock} onChange={e => handleProductInputChange("stock", e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="productCategory">Category</Label>
                <Select value={productForm.category} onValueChange={value => handleProductInputChange("category", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_LIST.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Removed unit field from product creation */}
              <div>
                <Label htmlFor="productImage">Image</Label>
                <Input id="productImage" type="file" accept="image/*" onChange={handleProductFileChange} />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">Add Product</Button>
                <Button type="button" variant="outline" onClick={() => setShowProductModal(false)}>Cancel</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VendorDashboard;