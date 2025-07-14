
import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";

const CATEGORY_LIST = [
  { value: 'all', label: 'All Categories' },
  { value: 'local', label: 'Local' },
  { value: 'organic', label: 'Organic' },
  { value: 'exotic', label: 'Exotic' },
  { value: 'citrus', label: 'Citrus' },
];
const BACKEND_URL = 'http://localhost:3000';


const ProductCatalog = () => {
  const { products, isLoading } = useProducts();
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterCategory, setFilterCategory] = useState("all");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Loading products...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const filteredProducts = (products || [])
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.shop?.name && product.shop.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(product => filterCategory === "all" || (product.category && product.category.toLowerCase() === filterCategory))
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "rating":
          return 0; // No rating system yet
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Fresh Fruits Catalog</h1>
          <p className="text-xl text-gray-600">Discover the freshest fruits from local shops</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search fruits or shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_LIST.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {filteredProducts.length} products
          </p>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found. Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">

                  <img
                    src={product.imageUrl?.startsWith('/') ? `${BACKEND_URL}${product.imageUrl}` : product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {!product.isAvailable && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
                  <p className="text-gray-600 text-sm mb-2">{product.shop?.name || 'Unknown Shop'}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-green-600">
                      RWF {product.price || 0}
                    </span>
                    {/* Removed unit display */}
                  </div>
                  {/* <Button
                    // onClick={() => addToCart(product)}
                    disabled={!product.isAvailable}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300"
                  >
                    {product.isAvailable ? "Add to Cart" : "Out of Stock"}
                  </Button> */}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductCatalog;
