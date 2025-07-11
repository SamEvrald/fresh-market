import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const VendorRegister = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    description: "",
    businessHours: "",
    deliveryRadius: "",
    shopType: "",
    website: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name: formData.shopName,
      description: formData.description,
      address: formData.address,
      city: formData.city,
      phoneNumber: formData.phone,
      email: formData.email,
      businessHours: formData.businessHours,
      deliveryRadius: formData.deliveryRadius ? parseInt(formData.deliveryRadius) : undefined,
      shopType: formData.shopType,
    };
    if (formData.website && formData.website.trim() !== "") {
      payload.website = formData.website;
    }
    try {
      await axios.post("/shops", payload);
      toast({
        title: "Registration Submitted!",
        description: "We'll review your application and get back to you within 24 hours.",
      });
      navigate("/vendor-dashboard");
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err?.response?.data?.message || err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Join FreshMarket as a Vendor
            </h1>
            <p className="text-xl text-gray-600">
              Start selling your fresh fruits to customers in your area
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-600">Shop Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shopName">Shop Name *</Label>
                      <Input
                        id="shopName"
                        value={formData.shopName}
                        onChange={(e) => handleInputChange("shopName", e.target.value)}
                        placeholder="e.g., Green Valley Fruits"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ownerName">Owner Name *</Label>
                      <Input
                        id="ownerName"
                        value={formData.ownerName}
                        onChange={(e) => handleInputChange("ownerName", e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1234567890"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">Location & Service Area</h3>
                  
                  <div>
                    <Label htmlFor="address">Shop Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Full shop address including street, area, and landmarks"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Your city"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryRadius">Delivery Radius (km) *</Label>
                      <Select onValueChange={(value) => handleInputChange("deliveryRadius", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delivery radius" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">Up to 2 km</SelectItem>
                          <SelectItem value="5">Up to 5 km</SelectItem>
                          <SelectItem value="10">Up to 10 km</SelectItem>
                          <SelectItem value="15">Up to 15 km</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">Business Details</h3>
                  
                  <div>
                    <Label htmlFor="shopType">Shop Type *</Label>
                    <Select onValueChange={(value) => handleInputChange("shopType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your shop type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Fruit Shop</SelectItem>
                        <SelectItem value="organic">Organic Fruits</SelectItem>
                        <SelectItem value="exotic">Exotic & Imported Fruits</SelectItem>
                        <SelectItem value="local">Local Farm Produce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="businessHours">Business Hours *</Label>
                    <Input
                      id="businessHours"
                      value={formData.businessHours}
                      onChange={(e) => handleInputChange("businessHours", e.target.value)}
                      placeholder="e.g., Mon-Sat: 8AM-8PM, Sun: 9AM-6PM"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Shop Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Tell customers about your shop, specialties, and what makes you unique"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://yourshopwebsite.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    Submit Registration
                  </Button>
                  <Button type="button" variant="outline" className="flex-1">
                    Save as Draft
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">What happens next?</h3>
              <ul className="space-y-2 text-blue-700">
                <li>✓ We'll review your application within 24 hours</li>
                <li>✓ Our team will contact you for verification</li>
                <li>✓ Once approved, you'll get access to your vendor dashboard</li>
                <li>✓ Start listing your products and accepting orders!</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VendorRegister;
