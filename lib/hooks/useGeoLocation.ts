import { useState, useEffect } from 'react';

export interface LocationState {
  coords: { lat: number; lng: number } | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  error: string | null;
  loading: boolean;
}

export const useGeoLocation = () => {
  const [location, setLocation] = useState<LocationState>({
    coords: null,
    city: 'Global', // Default
    state: null,
    zip: null,
    error: null,
    loading: false,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, error: 'Geolocation not supported' }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // In a real app, we would call a Reverse Geocoding API here (Google/Mapbox)
        // For this demo, we simulate the lookup based on coords to prove architecture
        
        // Mock Response Delay
        await new Promise(r => setTimeout(r, 800));

        setLocation({
          coords: { lat: latitude, lng: longitude },
          city: 'Austin', // Mocked Result
          state: 'TX',    // Mocked Result
          zip: '78701',   // Mocked Result
          error: null,
          loading: false,
        });
      },
      (error) => {
        setLocation(prev => ({ ...prev, error: error.message, loading: false }));
      }
    );
  };

  const manualSetLocation = (zip: string) => {
    // Simulate lookup from Zip
    setLocation({
      coords: { lat: 0, lng: 0 },
      city: 'Detected City',
      state: 'ST',
      zip: zip,
      error: null,
      loading: false,
    });
  };

  return { location, requestLocation, manualSetLocation };
};