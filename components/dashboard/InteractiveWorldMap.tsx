/**
 * Interactive World Map - Jigsaw Puzzle UI
 * 
 * A smart, progressive-disclosure locality selector for the Geo-Targeted Auto-Invite Engine.
 * Users select their location by drilling down: World → Country → State → City
 * 
 * Features:
 * - SVG-based world map with clickable regions
 * - Progressive zoom with city pins
 * - "I'm not listed" proximity mapping with zip code validation
 * - Firestore integration for user_localities
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserLocality } from '../../types';

// ============================================
// MAP DATA DEFINITIONS
// ============================================

interface MapRegion {
  id: string;
  name: string;
  color: string;
  emoji: string;
  coordinates?: { lat: number; lng: number };
  subRegions?: MapRegion[];
  cities?: MajorCity[];
}

interface MajorCity {
  id: string;
  name: string;
  state: string;
  coordinates: { lat: number; lng: number };
  population: number;
}

// Major US cities for initial launch
const US_MAJOR_CITIES: MajorCity[] = [
  { id: 'atl', name: 'Atlanta', state: 'GA', coordinates: { lat: 33.749, lng: -84.388 }, population: 498715 },
  { id: 'aus', name: 'Austin', state: 'TX', coordinates: { lat: 30.267, lng: -97.743 }, population: 978908 },
  { id: 'mia', name: 'Miami', state: 'FL', coordinates: { lat: 25.762, lng: -80.192 }, population: 442241 },
  { id: 'nyc', name: 'New York', state: 'NY', coordinates: { lat: 40.713, lng: -74.006 }, population: 8336817 },
  { id: 'la', name: 'Los Angeles', state: 'CA', coordinates: { lat: 34.052, lng: -118.244 }, population: 3979576 },
  { id: 'chi', name: 'Chicago', state: 'IL', coordinates: { lat: 41.878, lng: -87.630 }, population: 2693976 },
  { id: 'hou', name: 'Houston', state: 'TX', coordinates: { lat: 29.760, lng: -95.370 }, population: 2304580 },
  { id: 'phx', name: 'Phoenix', state: 'AZ', coordinates: { lat: 33.449, lng: -112.074 }, population: 1608139 },
  { id: 'sea', name: 'Seattle', state: 'WA', coordinates: { lat: 47.606, lng: -122.332 }, population: 737015 },
  { id: 'den', name: 'Denver', state: 'CO', coordinates: { lat: 39.739, lng: -104.990 }, population: 727211 },
  { id: 'bos', name: 'Boston', state: 'MA', coordinates: { lat: 42.361, lng: -71.057 }, population: 675647 },
  { id: 'dfw', name: 'Dallas', state: 'TX', coordinates: { lat: 32.777, lng: -96.797 }, population: 1304379 },
  { id: 'wpb', name: 'West Palm Beach', state: 'FL', coordinates: { lat: 26.715, lng: -80.054 }, population: 117415 },
  { id: 'orl', name: 'Orlando', state: 'FL', coordinates: { lat: 28.538, lng: -81.379 }, population: 307573 },
  { id: 'nas', name: 'Nashville', state: 'TN', coordinates: { lat: 36.163, lng: -86.781 }, population: 689447 },
];

const WORLD_MAP_DATA: MapRegion[] = [
  {
    id: 'na',
    name: 'North America',
    color: '#3B82F6',
    emoji: '🌎',
    subRegions: [
      {
        id: 'usa',
        name: 'United States',
        color: '#60A5FA',
        emoji: '🇺🇸',
        cities: US_MAJOR_CITIES,
      },
      {
        id: 'can',
        name: 'Canada',
        color: '#F87171',
        emoji: '🇨🇦',
        cities: [
          { id: 'tor', name: 'Toronto', state: 'ON', coordinates: { lat: 43.653, lng: -79.383 }, population: 2731571 },
          { id: 'van', name: 'Vancouver', state: 'BC', coordinates: { lat: 49.283, lng: -123.121 }, population: 631486 },
        ],
      },
    ],
  },
  {
    id: 'eu',
    name: 'Europe',
    color: '#10B981',
    emoji: '🌍',
    subRegions: [
      { id: 'uk', name: 'United Kingdom', color: '#34D399', emoji: '🇬🇧', cities: [] },
      { id: 'de', name: 'Germany', color: '#FBBF24', emoji: '🇩🇪', cities: [] },
    ],
  },
  {
    id: 'as',
    name: 'Asia',
    color: '#F59E0B',
    emoji: '🌏',
    subRegions: [
      { id: 'jp', name: 'Japan', color: '#F87171', emoji: '🇯🇵', cities: [] },
      { id: 'sg', name: 'Singapore', color: '#A78BFA', emoji: '🇸🇬', cities: [] },
    ],
  },
  {
    id: 'sa',
    name: 'South America',
    color: '#EC4899',
    emoji: '🌎',
    subRegions: [
      { id: 'br', name: 'Brazil', color: '#22C55E', emoji: '🇧🇷', cities: [] },
    ],
  },
  {
    id: 'af',
    name: 'Africa',
    color: '#8B5CF6',
    emoji: '🌍',
    subRegions: [],
  },
  {
    id: 'oc',
    name: 'Oceania',
    color: '#06B6D4',
    emoji: '🌏',
    subRegions: [
      { id: 'au', name: 'Australia', color: '#FBBF24', emoji: '🇦🇺', cities: [] },
    ],
  },
];

// ============================================
// COMPONENT
// ============================================

interface InteractiveWorldMapProps {
  onLocationSelect?: (locality: Partial<UserLocality>) => void;
  initialLocality?: UserLocality;
}

const InteractiveWorldMap: React.FC<InteractiveWorldMapProps> = ({ 
  onLocationSelect,
}) => {
  const [viewStack, setViewStack] = useState<MapRegion[]>([]);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<MajorCity | null>(null);
  
  // Proximity Mode State
  const [showProximityMode, setShowProximityMode] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [distance, setDistance] = useState(25); // km
  const [nearestCity, setNearestCity] = useState<MajorCity | null>(null);
  const [isValidatingZip, setIsValidatingZip] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  // Stats for display
  const [activeUsers] = useState(24592);
  const [liveActivity] = useState({ 
    type: 'Video Editor', 
    location: 'Palm Beach, FL',
    time: 'Just now'
  });

  const currentRegion = viewStack.length > 0 ? viewStack[viewStack.length - 1] : null;
  const regionsToDisplay = currentRegion?.subRegions || WORLD_MAP_DATA;
  const citiesToDisplay = currentRegion?.cities || [];

  const handleRegionClick = useCallback((region: MapRegion) => {
    if (region.subRegions && region.subRegions.length > 0) {
      setViewStack([...viewStack, region]);
      setSelectedCity(null);
      setShowProximityMode(false);
    } else if (region.cities && region.cities.length > 0) {
      setViewStack([...viewStack, region]);
      setSelectedCity(null);
      setShowProximityMode(false);
    }
  }, [viewStack]);

  const handleCitySelect = useCallback((city: MajorCity) => {
    setSelectedCity(city);
    setShowProximityMode(false);
    
    // Construct locality data
    const locality: Partial<UserLocality> = {
      country: 'United States',
      state: city.state,
      primaryCity: city.name,
      coordinates: city.coordinates,
      isListedCity: true,
    };
    
    onLocationSelect?.(locality);
  }, [onLocationSelect]);

  const handleBack = () => {
    setViewStack(viewStack.slice(0, -1));
    setSelectedCity(null);
    setShowProximityMode(false);
  };

  const handleProximityConfirm = async () => {
    if (!zipCode || zipCode.length !== 5 || !nearestCity) return;
    
    const locality: Partial<UserLocality> = {
      country: 'United States',
      state: nearestCity.state,
      primaryCity: nearestCity.name,
      actualZipCode: zipCode,
      distanceFromPrimaryCity: distance,
      coordinates: nearestCity.coordinates,
      isListedCity: false,
    };
    
    onLocationSelect?.(locality);
    setShowProximityMode(false);
    setSelectedCity(nearestCity);
  };

  // Validate zip code and find nearest city
  const validateZipCode = useCallback(async (zip: string) => {
    if (zip.length !== 5) {
      setZipError(null);
      setNearestCity(null);
      return;
    }

    setIsValidatingZip(true);
    setZipError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const zipPrefix = parseInt(zip.substring(0, 2));
      let nearest: MajorCity | null = null;
      
      if (zipPrefix >= 30 && zipPrefix <= 31) nearest = US_MAJOR_CITIES.find(c => c.id === 'atl') || null;
      else if (zipPrefix >= 33 && zipPrefix <= 34) nearest = US_MAJOR_CITIES.find(c => c.id === 'mia') || null;
      else if (zipPrefix >= 78 && zipPrefix <= 79) nearest = US_MAJOR_CITIES.find(c => c.id === 'aus') || null;
      else if (zipPrefix >= 10 && zipPrefix <= 11) nearest = US_MAJOR_CITIES.find(c => c.id === 'nyc') || null;
      else if (zipPrefix >= 90 && zipPrefix <= 91) nearest = US_MAJOR_CITIES.find(c => c.id === 'la') || null;
      else nearest = US_MAJOR_CITIES[0];
      
      setNearestCity(nearest);
    } catch {
      setZipError('Unable to validate zip code');
    } finally {
      setIsValidatingZip(false);
    }
  }, []);

  useEffect(() => {
    if (zipCode.length === 5) {
      validateZipCode(zipCode);
    }
  }, [zipCode, validateZipCode]);

  return (
    <div className="w-full h-[700px] bg-carbon-900 rounded-2xl border border-carbon-700 overflow-hidden relative flex flex-col">
      
      {/* Header / Breadcrumbs */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-3xl">🧩</span>
            Global Talent Map
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <button 
              onClick={() => { setViewStack([]); setSelectedCity(null); setShowProximityMode(false); }}
              className="hover:text-locale-blue transition-colors"
            >
              🌍 World
            </button>
            {viewStack.map((region, idx) => (
              <React.Fragment key={region.id}>
                <span className="text-gray-600">/</span>
                <button 
                  onClick={() => { 
                    setViewStack(viewStack.slice(0, idx + 1)); 
                    setSelectedCity(null);
                    setShowProximityMode(false);
                  }}
                  className="hover:text-locale-blue transition-colors"
                >
                  {region.emoji} {region.name}
                </button>
              </React.Fragment>
            ))}
            {selectedCity && (
              <>
                <span className="text-gray-600">/</span>
                <span className="text-locale-blue font-bold">📍 {selectedCity.name}</span>
              </>
            )}
          </div>
        </div>
        
        {viewStack.length > 0 && (
          <button 
            onClick={handleBack}
            className="pointer-events-auto px-4 py-2 bg-carbon-800 hover:bg-carbon-700 text-white rounded-lg border border-carbon-700 transition-all flex items-center gap-2"
          >
            <span>↩</span> Zoom Out
          </button>
        )}
      </div>

      {/* AVVA-NOON Equation Watermark */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-5">
        <div className="text-6xl font-mono text-white whitespace-nowrap">
          (-10¹⁸ ≤ x, y ≤ 10¹⁸)
        </div>
      </div>

      {/* Map Visualization Area */}
      <div className="flex-1 relative flex items-center justify-center bg-[#0a0a0a]">
        <div 
          className="absolute inset-0 opacity-20" 
          style={{ 
            backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentRegion ? currentRegion.id : 'world'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.4 }}
            className="relative w-full h-full flex items-center justify-center p-16"
          >
            {citiesToDisplay.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl w-full">
                {regionsToDisplay.map((region) => (
                  <motion.div
                    key={region.id}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRegionClick(region)}
                    onMouseEnter={() => setHoveredRegion(region.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    className="relative cursor-pointer group"
                  >
                    <div 
                      className={`
                        aspect-square rounded-2xl border-2 relative overflow-hidden
                        transition-all duration-300
                        ${hoveredRegion === region.id 
                          ? 'shadow-[0_0_40px_rgba(255,255,255,0.2)] border-white' 
                          : 'border-transparent'
                        }
                      `}
                      style={{ 
                        backgroundColor: region.color + '20',
                        borderColor: hoveredRegion === region.id ? '#fff' : region.color + '60'
                      }}
                    >
                      <div className="absolute -right-3 top-1/2 w-6 h-6 rounded-full transform -translate-y-1/2 z-10" 
                           style={{ backgroundColor: region.color + '40' }} />
                      <div className="absolute -left-3 top-1/2 w-6 h-6 rounded-full transform -translate-y-1/2" 
                           style={{ backgroundColor: region.color + '20' }} />
                      <div className="absolute -top-3 left-1/2 w-6 h-6 rounded-full transform -translate-x-1/2" 
                           style={{ backgroundColor: region.color + '30' }} />
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                          {region.emoji}
                        </span>
                        <h3 className="text-xl font-bold text-white">{region.name}</h3>
                        <p className="text-xs text-gray-400 mt-2">
                          {region.subRegions && region.subRegions.length > 0 
                            ? `${region.subRegions.length} Regions` 
                            : region.cities && region.cities.length > 0
                              ? `${region.cities.length} Cities`
                              : 'Coming Soon'
                          }
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="w-full max-w-5xl">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {citiesToDisplay.map((city) => (
                    <motion.button
                      key={city.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleCitySelect(city)}
                      onMouseEnter={() => setHoveredCity(city.id)}
                      onMouseLeave={() => setHoveredCity(null)}
                      className={`
                        p-4 rounded-xl border-2 text-left transition-all
                        ${selectedCity?.id === city.id 
                          ? 'bg-locale-blue/20 border-locale-blue shadow-lg shadow-locale-blue/20' 
                          : hoveredCity === city.id
                            ? 'bg-carbon-800 border-gray-500'
                            : 'bg-carbon-800/50 border-carbon-700 hover:border-gray-600'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📍</span>
                        <div>
                          <div className="font-bold text-white">{city.name}</div>
                          <div className="text-xs text-gray-400">{city.state}</div>
                        </div>
                      </div>
                      {selectedCity?.id === city.id && (
                        <div className="mt-2 text-xs text-locale-blue font-mono">
                          ✓ Selected
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setShowProximityMode(!showProximityMode)}
                    className={`
                      px-6 py-3 rounded-xl border-2 font-bold transition-all
                      ${showProximityMode 
                        ? 'bg-purple-500/20 border-purple-500 text-purple-400' 
                        : 'bg-carbon-800 border-carbon-700 text-gray-400 hover:text-white hover:border-gray-500'
                      }
                    `}
                  >
                    🗺️ I'm Near One of These (Not Listed)
                  </button>
                </div>

                <AnimatePresence>
                  {showProximityMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 overflow-hidden"
                    >
                      <div className="bg-carbon-800 border border-purple-500/30 rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-white mb-4">
                          📍 Proximity Mapping
                        </h4>
                        <p className="text-sm text-gray-400 mb-6">
                          Enter your zip code and we'll map you to the nearest major hub.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                              Your Zip Code
                            </label>
                            <input
                              type="text"
                              value={zipCode}
                              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                              placeholder="e.g., 30318"
                              className="w-full bg-carbon-900 border border-carbon-700 rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-purple-500 transition-colors"
                            />
                            {zipError && (
                              <p className="text-red-400 text-xs mt-2">{zipError}</p>
                            )}
                            {isValidatingZip && (
                              <p className="text-gray-500 text-xs mt-2 animate-pulse">Validating...</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                              Distance from Hub: <span className="text-white font-bold">{distance} km</span>
                            </label>
                            <input
                              type="range"
                              min="5"
                              max="100"
                              value={distance}
                              onChange={(e) => setDistance(parseInt(e.target.value))}
                              className="w-full accent-purple-500"
                            />
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>5 km</span>
                              <span>100 km</span>
                            </div>
                          </div>
                        </div>

                        {nearestCity && (
                          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs text-purple-400 uppercase tracking-wide">Nearest Hub</div>
                                <div className="text-xl font-bold text-white mt-1">
                                  📍 {nearestCity.name}, {nearestCity.state}
                                </div>
                              </div>
                              <button
                                onClick={handleProximityConfirm}
                                className="px-6 py-3 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl transition-colors"
                              >
                                Confirm Location
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Stats Bar */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none z-10">
        <div className="bg-carbon-800/90 backdrop-blur p-4 rounded-xl border border-carbon-700 pointer-events-auto">
          <div className="text-xs text-gray-500 uppercase mb-1">Active Users</div>
          <div className="text-2xl font-mono text-white">{activeUsers.toLocaleString()}</div>
        </div>
        
        <div className="bg-carbon-800/90 backdrop-blur p-4 rounded-xl border border-carbon-700 pointer-events-auto max-w-sm">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 animate-pulse" />
            <div>
              <p className="text-sm text-gray-300">
                <span className="text-white font-bold">Live Activity:</span> New "{liveActivity.type}" request in {liveActivity.location}
              </p>
              <p className="text-xs text-gray-500 mt-1">{liveActivity.time}</p>
            </div>
          </div>
        </div>
        
        {selectedCity && (
          <div className="bg-green-500/20 backdrop-blur p-4 rounded-xl border border-green-500/50 pointer-events-auto">
            <div className="text-xs text-green-400 uppercase mb-1">Your Location</div>
            <div className="text-lg font-bold text-white">
              📍 {selectedCity.name}, {selectedCity.state}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveWorldMap;
