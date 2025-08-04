import { useState } from 'react';
import Header from './components/Header.jsx';
import HeroSection from './components/HeroSection.jsx';
import CategoryFilter from './components/CategoryFilter.jsx';
import FeaturedSection from './components/FeaturedSection.jsx';
import Footer from './components/Footer.jsx';
import './App.css';

function App() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      
      <main className="container mx-auto px-4">
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <FeaturedSection title="Popular Near You" />
        <FeaturedSection title="Fast Delivery" />
        <FeaturedSection title="Top Rated" />
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
