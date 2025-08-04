import { useState } from 'react';
import { Star, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import OrderModal from './OrderModal.jsx';
import '../App.css';

const RestaurantCard = ({ restaurant }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    name = "Sample Restaurant",
    cuisine_type = "Italian",
    rating = 4.5,
    estimated_delivery_time = 30,
    delivery_fee = 2.99,
    image_url = "/api/placeholder/300/200"
  } = restaurant || {};

  const handleViewMenu = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Restaurant Image */}
        <div className="relative h-48 bg-gray-200">
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop";
            }}
          />
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-semibold">
            {cuisine_type}
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
          
          <div className="flex items-center justify-between mb-3">
            {/* Rating */}
            <div className="flex items-center space-x-1">
              <Star className="text-yellow-400 fill-current" size={16} />
              <span className="text-sm font-medium">{rating}</span>
            </div>

            {/* Delivery Time */}
            <div className="flex items-center space-x-1 text-gray-600">
              <Clock size={16} />
              <span className="text-sm">{estimated_delivery_time} min</span>
            </div>

            {/* Delivery Fee */}
            <div className="flex items-center space-x-1 text-gray-600">
              <DollarSign size={16} />
              <span className="text-sm">${delivery_fee}</span>
            </div>
          </div>

          {/* Order Button */}
          <Button 
            onClick={handleViewMenu}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            View Menu
          </Button>
        </div>
      </div>

      {/* Order Modal */}
      <OrderModal
        restaurant={restaurant}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default RestaurantCard;

