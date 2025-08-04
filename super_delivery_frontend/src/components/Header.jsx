import { useState, useEffect } from 'react';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';
import SearchBar from './SearchBar.jsx';
import AuthModal from './AuthModal.jsx';
import CartModal from './CartModal.jsx';
import ActiveOrders from './ActiveOrders.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useCart } from '@/contexts/CartContext.jsx';

const Header = ({ onSearchResults }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showActiveOrders, setShowActiveOrders] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, getCartCount } = useCart();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      updateCartCount();
    }
  }, [isAuthenticated, cart]);

  const updateCartCount = async () => {
    if (isAuthenticated) {
      const count = await getCartCount();
      setCartCount(count);
    } else {
      setCartCount(0);
    }
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      setShowActiveOrders(true);
    } else {
      setAuthMode('login');
      setShowAuthModal(true);
    }
  };

  const handleCartClick = () => {
    setShowCartModal(true);
  };

  const handleLogout = async () => {
    await logout();
    setCartCount(0);
  };

  const handleCheckout = () => {
    // This would typically navigate to a checkout page
    // For now, we'll just show a message
    alert('Checkout functionality would be implemented here');
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-600">SUPER DELIVERY</h1>
              <span className="text-sm text-gray-500 ml-2">
                Deliver to: Your Location
              </span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <SearchBar onSearchResults={onSearchResults} />
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <Button
                variant="outline"
                onClick={handleCartClick}
                className="relative"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
                <span className="ml-2 hidden sm:inline">Cart</span>
              </Button>

              {/* Account/Orders Button */}
              <Button
                variant="outline"
                onClick={handleAuthClick}
              >
                {isAuthenticated ? <Package size={20} /> : <User size={20} />}
                <span className="ml-2 hidden sm:inline">
                  {isAuthenticated ? 'Orders' : 'Account'}
                </span>
              </Button>

              {/* Logout Button (when authenticated) */}
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut size={20} />
                  <span className="ml-2 hidden sm:inline">Logout</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      <CartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        onCheckout={handleCheckout}
      />

      <ActiveOrders
        customerId={user?.id}
        isOpen={showActiveOrders}
        onClose={() => setShowActiveOrders(false)}
      />
    </>
  );
};

export default Header;

