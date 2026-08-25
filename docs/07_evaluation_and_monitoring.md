# Evaluation and Monitoring

## Success Criteria
1. **Phase 1-3 (UI/UX):**
   - Lighthouse score > 85 for Performance, Accessibility, and SEO.
   - Seamless mobile experience (no horizontal scrolling, reachable buttons).
2. **Phase 4 (Checkout):**
   - Razorpay test integration completes without console errors.
   - Cart accurately calculates totals, discounts, and B2B vs B2C pricing.
3. **Phase 5 (Auth):**
   - Supabase securely registers and verifies OTPs.
   - Unauthorized users cannot access `/checkout` or `/profile`.

## Post-Launch Monitoring (Future)
- Vercel Analytics for web vitals (LCP, FID, CLS).
- Sentry (optional) for catching frontend React errors.
