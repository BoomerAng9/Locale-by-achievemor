/**
 * Business Harvester - Autonomous Lead Generation System
 * 
 * Weekly crawler that discovers businesses in tracked cities and stores them for auto-invite.
 * Targets: Chamber of Commerce, Google Places, BBB, Yelp, State LLC Registries
 * 
 * GCP Infrastructure:
 * - Cloud Functions (this file)
 * - Firestore (business_leads collection)
 * - Cloud Scheduler (weekly Monday 2AM UTC trigger)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize if not already
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// ============================================
// TYPES
// ============================================

interface BusinessLead {
  name: string;
  industry: string;
  naicsCode?: string;
  email?: string;
  phone?: string;
  address?: string;
  city: string;
  state: string;
  website?: string;
  employeeCount?: number;
  foundedYear?: number;
  description?: string;
  source: 'chamber' | 'llc_registry' | 'google_places' | 'bbb' | 'yelp' | 'linkedin' | 'manual';
  discoveredAt: admin.firestore.Timestamp;
  inviteStatus: 'pending' | 'invited' | 'joined' | 'declined' | 'bounced';
  lastContactedAt?: admin.firestore.Timestamp;
  retryCount: number;
}

interface TrackedCity {
  name: string;
  state: string;
  country: string;
  coordinates: { lat: number; lng: number };
  activeUsers: number;
  lastCrawledAt?: admin.firestore.Timestamp;
  businessLeadsCount: number;
  isActive: boolean;
}

interface GooglePlacesResult {
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  types: string[];
  business_status: string;
}

// ============================================
// CONFIGURATION
// ============================================

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || functions.config().google?.places_key || '';

// Industry categories we target
const TARGET_INDUSTRIES = [
  'real_estate_agency',
  'lawyer',
  'accountant',
  'insurance_agency',
  'contractor',
  'electrician',
  'plumber',
  'restaurant',
  'gym',
  'beauty_salon',
  'car_repair',
  'veterinary_care',
  'dentist',
  'doctor',
  'pharmacy',
  'bank',
  'travel_agency',
  'moving_company',
  'storage',
  'photographer',
];

// Default tracked cities (initial launch)
const DEFAULT_TRACKED_CITIES: TrackedCity[] = [
  { name: 'Atlanta', state: 'GA', country: 'US', coordinates: { lat: 33.749, lng: -84.388 }, activeUsers: 0, businessLeadsCount: 0, isActive: true },
  { name: 'Austin', state: 'TX', country: 'US', coordinates: { lat: 30.267, lng: -97.743 }, activeUsers: 0, businessLeadsCount: 0, isActive: true },
  { name: 'Miami', state: 'FL', country: 'US', coordinates: { lat: 25.762, lng: -80.192 }, activeUsers: 0, businessLeadsCount: 0, isActive: true },
  { name: 'West Palm Beach', state: 'FL', country: 'US', coordinates: { lat: 26.715, lng: -80.054 }, activeUsers: 0, businessLeadsCount: 0, isActive: true },
  { name: 'Dallas', state: 'TX', country: 'US', coordinates: { lat: 32.777, lng: -96.797 }, activeUsers: 0, businessLeadsCount: 0, isActive: true },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Query Google Places API for businesses in a location
 */
async function queryGooglePlaces(
  city: string, 
  state: string, 
  industry: string,
  coordinates: { lat: number; lng: number }
): Promise<BusinessLead[]> {
  const leads: BusinessLead[] = [];

  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('Google Places API key not configured, using mock data');
    return [{
      name: `${city} ${industry.replace(/_/g, ' ')} Services`,
      industry: industry,
      email: `contact@${city.toLowerCase()}${industry.replace(/_/g, '')}.com`,
      phone: '555-0100',
      city,
      state,
      source: 'google_places',
      discoveredAt: admin.firestore.Timestamp.now(),
      inviteStatus: 'pending',
      retryCount: 0,
    }];
  }

  try {
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${coordinates.lat},${coordinates.lng}` +
      `&radius=25000` +
      `&type=${industry}` +
      `&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.results) {
      for (const place of data.results.slice(0, 20)) {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?` +
          `place_id=${place.place_id}` +
          `&fields=name,formatted_address,formatted_phone_number,website,types,business_status` +
          `&key=${GOOGLE_PLACES_API_KEY}`;

        const detailsResponse = await fetch(detailsUrl);
        const details: { result: GooglePlacesResult } = await detailsResponse.json();

        if (details.result && details.result.business_status === 'OPERATIONAL') {
          leads.push({
            name: details.result.name,
            industry: mapGoogleTypeToIndustry(details.result.types),
            phone: details.result.formatted_phone_number,
            address: details.result.formatted_address,
            website: details.result.website,
            city,
            state,
            source: 'google_places',
            discoveredAt: admin.firestore.Timestamp.now(),
            inviteStatus: 'pending',
            retryCount: 0,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Google Places API error for ${city}, ${state}:`, error);
  }

  return leads;
}

