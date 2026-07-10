# SkillChain

**Transparent, milestone-based scholarship funding powered by Stellar & Soroban.**

SkillChain is a decentralized scholarship and education funding platform where donors sponsor students through milestone-based smart contracts instead of opaque crowdfunding flows. Funds remain locked inside Soroban escrow contracts and are released only when predefined academic milestones are completed and verified.

## Why SkillChain

Millions of students cannot afford higher education, while traditional scholarship platforms suffer from low transparency, manual verification, high cross-border fees, slow settlement, and weak visibility into fund usage. SkillChain puts scholarship management on-chain so donors can see how money moves and students receive support as verified academic progress is achieved.

## Core users

- Students
- Donors
- NGOs
- Universities
- CSR programs
- Scholarship foundations
- Educational institutions

## MVP feature set

- Freighter, xBull, and Albedo wallet authentication through a shared connector interface
- Student and donor dashboards with portfolio metrics, activity timelines, charts, and wallet status
- Scholarship exploration, detail pages, creation flow, document requirements, and milestone schedules
- Donation transaction preparation, wallet signing, Stellar Testnet submission, optimistic UI state, and donor history services
- Milestone verification workspace for universities, NGOs, mentors, and admins
- Firestore service layer for public metadata, scholarship CRUD, donations, milestone reviews, feedback, real-time listeners, and transactional funding progress updates
- Soroban contract workspace for ScholarshipFactory, ScholarshipEscrow, DonationManager, and MilestoneManager
- Responsive fintech UI with glassmorphism, loading states, error boundaries, reusable components, and analytics views
- Vercel Analytics, Speed Insights, GA4 integration, and Sentry monitoring instrumentation
- Documentation for architecture, environment variables, deployment, and production hardening

## Smart contract architecture

| Contract | Responsibility |
| --- | --- |
| `UserRegistry` | Stores student, donor, NGO, and university profiles with role metadata. |
| `ScholarshipFactory` | Creates scholarship contracts, stores metadata pointers, and tracks scholarship IDs. |
| `DonationManager` | Accepts donations, tracks donor history, stores events, and calculates funding progress. |
| `MilestoneManager` | Creates milestones, stores completion status, verifies proof, and triggers escrow releases. |
| `ScholarshipEscrow` | Receives donor funds, locks assets, tracks released funds, and releases milestone amounts only after approval. |

## Blockchain flow

1. Student or institution creates a scholarship campaign.
2. Scholarship metadata is registered through the factory.
3. Donors fund the campaign into escrow.
4. Student submits milestone proof.
5. University, NGO, mentor, or admin verifies the milestone.
6. Soroban validation releases the approved amount to the student wallet.
7. Events such as `ScholarshipCreated`, `DonationMade`, `MilestoneApproved`, `FundsReleased`, and `ScholarshipCompleted` update dashboards.

## Tech stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn-inspired reusable primitives
- Lucide Icons
- Framer Motion-ready component architecture
- Vercel Analytics and Speed Insights
- Stellar and Soroban architecture target
- Firebase Firestore and Firebase Storage/Cloudinary architecture target

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Quality checks

```bash
npm run typecheck
npm run build
```

## Application routes

- `/` — public fintech landing page
- `/dashboard/student` — student funding, milestone and release dashboard
- `/dashboard/donor` — donor impact portfolio
- `/scholarships` — browse and filter campaigns
- `/scholarships/create` — sign a ScholarshipFactory transaction and persist campaign metadata
- `/scholarships/[id]` — donation and milestone detail page
- `/milestones` — verifier review and release workspace
- `/wallet` — Freighter, xBull and Albedo wallet center
- `/analytics` — product analytics command center
- `/admin` — operational review panel

## Environment variables

Create `.env.local` for production integrations:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_SCHOLARSHIP_FACTORY_ID=
NEXT_PUBLIC_ESCROW_CONTRACT_ID=
NEXT_PUBLIC_DONATION_MANAGER_ID=
NEXT_PUBLIC_MILESTONE_MANAGER_ID=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
SENTRY_DSN=
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Environment](docs/ENVIRONMENT.md)

## Deployment

The app is Vercel-ready. Configure the environment variables above, connect the repository, and deploy. Future smart contract deployments should target Stellar Testnet first, with contract IDs documented in the deployment notes.

## Roadmap

### MVP

Wallet login, scholarships, donations, milestones, escrow, transaction history, analytics.

### Phase 2

University verification, NGO dashboard, admin dashboard, feedback system.

### Phase 3

Anchor integration, fiat on/off ramps, cross-border scholarships, stablecoin support, and tokenized scholarship NFTs.
