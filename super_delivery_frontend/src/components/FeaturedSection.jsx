import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import RestaurantCard from './RestaurantCard.jsx';
import '../App.css';

const FeaturedSection = ({ title, restaurants }) => {
  const sampleRestaurants = [
    {
      id: 1,
      name: "Mario's Italian Bistro",
      cuisine_type: "Italian",
      rating: 4.8,
      estimated_delivery_time: 25,
      delivery_fee: 2.99,
      image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop"
    },
    {
      id: 2,
      name: "Spice Garden",
      cuisine_type: "Indian",
      rating: 4.6,
      estimated_delivery_time: 35,
      delivery_fee: 3.49,
      image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop"
    },
    {
      id: 3,
      name: "Dragon Palace",
      cuisine_type: "Chinese",
      rating: 4.7,
      estimated_delivery_time: 30,
      delivery_fee: 2.49,
      image_url: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=300&h=200&fit=crop"
    },
    {
      id: 4,
      name: "Taco Fiesta",
      cuisine_type: "Mexican",
      rating: 4.5,
      estimated_delivery_time: 20,
      delivery_fee: 1.99,
      image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop"
    }
  ];

  const displayRestaurants = restaurants || sampleRestaurants;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title || "Featured Restaurants"}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="sm">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayRestaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedSection;

