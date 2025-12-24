import React, { useState } from 'react';
import { MOCK_CATEGORIES } from '../../lib/constants';
import CategoryHero from '../categories/CategoryHero';
import CategoryGrid from '../categories/CategoryGrid';
import DemandTrends from '../categories/DemandTrends';

const CategoriesPage: React.FC = () => {
  const [categories] = useState(MOCK_CATEGORIES);
  
  const tier1Categories = categories.filter((cat) => cat.tier === 1);
  const tier2Categories = categories.filter((cat) => cat.tier === 2);
  const topPopularCategories = tier1Categories.slice(0, 4).map((cat) => cat.name);

  // Calculate stats
  const totalProfessionals = Math.floor(categories.reduce((sum, cat) => sum + cat.activeProfessionals, 0) / 1000);

  return (
    <main className="min-h-screen bg-carbon-900 pb-24">
      <CategoryHero
        totalCategories={categories.length}
        topCategories={topPopularCategories}
      />

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Featured Categories */}
        <section>
          <div className="flex items-center justify-between mb-5">
             <h2 className="text-xl font-bold text-white">Featured Categories</h2>
             <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Tier 1</span>
          </div>
          <CategoryGrid categories={tier1Categories} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Trends Section */}
           <div className="lg:col-span-1">
              <h2 className="text-xl font-bold text-white mb-5">Fastest Growing</h2>
              <DemandTrends categories={categories} />
           </div>

           {/* Stats Section */}
           <div className="lg:col-span-2 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-5">Network Stats</h2>
                <section className="grid grid-cols-3 gap-4">
                  <div className="bg-carbon-800 rounded-md p-6 border border-carbon-700 text-center flex flex-col justify-center h-32">
                    <div className="text-3xl font-bold text-locale-blue mb-1">
                      {categories.length}+
                    </div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Sectors</p>
                  </div>

                  <div className="bg-carbon-800 rounded-md p-6 border border-carbon-700 text-center flex flex-col justify-center h-32">
                    <div className="text-3xl font-bold text-green-400 mb-1">
                      {totalProfessionals}k+
                    </div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Professionals</p>
                  </div>

                  <div className="bg-carbon-800 rounded-md p-6 border border-carbon-700 text-center flex flex-col justify-center h-32">
                    <div className="text-3xl font-bold text-orange-400 mb-1">
                      100%
                    </div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Verified</p>
                  </div>
                </section>
              </div>

              {/* CTA */}
              <section className="bg-gradient-to-r from-carbon-800 to-carbon-800/50 rounded-md p-8 border border-locale-blue/30 text-center mt-6 flex-1 flex flex-col justify-center">
                <h2 className="text-xl font-bold text-white mb-2">Ready to Get Started?</h2>
                <p className="text-sm text-gray-400 mb-6">Browse experts or post a project to get matched.</p>
                <div className="flex gap-3 justify-center">
                  <a
                    href="#/explore"
                    className="px-6 py-2.5 text-sm bg-locale-blue text-white rounded-md font-bold hover:bg-locale-darkBlue transition-colors shadow-lg shadow-locale-blue/20"
                  >
                    Browse Experts
                  </a>
                  <a
                    href="#/dashboard"
                    className="px-6 py-2.5 text-sm bg-carbon-700 text-white rounded-md font-bold hover:bg-carbon-600 transition-colors border border-carbon-600"
                  >
                    Post a Job
                  </a>
                </div>
              </section>
           </div>
        </div>

        {/* Additional Categories */}
        <section>
          <div className="flex items-center justify-between mb-5">
             <h2 className="text-xl font-bold text-white">Emerging Skills</h2>
             <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Tier 2</span>
          </div>
          <CategoryGrid categories={tier2Categories} />
        </section>
      </div>
    </main>
  );
}

export default CategoriesPage;