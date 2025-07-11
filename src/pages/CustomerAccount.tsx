// src/pages/CustomerAccount.tsx
import { useState, useEffect } from "react";
import { User, MapPin, CreditCard, Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
// import { supabase } from "@/integrations/supabase/client"; // REMOVED: Import supabase client

const CustomerAccount = () => {
  const { toast } = useToast();
  // REMOVED: deleteAccount from useAuth. This functionality should be handled by your backend auth service.
  const { user, updatePassword, signOut } = useAuth();
  const { orders, isLoadingOrders } = useOrders();


  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        // TODO: Replace with your backend API call to fetch user profile
        // Example: const response = await yourBackendService.getUserProfile(user.id);
        // For now, simulating with user data from AuthContext
        setUserInfo({
          fullName: user.full_name || "",
          email: user.email || "",
          phone: user.phone || "",// Assuming phone is part of user_metadata
        });
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile information.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user, toast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileEditing(true);
    try {
      // TODO: Replace with your backend API call to update user profile
      // Example: await yourBackendService.updateUserProfile(user.id, userInfo);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProfileEditing(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.email) {
      toast({
        title: "Error",
        description: "User email not found. Cannot change password.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      // Assuming updatePassword in useAuth handles the backend call
      const { error } = await updatePassword(user.email, newPassword);
      if (error) {
        throw error;
      }
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      console.error("Failed to change password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "No user logged in to delete.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        // TODO: Replace with your backend API call to delete user account
        // Example: await yourBackendService.deleteAccount(user.id);
        // Assuming signOut is called after successful deletion from backend
        signOut(); // Sign out the user from the frontend
        toast({
          title: "Account Deleted",
          description: "Your account has been successfully deleted.",
        });
      } catch (error: any) {
        console.error("Failed to delete account:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete account. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const [addresses] = useState([
    {
      id: 1,
      type: "Home",
      address: "123 Main Street, Downtown, City - 12345",
      isDefault: true,
    },
    {
      id: 2,
      type: "Office",
      address: "456 Business Park, Corporate District, City - 67890",
      isDefault: false,
    },
  ]);

  // Orders are now fetched via useOrders hook
  const customerOrders = orders?.filter(order => order.customer_id === user?.id) || [];


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Account</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" /> Profile
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="w-4 h-4 mr-2" /> Orders
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="w-4 h-4 mr-2" /> Addresses
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProfile ? (
                  <p>Loading profile...</p>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={userInfo.fullName}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, fullName: e.target.value })
                        }
                        disabled={isProfileEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userInfo.email}
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={userInfo.phone}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, phone: e.target.value })
                        }
                        disabled={isProfileEditing}
                      />
                    </div>
                    <Button type="submit" disabled={isProfileEditing}>
                      {isProfileEditing ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <p>Loading orders...</p>
                ) : customerOrders.length === 0 ? (
                  <p>You haven't placed any orders yet.</p>
                ) : (
                  <div className="space-y-4">
                    {customerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                      >
                        <div>
                          <p className="font-semibold">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">
                            Date: {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Shop: {order.shops?.name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Total Items: {order.order_items?.length || 0}
                          </p>
                        </div>
                        <div className="mt-3 sm:mt-0 text-right">
                          <p className="text-lg font-bold text-green-600">
                            ₹{order.total_price}
                          </p>
                          <p className={`text-sm font-medium ${
                              order.status === 'delivered' ? 'text-green-600' :
                              order.status === 'pending' ? 'text-yellow-600' :
                              'text-blue-600'
                          }`}>
                            Status: {order.status}
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Addresses</CardTitle>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <p>You have no saved addresses.</p>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="border rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold">{addr.type}</p>
                          <p className="text-sm text-gray-600">
                            {addr.address}
                          </p>
                          {addr.isDefault && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-1 inline-block">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button className="mt-4 w-full">Add New Address</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order Updates</p>
                    <p className="text-sm text-gray-600">
                      Get real-time updates on your orders
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Promotions & Offers</p>
                    <p className="text-sm text-gray-600">
                      Receive deals from your favorite shops
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Shop Alerts</p>
                    <p className="text-sm text-gray-600">
                      Know when new shops join in your area
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Disable
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isUpdatingPassword}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmNewPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      disabled={isUpdatingPassword}
                    />
                  </div>
                  <Button type="submit" className="w-full justify-start" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </form>
                <Button variant="outline" className="w-full justify-start">
                  Download My Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default CustomerAccount;