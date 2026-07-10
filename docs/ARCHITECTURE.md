# SkillChain Production MVP Architecture

## Runtime layers

- **Next.js App Router** renders the public landing page, app shell, dashboards, scholarship CRUD, wallet center, analytics, milestone verification, profile and admin routes.
- **Wallet layer** normalizes Freighter, xBull and Albedo into a single session and signing interface.
- **Firestore services** persist public metadata for users, scholarships, donations, milestone reviews, notifications and feedback. Money never touches Firestore.
- **Soroban layer** prepares donation and milestone-release transactions for wallet signing and submission to Stellar Testnet RPC.
- **Monitoring and analytics** include Vercel Analytics, Speed Insights, GA4 page/event tracking and Sentry client/server instrumentation.

## Data boundaries

Firestore stores profile and campaign metadata only. XLM, issued assets and release authorization are tracked by Soroban contracts. Documents can be stored in Firebase Storage or Cloudinary with immutable proof URIs referenced by milestone reviews.

## Contract responsibilities

1. `ScholarshipFactory` creates campaign records and emits `ScholarshipCreated`.
2. `ScholarshipEscrow` tracks funded and released balances and emits `FundsReleased`.
3. `DonationManager` tracks donor history and emits `DonationMade`.
4. `MilestoneManager` creates milestone schedules and emits `MilestoneApproved`.

## Production hardening checklist

- Configure Firebase security rules by role and verifier assignment.
- Deploy Soroban contracts to Stellar Testnet and set contract IDs in Vercel environment variables.
- Enable Sentry release tracking and source maps.
- Add rate limiting to mutation routes and Cloud Functions.
- Run a 10-user Stellar Testnet onboarding rehearsal covering wallet connection, campaign creation, donation, approval and release.
