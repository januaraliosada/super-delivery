import { useState } from 'react';
import Header from './components/Header.jsx';
import HeroSection from './components/HeroSection.jsx';
import CategoryFilter from './components/CategoryFilter.jsx';
import FeaturedSection from './components/FeaturedSection.jsx';
import Footer from './components/Footer.jsx';
import { Toaster } from './components/ui/toaster.jsx';
import './App.css';

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
  );
}

export default App;
