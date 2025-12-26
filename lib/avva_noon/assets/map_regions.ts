/**
 * AVVA NOON Spatial Assets
 * Jigsaw Map Definitions
 */

export type Region = {
  id: string;
  name: string;
  path: string; // SVG path data
  color: string;
  subRegions?: Region[];
};

export const WORLD_REGIONS: Region[] = [
  {
    id: 'na',
    name: 'North America',
    color: '#3B82F6', // locale-blue
    path: 'M 50 50 L 150 50 L 150 150 L 50 150 Z', // Placeholder square
    subRegions: [
      {
        id: 'usa',
        name: 'United States',
        color: '#60A5FA',
        path: 'M 60 60 L 140 60 L 140 140 L 60 140 Z',
        subRegions: [
          {
            id: 'fl',
            name: 'Florida',
            color: '#93C5FD',
            path: 'M 100 100 L 130 100 L 130 130 L 100 130 Z',
            subRegions: [
              {
                id: 'pb',
                name: 'Palm Beach',
                color: '#BFDBFE',
                path: 'M 110 110 L 120 110 L 120 120 L 110 120 Z'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'eu',
    name: 'Europe',
    color: '#10B981', // emerald
    path: 'M 160 50 L 260 50 L 260 150 L 160 150 Z',
  },
  {
    id: 'as',
    name: 'Asia',
    color: '#F59E0B', // amber
    path: 'M 270 50 L 370 50 L 370 150 L 270 150 Z',
  },
];
