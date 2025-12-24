import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CategoryHeroProps {
  totalCategories: number;
  topCategories: string[];
}

export const CategoryHero: React.FC<CategoryHeroProps> = ({
  totalCategories,
  topCategories,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app this would go to a search results page or filter the current list
      // For this demo, we'll just log it or pass it up if we added a callback
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <div className="bg-gradient-to-b from-carbon-900 to-carbon-800 py-12 px-6 border-b border-carbon-700">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
          Find Your Perfect Specialist
        </h1>

        <p className="text-sm md:text-base text-gray-400 mb-8">
          {totalCategories}+ service categories. Local & remote experts.
        </p>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-xl mx-auto group">
            <input
              type="text"
              placeholder="Search skills or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-lg bg-carbon-700 text-white placeholder-gray-500 border border-carbon-600 focus:border-locale-blue focus:outline-none focus:ring-1 focus:ring-locale-blue transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 text-sm bg-locale-blue text-white rounded font-medium hover:bg-locale-darkBlue transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-2">
          <span className="text-xs text-gray-500 py-1">Popular:</span>
          {topCategories.slice(0, 4).map((category) => (
            <button
              key={category}
              onClick={() => navigate(`/explore/${category.toLowerCase().replace(/\s+/g, '-')}`)}
              className="px-3 py-1 text-xs bg-carbon-700 text-gray-300 rounded-full hover:bg-locale-blue hover:text-white transition-colors border border-transparent hover:border-locale-blue/50"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryHero;