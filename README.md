# ⚡ Sho8lana — شغلانة

**Egypt's simulation-based hiring platform.** Students compete through real business tasks and build verified KPI profiles. Companies discover and hire performance-ranked talent — not just CVs.

🌐 **Live:** [sho8lana.vercel.app](https://sho8lana.vercel.app)

---

## What is Sho8lana?

Sho8lana is a dual-sided HR technology platform built for the Egyptian job market:

- **Students** complete real business simulations, earn XP, climb a national leaderboard, and build a verified KPI profile that gets them discovered by top employers.
- **Companies** access a talent pool ranked by real performance data, manage their recruitment pipeline, and integrate their own simulations via API, webhook, iFrame, or SDK.

---

## Features

### For Students
- 🎯 Real business simulations (Marketing, Finance, Operations, Tech, HR)
- 🏆 National leaderboard with live rankings
- 📊 Verified KPI profile (Leadership, Analytical, Communication, Cognitive)
- 🤖 AI career coach (Arabic + English)
- 💼 1-tap job applications
- 🥇 XP system, badges, and tier progression (Bronze → Platinum)

### For Companies
- 🔍 Talent discovery — filter 50K+ students by KPI tier, track, university, GPA
- 📈 Candidate intelligence — full KPI breakdown + behavioral analysis
- 🗂️ Recruitment pipeline — sourcing → screening → interview → hired
- 🔗 Simulation integration — API, webhooks, iFrame embed, JS SDK
- 💳 Subscription plans — Starter (free), Pro, Enterprise

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TailwindCSS, Framer Motion |
| Backend | Next.js API Routes (server-side) |
| Auth | Supabase Auth — Google & GitHub OAuth + MFA (TOTP) |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Storage | Supabase Storage (CV, documents) |
| Payments | Stripe (subscription billing) |
| Email | Resend (transactional emails) |
| AI | Groq — Llama 3.3 70B |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- A Stripe account
- A Resend account
- A Groq API key

### Installation

```bash
git clone https://github.com/eslamy309-stack/Sho8lana.git
cd Sho8lana
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Groq AI
GROQ_KEY=your_groq_api_key

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENT_PRICE_ID=price_...

# Resend (email)
RESEND_API_KEY=re_...
```

### Database Setup

Run the schema in your Supabase SQL editor:

```bash
# File is at:
supabase/schema/main_schema.sql
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
sho8lana/
├── app/
│   ├── page.tsx                  # Landing page (dual-journey)
│   ├── auth/callback/            # OAuth callback handler
│   ├── privacy/                  # Privacy policy
│   ├── terms/                    # Terms of service
│   └── api/
│       ├── ai/                   # Groq AI proxy
│       ├── applications/         # Job applications
│       ├── email/                # Resend email
│       ├── stripe/               # Stripe checkout + webhooks
│       └── integrations/         # Simulation integration gateway
├── components/
│   └── app/
│       ├── Shell.tsx             # App shell + screen router
│       ├── BottomNav.tsx         # Bottom navigation
│       └── screens/              # All app screens
│           ├── HomeScreen.tsx
│           ├── HRDashboardScreen.tsx
│           ├── TalentMarketplaceScreen.tsx
│           ├── CandidateIntelligenceScreen.tsx
│           ├── RecruitmentPipelineScreen.tsx
│           ├── CompanyOnboardingScreen.tsx
│           ├── SimHubScreen.tsx
│           ├── LeaderboardScreen.tsx
│           ├── AIScreen.tsx
│           └── ...
├── lib/
│   ├── store.tsx                 # Global state (React context + useReducer)
│   ├── types.ts                  # TypeScript types
│   ├── supabase.ts               # Supabase client
│   ├── hr-data.ts                # HR mock data
│   └── hr-types.ts               # HR TypeScript types
└── supabase/
    └── schema/
        └── main_schema.sql       # Full database schema
```

---

## Branches

| Branch | Purpose |
|---|---|
| `main` | Production — auto-deploys to Vercel |
| `eslam's-branch` | Feature development |
| `yahia-branch` | Feature development |

---

## Simulation Integration

Companies can connect their existing simulation tools in 4 ways:

```typescript
// REST API
POST /api/integrations/{companyId}/simulations

// Webhook (real-time events)
POST your-endpoint <- Sho8lana sends results

// iFrame embed
<iframe src="https://sho8lana.vercel.app/sim/embed/{id}" />

// JavaScript SDK
import { Sho8lana } from '@sho8lana/sdk'
const client = new Sho8lana({ apiKey: 'your_key' })
await client.simulations.submit({ candidateId, score })
```

---

## Pricing

| Plan | Price | Candidates |
|---|---|---|
| Student | Free | — |
| Starter | Free | 25/month |
| Pro | EGP 300/month | Unlimited |
| Enterprise | EGP 1,000/month | Unlimited + SLA |

---

## License

MIT © 2026 Sho8lana. Built in Egypt 🇪🇬
