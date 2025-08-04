import { Search, Truck, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import '../App.css';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Delicious Food
              <br />
              <span className="text-green-200">Delivered Fast</span>
            </h1>
            <p className="text-xl mb-8 text-green-100">
              Order from your favorite restaurants and get fresh, hot meals delivered to your doorstep in minutes.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg p-2 flex items-center mb-8">
              <Search className="text-gray-400 ml-3" size={20} />
              <input
                type="text"
                placeholder="Enter your address to find restaurants near you"
                className="flex-1 px-4 py-3 text-gray-900 focus:outline-none"
              />
              <Button className="bg-green-600 hover:bg-green-700 text-white px-6">
                Find Food
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-500 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <p className="text-sm">Fast Delivery</p>
              </div>
              <div className="text-center">
                <div className="bg-green-500 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <p className="text-sm">Real-time Tracking</p>
              </div>
              <div className="text-center">
                <div className="bg-green-500 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <Star size={20} />
                </div>
                <p className="text-sm">Top Rated</p>
              </div>
            </div>
          </div>

          {/* Right Content - App Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src="/src/assets/super_delivery_customer_app_concept_refined.png"
                alt="SUPER DELIVERY App Preview"
                className="w-80 h-auto rounded-3xl shadow-2xl"
              />
              <div className="absolute -top-4 -right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Download Now!
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

