
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">🍎</span>
              </div>
              <span className="text-xl font-bold">FreshMarket</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Connecting local fruit shops with customers for fresh, quality produce delivered to your doorstep.
            </p>
          </div>

          {/* For Customers */}
          <div>
            <h3 className="font-semibold mb-4">For Customers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-gray-300 hover:text-green-400 transition-colors">Browse Fruits</Link></li>
              <li><Link to="/shops" className="text-gray-300 hover:text-green-400 transition-colors">Find Shops</Link></li>
              <li><Link to="/orders" className="text-gray-300 hover:text-green-400 transition-colors">Track Orders</Link></li>
              <li><Link to="/account" className="text-gray-300 hover:text-green-400 transition-colors">My Account</Link></li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="font-semibold mb-4">For Vendors</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/vendor/register" className="text-gray-300 hover:text-green-400 transition-colors">Register Shop</Link></li>
              <li><Link to="/vendor/dashboard" className="text-gray-300 hover:text-green-400 transition-colors">Shop Dashboard</Link></li>
              <li><Link to="/vendor/help" className="text-gray-300 hover:text-green-400 transition-colors">Vendor Help</Link></li>
              <li><Link to="/vendor/pricing" className="text-gray-300 hover:text-green-400 transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="text-gray-300 hover:text-green-400 transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-green-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-green-400 transition-colors">About Us</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-green-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300 text-sm">
            © 2024 FreshMarket. All rights reserved. Built with ❤️ for local fruit shops.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
