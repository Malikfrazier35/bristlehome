# Bristlehome

Professional home cleaning for Connecticut. Marketing site and booking experience.

**Private. Proprietary. All rights reserved.**

---

## Overview

This repository contains the production marketing site for **Bristlehome LLC**, a Connecticut-based residential cleaning service. The site is a static HTML/CSS/JS build designed for deployment on Vercel with Supabase backing the eventual booking + customer pipeline.

## Stack

- **Frontend:** Static HTML + CSS + vanilla JS (no framework)
- **Fonts:** Instrument Serif (display) · Geist (body/UI) · Geist Mono (metadata)
- **Backend:** Supabase (planned — for bookings, quote requests, service zones)
- **Hosting:** Vercel
- **Payments:** Square references in the existing booking JS — pending migration decision vs. Stripe for portfolio consistency (`acct_1SsLDtFV8yRihVmr`)
- **Domain:** *owner to add*

## Structure

```
.
├── index.html              # Main marketing site (~6,250 lines)
├── privacy-policy.html     # Privacy Policy (Connecticut CTDPA-compliant)
├── terms-of-service.html   # Terms of Service (16 sections)
├── README.md               # This file
└── vercel.json             # (optional) custom headers, redirects
```

## Local Development

No build step. Open `index.html` directly in a browser, or serve the folder:

```bash
# Python 3
python3 -m http.server 8000

# Node
npx serve .
```

Then visit `http://localhost:8000`.

## Deployment

Connect the repo to the Bristlehome Vercel project. Pushes to `main` auto-deploy.

```bash
# One-time manual deploy from CLI
vercel --prod
```

## Pre-Launch Checklist

Before pointing the production domain at this deployment, confirm:

- [ ] Replace placeholder phone `(860) 555-0110` with the real business line (appears in: `index.html`, `privacy-policy.html`, `terms-of-service.html`, utility bar on all three)
- [ ] Replace placeholder email `privacy@bristlehome.com` / `support@bristlehome.com` with real inboxes
- [ ] Swap `jane@email.com` in the testimonial with real client testimonial (if using real social proof) or remove
- [ ] Verify `Effective: April 18, 2026` dates on `privacy-policy.html` and `terms-of-service.html` — update if deploying later
- [ ] Confirm Connecticut Secretary of State LLC registration is active for "Bristlehome LLC" before the © footer claims it
- [ ] Wire the booking form to Supabase (currently the form simulates a confirmation)
- [ ] Stripe/Square decision + checkout integration
- [ ] Google Business Profile created + verified
- [ ] Google Analytics / Vercel Analytics enabled
- [ ] `robots.txt` + `sitemap.xml` added
- [ ] OG image + favicon added to `/public`

## Proprietary

© 2026 Bristlehome LLC. All rights reserved. Proprietary and confidential. Not for redistribution.
