# Governance and Safety

## Security Protocols
1. **Environment Variables:**
   - **NEVER** hardcode API keys (Supabase Anon Key, Razorpay Key) in the codebase.
   - Use `.env.local` for local development.
   - Configure Environment Variables directly in the Vercel dashboard.
2. **Supabase Row Level Security (RLS):**
   - Ensure the database is locked down.
   - Users can only read/write their own `orders` and `addresses`.
   - B2B users cannot access B2C pricing models and vice versa.
3. **API Contracts:**
   - The frontend will gracefully handle backend API failures (e.g., if Inventory system is down, show "Unable to fetch stock" rather than crashing the page).
4. **Data Privacy:**
   - Only collect necessary information (Phone for OTP, Address for delivery).
