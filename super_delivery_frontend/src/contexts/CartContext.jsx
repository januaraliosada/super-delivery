import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { useToast } from '@/hooks/useToast.js';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    total_items: 0,
    subtotal: 0.0,
    restaurant: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, getAuthToken } = useAuth();
  const { toast } = useToast();

  // Load cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Clear cart when user logs out
      setCart({
        items: [],
        total_items: 0,
        subtotal: 0.0,
        restaurant: null
      });
    }
  }, [isAuthenticated]);

  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Request failed');
    }

    return response.json();
  };

  const fetchCart = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const data = await makeAuthenticatedRequest('/api/cart');
      setCart(data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Don't show error toast for cart fetch failures
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (menuItem, quantity = 1, customizations = '') => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to add items to your cart.",
      });
      return { success: false, error: 'Authentication required' };
    }

    try {
      setIsLoading(true);
      
      const data = await makeAuthenticatedRequest('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          menu_item_id: menuItem.id,
          quantity: quantity,
          customizations: customizations
        })
      });

      if (data.success) {
        await fetchCart(); // Refresh cart
        toast({
          variant: "success",
          title: "Added to Cart",
          description: `${menuItem.name} has been added to your cart.`,
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add item to cart.",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    if (!isAuthenticated) return { success: false, error: 'Authentication required' };

    try {
      setIsLoading(true);
      
      const data = await makeAuthenticatedRequest(`/api/cart/update/${cartItemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      });

      if (data.success) {
        await fetchCart(); // Refresh cart
        toast({
          variant: "success",
          title: "Cart Updated",
          description: "Item quantity has been updated.",
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update cart item.",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!isAuthenticated) return { success: false, error: 'Authentication required' };

    try {
      setIsLoading(true);
      
      const data = await makeAuthenticatedRequest(`/api/cart/remove/${cartItemId}`, {
        method: 'DELETE'
      });

      if (data.success) {
        await fetchCart(); // Refresh cart
        toast({
          variant: "success",
          title: "Item Removed",
          description: "Item has been removed from your cart.",
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove item from cart.",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return { success: false, error: 'Authentication required' };

    try {
      setIsLoading(true);
      
      const data = await makeAuthenticatedRequest('/api/cart/clear', {
        method: 'DELETE'
      });

      if (data.success) {
        setCart({
          items: [],
          total_items: 0,
          subtotal: 0.0,
          restaurant: null
        });
        toast({
          variant: "success",
          title: "Cart Cleared",
          description: "All items have been removed from your cart.",
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to clear cart.",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const getCartCount = async () => {
    if (!isAuthenticated) return 0;

    try {
      const data = await makeAuthenticatedRequest('/api/cart/count');
      return data.count || 0;
    } catch (error) {
      console.error('Error fetching cart count:', error);
      return 0;
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.subtotal || 0;
    const deliveryFee = cart.restaurant?.delivery_fee || 2.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + deliveryFee + tax;

    return {
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      tax: tax,
      total: total
    };
  };

  const isCartFromDifferentRestaurant = (restaurantId) => {
    return cart.restaurant && cart.restaurant.id !== restaurantId && cart.items.length > 0;
  };

  const value = {
    cart,
    isLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    getCartCount,
    calculateTotals,
    isCartFromDifferentRestaurant
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