/**
 * Scrape Chamber of Commerce directory (mock implementation)
 */
async function scrapeChamberOfCommerce(city: string, state: string): Promise<BusinessLead[]> {
  console.log(`[Chamber] Scraping ${city}, ${state}...`);
  
  const mockLeads: BusinessLead[] = [
    {
      name: `${city} Chamber Business 1`,
      industry: 'Business Services',
      email: `member1@${city.toLowerCase()}chamber.org`,
      phone: '555-0101',
      city,
      state,
      source: 'chamber',
      discoveredAt: admin.firestore.Timestamp.now(),
      inviteStatus: 'pending',
      retryCount: 0,
    },
  ];

  return mockLeads;
}

/**
 * Scrape state LLC registry (mock implementation)
 */
async function scrapeLlcRegistry(state: string, city: string): Promise<BusinessLead[]> {
  console.log(`[LLC Registry] Scraping ${state} for ${city} businesses...`);
  return [];
}

/**
 * Scrape BBB directory (mock implementation)
 */
async function scrapeBBB(city: string, state: string): Promise<BusinessLead[]> {
  console.log(`[BBB] Scraping ${city}, ${state}...`);
  return [];
}

/**
 * Map Google Places types to our industry categories
 */
function mapGoogleTypeToIndustry(types: string[]): string {
  const typeMap: Record<string, string> = {
    'real_estate_agency': 'Real Estate',
    'lawyer': 'Legal Services',
    'accountant': 'Accounting',
    'insurance_agency': 'Insurance',
    'general_contractor': 'Construction',
    'electrician': 'Electrical Services',
    'plumber': 'Plumbing',
    'restaurant': 'Food & Beverage',
    'gym': 'Fitness',
    'beauty_salon': 'Beauty & Wellness',
    'car_repair': 'Automotive',
    'veterinary_care': 'Veterinary',
    'dentist': 'Dental',
    'doctor': 'Healthcare',
    'pharmacy': 'Pharmacy',
    'travel_agency': 'Travel',
    'moving_company': 'Moving Services',
    'photographer': 'Photography',
  };

  for (const type of types) {
    if (typeMap[type]) {
      return typeMap[type];
    }
  }
  return 'General Services';
}

/**
 * De-duplicate leads by email or phone
 */
function deduplicateLeads(leads: BusinessLead[]): BusinessLead[] {
  const seen = new Map<string, BusinessLead>();
  
  for (const lead of leads) {
    const key = lead.email || lead.phone || lead.name.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, lead);
    }
  }
  
  return Array.from(seen.values());
}

/**
 * Check if lead already exists in Firestore
 */
async function filterExistingLeads(leads: BusinessLead[]): Promise<BusinessLead[]> {
  const newLeads: BusinessLead[] = [];
  
  for (const lead of leads) {
    let exists = false;
    
    if (lead.email) {
      const emailQuery = await db.collection('business_leads')
        .where('email', '==', lead.email)
        .limit(1)
        .get();
      exists = !emailQuery.empty;
    }
    
    if (!exists && lead.phone) {
      const phoneQuery = await db.collection('business_leads')
        .where('phone', '==', lead.phone)
        .where('city', '==', lead.city)
        .limit(1)
        .get();
      exists = !phoneQuery.empty;
    }
    
    if (!exists) {
      const nameQuery = await db.collection('business_leads')
        .where('name', '==', lead.name)
        .where('city', '==', lead.city)
        .limit(1)
        .get();
      exists = !nameQuery.empty;
    }
    
    if (!exists) {
      newLeads.push(lead);
    }
  }
  
  return newLeads;
}

// ============================================
// MAIN HARVESTING FUNCTION
// ============================================

