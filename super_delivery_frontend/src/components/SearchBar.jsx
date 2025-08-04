import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useApi } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

const SearchBar = ({ onResults, className }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const debouncedQuery = useDebounce(query, 300);
  const { get, loading, error } = useApi();

  useEffect(() => {
    const searchRestaurants = async () => {
      if (debouncedQuery.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      try {
        const data = await get(`/restaurants?search=${encodeURIComponent(debouncedQuery)}`);
        setResults(data.restaurants || []);
        setIsOpen(true);
        if (onResults) {
          onResults(data.restaurants || []);
        }
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
        setIsOpen(false);
      }
    };

    searchRestaurants();
  }, [debouncedQuery, get, onResults]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    if (onResults) {
      onResults([]);
    }
  };

  const handleResultClick = (restaurant) => {
    setQuery(restaurant.name);
    setIsOpen(false);
    if (onResults) {
      onResults([restaurant]);
    }
  };

  return (
    <div className={cn("relative flex-1 max-w-md mx-4", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search restaurants, cuisines, or dishes..."
          className="w-full pl-10 pr-10 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-300"
        />
        {loading && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="small" />
          </div>
        )}
        {query && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => handleResultClick(restaurant)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={restaurant.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=50&h=50&fit=crop"}
                  alt={restaurant.name}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=50&h=50&fit=crop";
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{restaurant.name}</h4>
                  <p className="text-sm text-gray-600">{restaurant.cuisine_type}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>★ {restaurant.rating}</span>
                    <span>•</span>
                    <span>{restaurant.estimated_delivery_time} min</span>
                    <span>•</span>
                    <span>${restaurant.delivery_fee}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {isOpen && results.length === 0 && debouncedQuery.trim().length >= 2 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500">
          No restaurants found for "{debouncedQuery}"
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-red-50 border border-red-200 rounded-lg shadow-lg z-50 p-4 text-center text-red-600">
          Error searching restaurants. Please try again.
        </div>
      )}
    </div>
  );
};

export default SearchBar;

