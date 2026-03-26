# GolfGives — Golf Charity Subscription Platform
Live URL: https://golf-charity-platform-umber.vercel.app

## Test Credentials
User: test@example.com / test123456
Admin: admin@test.com / test123456

## Tech Stack
- Next.js 16 (JavaScript)
- Supabase (Auth + Database)
- Tailwind CSS
- Vercel (Deployment)

## Notes
- Stripe is not available in India without business registration. A mock payment system has been implemented that simulates
  the complete payment flow including plan selection, card entry, and subscription status updates.
- Razorpay requires KYC verification which was not possible for this assessment submission.

## Features Built
- Subscription engine (mock payment, monthly/yearly plans)
- Score management (rolling 5-score Stableford system)
- Monthly draw engine with simulation
- Charity system with Indian NGOs
- Winner verification system
- Full admin panel
- Mobile responsive design