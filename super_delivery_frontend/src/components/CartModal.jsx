import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner.jsx';
import { useCart } from '@/contexts/CartContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

const CartModal = ({ isOpen, onClose, onCheckout }) => {
  const { cart, isLoading, updateCartItem, removeFromCart, clearCart, calculateTotals } = useCart();
  const { isAuthenticated } = useAuth();
  const [updatingItems, setUpdatingItems] = useState(new Set());

  const totals = calculateTotals();

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 0) return;

    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    
    if (newQuantity === 0) {
      await removeFromCart(cartItemId);
    } else {
      await updateCartItem(cartItemId, newQuantity);
    }
    
    setUpdatingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(cartItemId);
      return newSet;
    });
  };

  const handleRemoveItem = async (cartItemId) => {
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    await removeFromCart(cartItemId);
    setUpdatingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(cartItemId);
      return newSet;
    });
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) return;
    
    if (totals.subtotal < (cart.restaurant?.minimum_order || 15)) {
      return;
    }
    
    onCheckout();
    onClose();
  };

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to view your cart and place orders.</p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
              {cart.restaurant && (
                <p className="text-gray-600">{cart.restaurant.name}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {cart.items.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCart}
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && cart.items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="large" />
              <span className="ml-3 text-gray-600">Loading cart...</span>
            </div>
          ) : cart.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
              <Button onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    {/* Item Image */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      {item.customizations && (
                        <p className="text-sm text-blue-600 mt-1">
                          Customizations: {item.customizations}
                        </p>
                      )}
                      <p className="text-sm font-medium text-green-600 mt-1">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={updatingItems.has(item.id)}
                        className="w-8 h-8 p-0"
                      >
                        <Minus size={16} />
                      </Button>
                      
                      <span className="w-8 text-center font-medium">
                        {updatingItems.has(item.id) ? (
                          <LoadingSpinner size="small" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={updatingItems.has(item.id)}
                        className="w-8 h-8 p-0"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${item.item_total.toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={updatingItems.has(item.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cart.total_items} items)</span>
                    <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">${totals.deliveryFee.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${totals.tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold text-green-600">
                      ${totals.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Minimum Order Warning */}
                {cart.restaurant && totals.subtotal < cart.restaurant.minimum_order && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 text-sm">
                      Minimum order amount is ${cart.restaurant.minimum_order.toFixed(2)}. 
                      Add ${(cart.restaurant.minimum_order - totals.subtotal).toFixed(2)} more to proceed.
                    </p>
                  </div>
                )}

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={
                    cart.items.length === 0 || 
                    isLoading || 
                    (cart.restaurant && totals.subtotal < cart.restaurant.minimum_order)
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : (
                    `Proceed to Checkout • ${totals.total.toFixed(2)}`
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;

