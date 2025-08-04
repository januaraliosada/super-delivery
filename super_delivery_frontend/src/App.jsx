import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import FeaturedSection from './components/FeaturedSection.jsx'
import Footer from './components/Footer.jsx'
import { Toaster } from './components/ui/toaster.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { CartProvider } from './contexts/CartContext.jsx'
import './App.css'

// Hero Section Component
const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Delicious Food<br />
          Delivered Fast
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Order from your favorite restaurants and get fresh, hot meals delivered to your doorstep in minutes.
        </p>
        
        <div className="max-w-md mx-auto">
          <div className="flex bg-white rounded-lg p-2">
            <input
              type="text"
              placeholder="Enter your address to find restaurants near you"
              className="flex-1 px-4 py-2 text-gray-900 bg-transparent border-none outline-none"
            />
            <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
              Find Food
            </button>
          </div>
        </div>
        
        <div className="flex justify-center space-x-12 mt-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Fast Delivery</h3>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Real-time Tracking</h3>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Top Rated</h3>
          </div>
        </div>
      </div>
    </section>
  );
};

// Category Filter Component
const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    'All', 'Italian', 'Chinese', 'Mexican', 'Indian', 
    'American', 'Thai', 'Japanese', 'Mediterranean', 'Fast Food'
  ];

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Cuisine</h2>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
};

function App() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchResults, setSearchResults] = useState(null);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchResults(null); // Clear search results when category changes
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Header onSearchResults={handleSearchResults} />
          <HeroSection />
          
          <main className="container mx-auto px-4">
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
            
            {searchResults && searchResults.length > 0 ? (
              <FeaturedSection 
                title="Search Results" 
                restaurants={searchResults}
              />
            ) : searchResults && searchResults.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No restaurants found</h2>
                <p className="text-gray-600">Try searching for a different restaurant or cuisine.</p>
              </div>
            ) : (
              <>
                <FeaturedSection 
                  title="Popular Near You" 
                  filter={selectedCategory !== 'All' ? `cuisine_type=${selectedCategory}` : ''}
                />
                <FeaturedSection 
                  title="Fast Delivery" 
                  filter={selectedCategory !== 'All' ? `cuisine_type=${selectedCategory}` : ''}
                />
                <FeaturedSection 
                  title="Top Rated" 
                  filter={selectedCategory !== 'All' ? `cuisine_type=${selectedCategory}` : ''}
                />
              </>
            )}
          </main>
          
          <Footer />
          <Toaster />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