export async function harvestCityBusinesses(
  cityName: string, 
  state: string,
  coordinates: { lat: number; lng: number }
): Promise<number> {
  console.log(`\n===== Harvesting ${cityName}, ${state} =====`);
  
  const allLeads: BusinessLead[] = [];

  for (const industry of TARGET_INDUSTRIES.slice(0, 5)) {
    const placesLeads = await queryGooglePlaces(cityName, state, industry, coordinates);
    allLeads.push(...placesLeads);
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  const chamberLeads = await scrapeChamberOfCommerce(cityName, state);
  allLeads.push(...chamberLeads);

  const llcLeads = await scrapeLlcRegistry(state, cityName);
  allLeads.push(...llcLeads);

  const bbbLeads = await scrapeBBB(cityName, state);
  allLeads.push(...bbbLeads);

  console.log(`[${cityName}] Raw leads collected: ${allLeads.length}`);

  const dedupedLeads = deduplicateLeads(allLeads);
  console.log(`[${cityName}] After deduplication: ${dedupedLeads.length}`);

  const newLeads = await filterExistingLeads(dedupedLeads);
  console.log(`[${cityName}] New leads to save: ${newLeads.length}`);

  if (newLeads.length > 0) {
    const batchSize = 500;
    for (let i = 0; i < newLeads.length; i += batchSize) {
      const batch = db.batch();
      const chunk = newLeads.slice(i, i + batchSize);
      
      chunk.forEach(lead => {
        const docRef = db.collection('business_leads').doc();
        batch.set(docRef, {
          ...lead,
          city: cityName,
          state,
        });
      });
      
      await batch.commit();
      console.log(`[${cityName}] Saved batch ${i / batchSize + 1}`);
    }

    await db.collection('tracked_cities').doc(`${cityName.toLowerCase()}_${state.toLowerCase()}`).set({
      name: cityName,
      state,
      lastCrawledAt: admin.firestore.Timestamp.now(),
      businessLeadsCount: admin.firestore.FieldValue.increment(newLeads.length),
    }, { merge: true });
  }

  return newLeads.length;
}

async function getTrackedCities(): Promise<TrackedCity[]> {
  const citiesSnapshot = await db.collection('tracked_cities')
    .where('isActive', '==', true)
    .get();

  if (citiesSnapshot.empty) {
    const batch = db.batch();
    for (const city of DEFAULT_TRACKED_CITIES) {
      const docRef = db.collection('tracked_cities').doc(`${city.name.toLowerCase()}_${city.state.toLowerCase()}`);
      batch.set(docRef, city);
    }
    await batch.commit();
    return DEFAULT_TRACKED_CITIES;
  }

  return citiesSnapshot.docs.map(doc => doc.data() as TrackedCity);
}

// ============================================
// CLOUD FUNCTION EXPORTS
// ============================================

export const scheduleBusinessHarvest = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .pubsub
  .schedule('every monday 02:00')
  .timeZone('UTC')
  .onRun(async () => {
    console.log('🚀 Starting weekly business harvest...');
    
    const cities = await getTrackedCities();
    let totalLeads = 0;

    for (const city of cities) {
      try {
        const count = await harvestCityBusinesses(city.name, city.state, city.coordinates);
        totalLeads += count;
        console.log(`✅ ${city.name}, ${city.state}: ${count} new leads`);
      } catch (error) {
        console.error(`❌ Error harvesting ${city.name}, ${city.state}:`, error);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n📊 Harvest complete. Total new leads: ${totalLeads}`);
    
    await db.collection('system_logs').add({
      type: 'business_harvest',
      message: `Weekly harvest completed: ${totalLeads} new leads across ${cities.length} cities`,
      timestamp: admin.firestore.Timestamp.now(),
      data: { totalLeads, citiesProcessed: cities.length },
    });

    return null;
  });

export const manualHarvest = functions
  .runWith({ timeoutSeconds: 300, memory: '1GB' })
  .https
  .onCall(async (data, context) => {
    if (!context.auth?.token?.admin) {
      throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }

    const { city, state, lat, lng } = data;
    
    if (!city || !state) {
      throw new functions.https.HttpsError('invalid-argument', 'City and state are required');
    }

    const coordinates = { lat: lat || 0, lng: lng || 0 };
    const count = await harvestCityBusinesses(city, state, coordinates);

    return { success: true, newLeads: count };
  });

export const getHarvestStats = functions.https.onCall(async (_, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const [leadsSnapshot, citiesSnapshot] = await Promise.all([
    db.collection('business_leads').count().get(),
    db.collection('tracked_cities').get(),
  ]);

  const pendingLeads = await db.collection('business_leads')
    .where('inviteStatus', '==', 'pending')
    .count()
    .get();

  return {
    totalLeads: leadsSnapshot.data().count,
    pendingInvites: pendingLeads.data().count,
    trackedCities: citiesSnapshot.size,
    cities: citiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })),
  };
});
