import { Button } from '@/components/ui/button.jsx';
import '../App.css';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const defaultCategories = [
    'All',
    'Italian',
    'Chinese',
    'Mexican',
    'Indian',
    'American',
    'Thai',
    'Japanese',
    'Mediterranean',
    'Fast Food'
  ];

  const categoryList = categories || defaultCategories;

  return (
    <div className="py-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Cuisine</h2>
      <div className="flex flex-wrap gap-2">
        {categoryList.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className={`${
              selectedCategory === category
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "border-green-600 text-green-600 hover:bg-green-50"
            }`}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;

