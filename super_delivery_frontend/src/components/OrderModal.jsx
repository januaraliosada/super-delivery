import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner.jsx';
import { useApi } from '@/hooks/useApi.js';
import { useToast } from '@/hooks/useToast.js';

const OrderModal = ({ restaurant, isOpen, onClose }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { post } = useApi();
  const { toast } = useToast();

  const sampleMenuItems = [
    { id: 1, name: "Margherita Pizza", price: 12.99, description: "Fresh tomatoes, mozzarella, basil" },
    { id: 2, name: "Pepperoni Pizza", price: 14.99, description: "Pepperoni, mozzarella, tomato sauce" },
    { id: 3, name: "Caesar Salad", price: 8.99, description: "Romaine lettuce, parmesan, croutons" },
    { id: 4, name: "Garlic Bread", price: 5.99, description: "Fresh bread with garlic butter" }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!customerInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(customerInfo.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!customerInfo.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }
    
    if (!customerInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (orderItems.length === 0) {
      newErrors.items = 'Please add at least one item to your order';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addToOrder = (item) => {
    setOrderItems(prev => {
      const existing = prev.find(orderItem => orderItem.id === item.id);
      if (existing) {
        return prev.map(orderItem =>
          orderItem.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromOrder = (itemId) => {
    setOrderItems(prev => {
      return prev.map(orderItem =>
        orderItem.id === itemId
          ? { ...orderItem, quantity: Math.max(0, orderItem.quantity - 1) }
          : orderItem
      ).filter(orderItem => orderItem.quantity > 0);
    });
  };

  const calculateTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = restaurant?.delivery_fee || 2.99;
    const tax = subtotal * 0.08; // 8% tax
    return {
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      tax: tax.toFixed(2),
      total: (subtotal + deliveryFee + tax).toFixed(2)
    };
  };

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        restaurant_id: restaurant.id,
        customer_info: customerInfo,
        items: orderItems,
        totals: calculateTotal()
      };

      await post('/orders', orderData);
      
      toast({
        variant: "success",
        title: "Order Placed Successfully!",
        description: `Your order from ${restaurant.name} has been confirmed.`,
      });
      
      onClose();
      setOrderItems([]);
      setCustomerInfo({ name: '', phone: '', address: '', email: '' });
      setErrors({});
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: err.message || "Failed to place order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totals = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{restaurant?.name || 'Restaurant'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold mb-4">Menu</h3>
          <div className="space-y-4">
            {sampleMenuItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-lg font-semibold text-green-600">${item.price}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromOrder(item.id)}
                    disabled={!orderItems.find(orderItem => orderItem.id === item.id)}
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="w-8 text-center">
                    {orderItems.find(orderItem => orderItem.id === item.id)?.quantity || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToOrder(item)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Information */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Address *
              </label>
              <textarea
                value={customerInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your complete delivery address"
                rows="3"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
          </div>
          {errors.items && <p className="text-red-500 text-sm mt-2">{errors.items}</p>}
        </div>

        {/* Order Summary */}
        {orderItems.length > 0 && (
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2">
              {orderItems.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${totals.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>${totals.deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${totals.tax}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${totals.total}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6">
          <div className="flex space-x-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitOrder}
              disabled={isSubmitting || orderItems.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Placing Order...
                </>
              ) : (
                <>
                  <ShoppingCart size={16} className="mr-2" />
                  Place Order (${totals.total})
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;

