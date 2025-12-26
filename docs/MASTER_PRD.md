# PRODUCT REQUIREMENT DOCUMENT (PRD): LOCALE CONTEXTUAL ENGINE v2.0

## 1. CORE VISION
To shift Locale from a generic SaaS to a **"Hyper-Specific Industry Launchpad."** The platform "morphs" its entire UI, toolset, and AI persona to match the user's industry immediately upon onboarding.

## 2. THE "PRE-WIRED" EXPERIENCE (Target Industries)
The system will support 10 "Hard-Coded" templates + 1 "Generative" template:
1.  **Real Estate:** Flip Calc, Zoning Maps, "Robert K." Persona.
2.  **Legal/Pro Services:** Document OCR, Compliance Checker.
3.  **Construction:** Blueprint Reader, Permit Search.
4.  **Healthcare:** HIPAA Forms, Patient CRM.
5.  **Retail/E-com:** Inventory Tracker, Ad Copy Gen.
6.  **Logistics:** Route Optimizer, Fleet Manager.
7.  **Education:** Course Builder, Quiz Gen.
8.  **Media/Podcasting:** Transcriber, Show Notes.
9.  **Hospitality:** Venue Finder, Menu Planner.
10. **Tech/AI:** Code Sandbox, API Manager.
*   **"Other" (Generative):** AI researches the industry (e.g., "Lawn Care") and builds a custom dashboard on the fly.

## 3. THE "MORPHING" CONSULTATION UI
*   **Standard Mode:** Global Search (Perplexity-style). Agnostic.
*   **Consultation Mode:**
    *   **Trigger:** User clicks "Consult".
    *   **Visual Shift:** Theme changes (e.g., Real Estate = Map Background; Media = Waveform Background).
    *   **Tool Injection:** Input bar gains industry-specific "Quick Actions" (e.g., "Analyze Deal").
    *   **Persona:** AI adopts the specific "SME" voice (e.g., "Robert K.").

## 4. GEO-TARGETED AUTO-INVITE ENGINE
*   **Discovery:** Weekly Crawler (Puppeteer) scrapes Chambers of Commerce & Google Maps.
*   **Incentive:** "1 Month Free" + **Pre-Built Partner Page** (Draft Mode).
*   **Outreach:** Personalized email with a link to their *already created* profile.
*   **UI:** "Interactive World Map" (Jigsaw Puzzle) for users to select their locality.

## 5. TECHNICAL ARCHITECTURE
*   **Frontend:** React + Vite + Framer Motion (High-fidelity "Flash UI").
*   **Styling:** Tailwind CSS + Lucide React.
*   **State:** `ConsultationContext` (React Context) for theme/mode switching.
*   **Backend:** Firebase Firestore (User Data), Cloud Functions (Orchestration).
*   **Crawler:** Puppeteer on Google Cloud Run.
*   **AI:** Vertex AI (Function Gemma for routing, Gemini Pro for content).
