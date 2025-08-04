import { useState, useEffect } from 'react';
import { Clock, MapPin, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner.jsx';
import OrderTracking from './OrderTracking.jsx';
import { useApi } from '@/hooks/useApi.js';
import { useToast } from '@/hooks/useToast.js';

const ActiveOrders = ({ customerId, isOpen, onClose }) => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const { get, loading, error } = useApi();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && customerId) {
      fetchActiveOrders();
      
      // Set up auto-refresh every 60 seconds
      const interval = setInterval(() => {
        fetchActiveOrders();
      }, 60000);
      
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [isOpen, customerId]);

  const fetchActiveOrders = async () => {
    try {
      const data = await get(`/orders/customer/${customerId}/active`);
      setActiveOrders(data.active_orders || []);
    } catch (err) {
      console.error('Error fetching active orders:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load active orders.",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      case 'picked_up':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Order Placed';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready for Pickup';
      case 'picked_up':
        return 'Out for Delivery';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleTrackOrder = (orderId) => {
    setSelectedOrderId(orderId);
  };

  const handleCloseTracking = () => {
    setSelectedOrderId(null);
  };

  const handleRefresh = () => {
    fetchActiveOrders();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Active Orders</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading && activeOrders.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="large" />
                <span className="ml-3 text-gray-600">Loading active orders...</span>
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Orders</h3>
                <p className="text-gray-600">You don't have any active orders at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.restaurant_name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Order ID</p>
                            <p className="font-medium">#{order.id}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">Order Time</p>
                            <p className="font-medium">{formatTime(order.created_at)}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="font-medium text-green-600">${order.total_amount.toFixed(2)}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">Estimated Delivery</p>
                            <p className="font-medium">{order.estimated_delivery_time} min</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                          <div className="flex items-start text-gray-800">
                            <MapPin size={16} className="mr-2 mt-1 flex-shrink-0" />
                            <span className="text-sm">{order.delivery_address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleTrackOrder(order.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Eye size={16} className="mr-2" />
                        Track Order
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auto-refresh indicator */}
          {activeOrders.length > 0 && (
            <div className="px-6 pb-4 border-t bg-gray-50">
              <div className="flex items-center justify-center text-sm text-gray-500 py-2">
                <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Updates automatically every minute
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Tracking Modal */}
      {selectedOrderId && (
        <OrderTracking
          orderId={selectedOrderId}
          onClose={handleCloseTracking}
        />
      )}
    </>
  );
};

export default ActiveOrders;

