# Implementation Plan

## Proposed Stack
- **Hosting:** Vercel
- **Database & Auth:** Supabase (PostgreSQL + Auth)
- **Code Repository:** GitHub
- **Frontend Framework:** Next.js (React) + Tailwind CSS
- **Payments:** Razorpay

## Phases
1. **Phase 1: Foundation & UI/UX Skeleton**
   - Initialize Next.js & Tailwind. Set up Vercel & Supabase.
   - Port existing "Creamy Green" design system to Tailwind.
   - Build global components (Header, Footer, Cart).
2. **Phase 2: Catalog & Browsing**
   - Build B2C Home, B2B Wholesale views, and Product Details.
   - Implement mock API integration layer (`/services/inventory.js`).
3. **Phase 3: Cart & Checkout**
   - Persistent cart state.
   - Checkout flow with Razorpay (B2C) and Shop Credit (B2B).
4. **Phase 4: Order History & Profiles**
   - My Orders (mocked logistics pipeline) and Saved Addresses.
5. **Phase 5: Authentication**
   - Supabase OTP login.
   - Separate portals (`/login` for B2C, `/wholesale-login` for B2B).
