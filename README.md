# SULTAN Customer Website

Arabic RTL customer website for phone repair requests, repair-status tracking, and accessories ordering.

- Next.js 15 / React 19 / TypeScript
- Supabase project: `hpkaqrvyphljvyfkitwj`
- Public active-product catalogue with photos, prices, and available stock
- Cart and cash-on-delivery checkout through `place_store_order`
- Repair intake with optional private photo upload
- Repair tracking via `track_repair(ticket, phone)`; both values are required
- Private `/admin` area for owner/staff: repair diagnosis and status, product creation and visibility
- Facebook page link

## Setup
1. `npm install`
2. Copy `.env.example` to `.env.local` and set the Supabase URL and publishable key.
3. `npm run build` then `npm start`.

Only use the publishable key in the browser. Never expose a service-role key.

## Admin access
The `/admin` screen accepts Supabase Auth accounts whose `app_metadata.role` is `owner` or `staff`. No Auth users existed when the first deployment was checked, so create the owner account securely in Supabase Auth and assign the role through trusted project administration before using this screen. Do not allow public users to self-assign roles.

WhatsApp and email outbound notifications are not configured yet; provider credentials and the shop email/WhatsApp details are required before enabling messages. The selected contact preference is saved with the repair request.

## Render
Build: `npm install && npm run build`
Start: `npm start`
Environment: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
