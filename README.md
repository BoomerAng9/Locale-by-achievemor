# Locale by: ACHIEVEMOR

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Firebase](https://img.shields.io/badge/Deployed-Firebase-orange.svg)

> **Think It. Prompt It. Let Us Manage It.**

A next-generation workforce networking platform connecting service providers (Partners) with customers (Clients) for both local in-person tasks and remote work. Powered by AI, secured by verification, and built on trust.

🌐 **Live Demo**: [https://locale-by-achievemor.web.app](https://locale-by-achievemor.web.app)

---

## 🚀 Features

### For Partners (Service Providers)
- **Garage to Global Journey** — Progress from Garage → Community → Enterprise → Global
- **Localator Calculator** — Calculate your true net earnings after fees and taxes
- **AI-Powered Assistance** — ACHEEVY helps you manage clients and optimize rates
- **Verification System** — Build trust with verified credentials and reviews
- **Voice Customization** — Choose how ACHEEVY speaks to you

### For Clients (Customers)
- **Find Local Talent** — Verified professionals for in-person tasks
- **Remote Services** — Access skilled workers worldwide
- **Secure Payments** — Stripe-powered escrow and transactions
- **AI Matching** — Intelligent talent recommendations

### Platform Capabilities
- 🤖 **ACHEEVY AI Assistant** — Powered by Vertex AI (Gemini 1.5)
- 🎙️ **Human-like Voices** — ElevenLabs TTS integration
- 🔒 **Verification Flow** — Background checks and skill validation
- 📊 **Token-Based Pricing** — Pay for what you use
- 🎨 **White-Label Ready** — Customizable branding via Admin Panel

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | TailwindCSS + Custom Carbon Theme |
| **AI/LLM** | Vertex AI (Gemini 1.5 Flash) |
| **Voice** | ElevenLabs TTS + Web Speech API |
| **Auth** | Firebase Authentication |
| **Database** | Firestore |
| **Payments** | Stripe |
| **Hosting** | Firebase Hosting |
| **Video** | Kie AI (coming soon) |

---

## 📁 Project Structure

```
locale-by-achievemor/
├── components/
│   ├── admin/           # Admin Control Panel, Circuit Box
│   ├── common/          # ConciergeBot, shared components
│   ├── pages/           # All page components
│   ├── profile/         # Profile Card, customization
│   ├── verification/    # Verification flow
│   └── voice/           # Voice selector, onboarding
├── lib/
│   ├── ai/              # Gemini integration
│   ├── agents/          # AI agent system (Thesys, Finder)
│   ├── estimator/       # Token estimation logic
│   ├── firestore/       # Database schemas, queries
│   ├── llm/             # LLM integrations (Vertex AI, GLM)
│   ├── stripe/          # Payment routing
│   ├── video/           # Kie AI video generation
│   └── voice/           # Voice library, TTS
├── public/              # Static assets
├── App.tsx              # Main app with routing
├── index.css            # Global styles + Carbon theme
└── firebase.json        # Firebase hosting config
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# AI / LLM
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_OPENROUTER_API_KEY=your_openrouter_key

# Voice
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key

# Payments
VITE_STRIPE_SECRET_KEY=your_stripe_secret
VITE_STRIPE_PRICE_ID=your_price_id

# Video (Optional)
VITE_KIE_AI_API_KEY=your_kie_ai_key

# Other Integrations
VITE_MANUS_API_KEY=your_manus_key
VITE_TELEGRAM_BOT_TOKEN=your_telegram_token
```

---

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

```bash
# Clone the repository
git clone https://github.com/BoomerAng9/Locale-by-achievemor.git
cd Locale-by-achievemor

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build & Deploy

```bash
# Build for production
npm run build

# Deploy to Firebase
firebase login
firebase deploy --only hosting
```

---

## 📱 Key Pages

| Route | Description |
|-------|-------------|
| `/` | Home / Landing Page |
| `/about` | About Us |
| `/explore` | Find Talent |
| `/explore/garage-to-global` | G2G Philosophy |
| `/playground` | AI Chat Interface |
| `/localator` | Earnings Calculator |
| `/estimator` | Token Cost Estimator |
| `/pricing` | Pro Access Plans |
| `/partners` | Partner Program |
| `/admin` | Admin Control Panel |
| `/verification` | Verification Flow |

---

## 🎨 Design System

### Color Palette
- **Primary (Locale Blue)**: `#3B82F6`
- **Carbon Black**: `#0a0a0a`
- **Carbon Gray**: `#121212` - `#2a2a2a`
- **Accent Purple**: `#8B5CF6`
- **Success Green**: `#22C55E`

### Typography
- **Headings**: System UI / Inter
- **Body**: System fonts with optimized readability

---

## 🔊 Voice Features

ACHEEVY uses human-sounding voices powered by ElevenLabs:

| Voice | Style |
|-------|-------|
| **Drew** (Default) | Confident & Clear |
| Rachel | Warm & Professional |
| Bella | Soft & Expressive |
| Josh | Deep & Young |
| + 8 more... | Various styles |

Users can:
- Select their preferred voice
- Preview voices before selecting
- Use voice input for queries
- Clone their own voice (coming soon)

---

## 🏗️ Admin Panel

Access at `/admin` for:
- **API Key Management** — Configure all service keys
- **Theme & Colors** — Customize branding
- **Integrations** — View connected services
- **White-Label** — Custom domain & logo
- **User Settings** — Manage feature permissions

---

## 📊 Pricing Model

| Tier | Tokens | Price |
|------|--------|-------|
| Free | 50K | $0 |
| Starter | 250K | $10 |
| Medium | 750K | $25 |
| Pro | 2M | $50 |
| Enterprise | 10M | $200 |

- **Analysis & Planning**: Free (uses free-tier models)
- **Builds & Execution**: Deducted from token balance

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Vertex AI / Gemini** — AI backbone
- **ElevenLabs** — Voice synthesis
- **Firebase** — Hosting & database
- **Stripe** — Payment processing
- **Ballerine** — Identity verification

---

## 📞 Contact

- **Website**: [locale-by-achievemor.web.app](https://locale-by-achievemor.web.app)
- **Organization**: saeducationally.org
- **Twitter/X**: [@achievemor](https://x.com/achievemor)

---

**Made in PLR** • **Garage to Global** • © 2025 ACHIEVEMOR
