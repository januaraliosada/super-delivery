import { useState, useEffect } from 'react';
import { Clock, MapPin, Phone, CheckCircle, Truck, ChefHat, Package, Star } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner.jsx';
import { useApi } from '@/hooks/useApi.js';
import { useToast } from '@/hooks/useToast.js';

const OrderTracking = ({ orderId, onClose }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const { get, loading, error } = useApi();
  const { toast } = useToast();

  useEffect(() => {
    fetchTrackingData();
    
    // Set up auto-refresh every 30 seconds for active orders
    const interval = setInterval(() => {
      if (trackingData && !['delivered', 'cancelled'].includes(trackingData.status)) {
        fetchTrackingData();
      }
    }, 30000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderId]);

  const fetchTrackingData = async () => {
    try {
      const data = await get(`/orders/${orderId}/tracking`);
      setTrackingData(data.tracking);
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load order tracking information.",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'placed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'confirmed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'preparing':
        return <ChefHat className="text-blue-500" size={20} />;
      case 'ready':
        return <Package className="text-orange-500" size={20} />;
      case 'picked_up':
        return <Truck className="text-purple-500" size={20} />;
      case 'delivered':
        return <CheckCircle className="text-green-500" size={20} />;
      default:
        return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getStatusColor = (status, completed) => {
    if (!completed) return 'text-gray-400';
    
    switch (status) {
      case 'placed':
      case 'confirmed':
      case 'delivered':
        return 'text-green-600';
      case 'preparing':
        return 'text-blue-600';
      case 'ready':
        return 'text-orange-600';
      case 'picked_up':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEstimatedDeliveryTime = () => {
    if (!trackingData || !trackingData.timeline) return null;
    
    const deliveryStep = trackingData.timeline.find(step => step.status === 'delivered');
    if (deliveryStep && deliveryStep.estimated) {
      return new Date(deliveryStep.timestamp);
    }
    return null;
  };

  if (loading && !trackingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="large" />
            <span className="ml-3 text-lg">Loading order tracking...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-6">Unable to load tracking information for this order.</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    );
  }

  const estimatedDelivery = getEstimatedDeliveryTime();
  const isActive = !['delivered', 'cancelled'].includes(trackingData.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order Tracking</h2>
              <p className="text-gray-600">Order #{trackingData.order_id}</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          
          {/* Status Badge */}
          <div className="mt-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              trackingData.status === 'delivered' ? 'bg-green-100 text-green-800' :
              trackingData.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {trackingData.status.charAt(0).toUpperCase() + trackingData.status.slice(1).replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Restaurant</h3>
              <p className="text-lg font-medium">{trackingData.restaurant.name}</p>
              {trackingData.restaurant.phone && (
                <div className="flex items-center text-gray-600 mt-1">
                  <Phone size={16} className="mr-2" />
                  <span>{trackingData.restaurant.phone}</span>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Delivery Address</h3>
              <div className="flex items-start text-gray-600">
                <MapPin size={16} className="mr-2 mt-1 flex-shrink-0" />
                <span>{trackingData.delivery_address}</span>
              </div>
            </div>
          </div>

          {/* Driver Info */}
          {trackingData.driver_info && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Your Driver</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{trackingData.driver_info.name}</p>
                  <div className="flex items-center text-gray-600">
                    <Phone size={16} className="mr-2" />
                    <span>{trackingData.driver_info.phone}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <span className="ml-1 text-sm font-medium">{trackingData.driver_info.rating}</span>
                </div>
              </div>
            </div>
          )}

          {/* Estimated Delivery Time */}
          {estimatedDelivery && isActive && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="text-green-600 mr-2" size={20} />
                <div>
                  <p className="font-semibold text-green-800">Estimated Delivery</p>
                  <p className="text-green-700">{formatTime(estimatedDelivery.toISOString())}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
          <div className="space-y-4">
            {trackingData.timeline.map((step, index) => (
              <div key={index} className="flex items-start">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {getStatusIcon(step.status)}
                </div>
                
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${getStatusColor(step.status, step.completed)}`}>
                      {step.title}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {step.estimated ? 'Est. ' : ''}{formatTime(step.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div className="p-6 border-t bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Order Total</span>
            <span className="text-xl font-bold text-green-600">
              ${trackingData.total_amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Auto-refresh indicator */}
        {isActive && (
          <div className="px-6 pb-4">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Updates automatically every 30 seconds
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;

