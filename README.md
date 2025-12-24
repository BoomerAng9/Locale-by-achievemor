
# Locale by: ACHIEVEMOR

The professional freelance marketplace connecting local and remote talent.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS
- **Cloud Platform**: Google Cloud Platform (GCP)
  - **Auth**: Firebase Authentication (Google Identity)
  - **Database**: Cloud Firestore
  - **Logs**: Cloud Logging
- **AI**: GLM-4.7 (via API)
- **Verification**: Ballerine SDK
- **Payments**: Stripe

## GCP Configuration
**Project ID**: `localebyachievemor`
**Project Number**: `790279690860`

## Setup

1. **Environment Variables**:
   Create a `.env.local` file:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_web_api_key
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   STRIPE_SECRET_KEY=your_stripe_key
   GLM4_API_KEY=your_glm_key
   ```

2. **Dependencies**:
   ```bash
   npm install firebase stripe @ballerine/web-ui-sdk
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
