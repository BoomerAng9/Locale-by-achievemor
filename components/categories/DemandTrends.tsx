import React from 'react';
import { Category } from '../../types';

interface DemandTrendsProps {
  categories: Category[];
}

export const DemandTrends: React.FC<DemandTrendsProps> = ({ categories }) => {
  // Sort by growth and take top 6
  const sortedTrends = [...categories]
    .sort((a, b) => b.demandGrowthPercent - a.demandGrowthPercent)
    .slice(0, 6);

  const demandColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    moderate: 'bg-blue-500',
    low: 'bg-gray-500',
  };

  return (
    <div className="bg-carbon-800 rounded-lg p-6 border border-carbon-700">
      <div className="space-y-4">
        {sortedTrends.map((trend) => (
          <div key={trend.id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-sm text-white font-medium truncate">
                  {trend.name}
                </h3>
              </div>
              <div className="w-full bg-carbon-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full ${demandColors[trend.demandLevel]}`}
                  style={{ width: `${Math.min(trend.demandGrowthPercent * 4, 100)}%` }}
                />
              </div>
            </div>
            <div className="text-right min-w-[3rem]">
              <span className="text-green-400 font-bold text-sm block">
                +{trend.demandGrowthPercent}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DemandTrends;