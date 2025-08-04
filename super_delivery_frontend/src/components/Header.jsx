import { Search, ShoppingCart, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import '../App.css';

const Header = () => {
  return (
    <header className="bg-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">SUPER DELIVERY</h1>
          </div>

          {/* Location */}
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <MapPin size={16} />
            <span>Deliver to: Your Location</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search restaurants, cuisines, or dishes..."
                className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-white hover:bg-green-700">
              <ShoppingCart size={20} />
              <span className="ml-2 hidden sm:inline">Cart</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-green-700">
              <User size={20} />
              <span className="ml-2 hidden sm:inline">Account</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

