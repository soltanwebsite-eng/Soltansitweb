# SULTAN Customer Website

Arabic RTL customer website for phone repair requests, repair-status tracking, and accessories ordering.

- Next.js 15 / React 19 / TypeScript
- Supabase project: `hpkaqrvyphljvyfkitwj`
- Public product catalogue and images
- Cart and cash-on-delivery orders through `place_store_order`
- Repair intake with optional private image upload
- Repair tracking through `track_repair(ticket, phone)`

## Setup
1. `npm install`
2. Copy `.env.example` to `.env.local` and set the Supabase URL and publishable key.
3. `npm run build` then `npm start`.

Only use the publishable key in the browser. Never expose a service-role key.

WhatsApp and email notifications are not configured yet; provider credentials and the shop email address are required before enabling outbound messages.

## Render
Build: `npm install && npm run build`
Start: `npm start`
Environment: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
