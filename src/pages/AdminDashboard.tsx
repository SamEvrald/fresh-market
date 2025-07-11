import { useState, useEffect } from "react";
import axios from "../api/axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Store, ShoppingBag, TrendingUp, Clock, AlertCircle, Package, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AdminDashboard = () => {
  const [totalVendors, setTotalVendors] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topVendors, setTopVendors] = useState([]);

  useEffect(() => {
    // Replace with your actual backend endpoints
    const fetchStats = async () => {
      try {
        const statsRes = await axios.get("/admin/stats");
        setTotalVendors(statsRes.data.totalVendors);
        setTotalCustomers(statsRes.data.totalCustomers);
        setTotalOrders(statsRes.data.totalOrders);
        setTotalRevenue(statsRes.data.totalRevenue);
      } catch (err) {
        // handle error
      }
    };
    const fetchPendingVendors = async () => {
      try {
        const res = await axios.get("/admin/pending-vendors");
        setPendingVendors(res.data);
      } catch (err) {}
    };
    const fetchRecentOrders = async () => {
      try {
        const res = await axios.get("/admin/recent-orders");
        setRecentOrders(res.data);
      } catch (err) {}
    };
    const fetchTopVendors = async () => {
      try {
        const res = await axios.get("/admin/top-vendors");
        setTopVendors(res.data);
      } catch (err) {}
    };
    fetchStats();
    fetchPendingVendors();
    fetchRecentOrders();
    fetchTopVendors();
  }, []);

  const approveVendor = (vendorId: number) => {
    console.log("Approving vendor:", vendorId);
  };

  const rejectVendor = (vendorId: number) => {
    console.log("Rejecting vendor:", vendorId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your FreshMarket platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Vendors</p>
                  <p className="text-3xl font-bold text-gray-800">{totalVendors}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-800">{totalCustomers}</p>
                </div>
                <Users className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-800">{totalOrders}</p>
                </div>
                <Package className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Platform Revenue</p>
                  <p className="text-3xl font-bold text-gray-800">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="vendors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
            <TabsTrigger value="orders">Order Monitoring</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="settings">Platform Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="vendors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                    Pending Vendor Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingVendors.map((vendor) => (
                      <div key={vendor.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{vendor.name}</h4>
                            <p className="text-sm text-gray-600">Owner: {vendor.owner}</p>
                            <p className="text-sm text-gray-500">Applied: {vendor.date}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => approveVendor(vendor.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectVendor(vendor.id)}
                          >
                            Reject
                          </Button>
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Vendors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                    Top Performing Vendors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topVendors.map((vendor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{vendor.name}</h4>
                          <p className="text-sm text-gray-600">{vendor.orders} orders • ⭐ {vendor.rating}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{vendor.revenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-sm text-gray-600">
                          {order.customer} • {order.vendor}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold">₹{order.amount}</span>
                        <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status === 'completed' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>New Vendors (This Month)</span>
                      <span className="font-semibold text-green-600">+12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New Customers (This Month)</span>
                      <span className="font-semibold text-blue-600">+284</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Growth</span>
                      <span className="font-semibold text-purple-600">+18.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Monthly Revenue</span>
                      <span className="font-semibold">₹45,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commission Earned</span>
                      <span className="font-semibold">₹6,780</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Growth Rate</span>
                      <span className="font-semibold text-green-600">+15.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="disputes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600">No active disputes at the moment.</p>
                  <p className="text-sm text-gray-500 mt-2">Great job maintaining platform quality!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Commission Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Payment Gateway Configuration
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Notification Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Platform Policies
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
