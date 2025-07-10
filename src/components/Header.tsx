
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, Store, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";

const Header = () => {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const { getCartCount } = useCart();
  const cartItems = getCartCount();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold text-gray-800">FreshMarket</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => handleNavigation("/products")}
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Products
            </button>
            {user && userRole === 'vendor' && (
              <button 
                onClick={() => handleNavigation("/vendor/dashboard")}
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                My Shop
              </button>
            )}
            {user && userRole === 'admin' && (
              <button 
                onClick={() => handleNavigation("/admin")}
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Admin
              </button>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Cart - only show for customers */}
                {userRole !== 'vendor' && userRole !== 'admin' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative"
                    onClick={() => handleNavigation("/cart")}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartItems > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-green-500">
                        {cartItems}
                      </Badge>
                    )}
                  </Button>
                )}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="w-5 h-5 mr-2" />
                      Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      Role: {userRole || 'customer'}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleNavigation("/account")}>
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation("/orders")}>
                      <Store className="w-4 h-4 mr-2" />
                      My Orders
                    </DropdownMenuItem>
                    {userRole === 'vendor' && (
                      <DropdownMenuItem onClick={() => handleNavigation("/vendor/register")}>
                        <Store className="w-4 h-4 mr-2" />
                        Manage Shop
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleNavigation("/auth")}
                >
                  Sign In
                </Button>
                <Button 
                  size="sm" 
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => handleNavigation("/auth")}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
