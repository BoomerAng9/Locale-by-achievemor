
import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types';

interface CategoryCardProps {
  category: Category;
}

const demandColors = {
  low: 'bg-gray-900 text-gray-400 border-gray-700',
  moderate: 'bg-blue-900/30 text-blue-400 border-blue-700/50',
  high: 'bg-orange-900/30 text-orange-400 border-orange-700/50',
  critical: 'bg-red-900/30 text-red-400 border-red-700/50',
};

const demandLabels = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  critical: '🔥 Critical',
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link to={`/explore/${category.slug}`} className="block h-full">
      <div className="p-5 h-44 rounded-md border border-carbon-600 hover:border-locale-blue/50 bg-carbon-800 hover:bg-carbon-700/50 flex flex-col justify-between cursor-pointer transition-all duration-200">
        
        {/* Top Section */}
        <div>
           {/* Icon */}
           <div className="text-3xl mb-2">{category.iconEmoji}</div>

           {/* Title */}
           <h3 className="text-base font-semibold text-white mb-1 line-clamp-1 leading-tight">
             {category.name}
           </h3>

           {/* Description */}
           <p className="text-xs text-gray-400 line-clamp-2">
             {category.description}
           </p>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between mt-auto gap-2">
          <div className="text-xs text-gray-500 font-mono">
            {category.activeProfessionals > 0 && (
              <span>{Math.floor(category.activeProfessionals / 100) * 100}+ Pros</span>
            )}
          </div>
          <div
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap border ${demandColors[category.demandLevel]}`}
          >
            {demandLabels[category.demandLevel]}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
