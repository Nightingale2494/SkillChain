# 10 User Stellar Testnet Onboarding Runbook

1. Create a Firebase project and configure Firestore security rules for `student`, `donor`, `verifier`, and `admin` roles.
2. Deploy all Soroban contracts and set the contract IDs in Vercel environment variables.
3. Ask 10 users to install Freighter, xBull, or Albedo and fund wallets through the Stellar Testnet friendbot.
4. Have two institutions create scholarships through `/scholarships/create`.
5. Have at least five donors donate through `/scholarships/[id]`.
6. Have verifiers approve pending milestones through `/milestones`.
7. Confirm Firestore `donations` and `milestoneReviews` collections update in real time.
8. Confirm Sentry has zero unhandled errors and Vercel Analytics records wallet, campaign, donation, and milestone routes.
