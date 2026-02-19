<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1tDuJ97fSlHaewakY-5CJ8LoTdmJpWGc6

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy on Vercel

1. Push your latest code to GitHub.
2. In Vercel, create a new project and import this repo.
3. Set framework to `Vite` (Vercel usually auto-detects this).
4. Add environment variables in Vercel Project Settings:
   - `STRIPE_SECRET_KEY` = your Stripe secret key
   - `VITE_GEMINI_API_KEY` = your Gemini API key (if used in frontend)
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - `VITE_FORCE_STRIPE_FOR_FREE_GIGS` = `false` (or `true` for testing)
5. Deploy.

Notes:
- Stripe checkout API is deployed as a Vercel Function at `/api/create-checkout-session`.
- In production, frontend payment calls automatically use this endpoint.
- For local development, payment still uses `http://localhost:4242/create-checkout-session` unless you set `VITE_PAYMENT_API_URL`.
