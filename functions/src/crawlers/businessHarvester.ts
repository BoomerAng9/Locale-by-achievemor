import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const db = admin.firestore();

interface BusinessLead {
  name: string;
  industry: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  city: string;
  state: string;
  source: string;
}

export async function harvestCityBusinesses(cityName: string, state: string): Promise<BusinessLead[]> {
  // Note: In a real Cloud Function environment, you might need to configure memory to 1GB+ 
  // and ensure chromium is available or use a service like Browserless.io
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // const page = await browser.newPage();
  const leads: BusinessLead[] = [];

  try {
    console.log(`Harvesting businesses in ${cityName}, ${state}...`);
    
    // Mocking the scraping logic for stability. 
    // Real implementation would visit specific URLs and use page.evaluate()
    leads.push({
      name: `${cityName} Premier Services`,
      industry: 'General Services',
      email: `info@${cityName.toLowerCase().replace(/\s/g, '')}premier.com`,
      phone: '555-0199',
      city: cityName,
      state: state,
      source: 'AutomatedDiscovery'
    });

  } catch (error) {
    console.error('Crawling failed:', error);
  } finally {
    await browser.close();
  }

  // Save to Firestore
  if (leads.length > 0) {
    const batch = db.batch();
    leads.forEach(lead => {
      const docRef = db.collection('business_leads').doc();
      batch.set(docRef, {
        ...lead,
        discoveredAt: admin.firestore.Timestamp.now(),
        inviteStatus: 'pending'
      });
    });
    await batch.commit();
  }

  return leads;
}

// Scheduled Function (Weekly)
export const scheduleBusinessHarvest = functions.runWith({
  timeoutSeconds: 300,
  memory: '1GB'
}).pubsub
  .schedule('every monday 02:00')
  .timeZone('UTC')
  .onRun(async (context) => {
    const cities = [{ name: 'Atlanta', state: 'GA' }, { name: 'Austin', state: 'TX' }];
    
    for (const city of cities) {
      await harvestCityBusinesses(city.name, city.state);
    }
    
    return null;
  });
