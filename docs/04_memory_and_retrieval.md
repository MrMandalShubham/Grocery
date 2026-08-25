# Memory and Retrieval

## Purpose
This document outlines how state and data are managed within the frontend application.

## State Management
1. **Local State (React `useState`):** UI toggles, modal visibility, form inputs.
2. **Global State (React Context / Zustand):** 
   - **Shopping Cart:** Must persist across page loads (can use `localStorage` integration).
   - **User Session:** Managed by Supabase Auth session listener.
3. **Data Fetching:** 
   - Use Next.js Server Components where SEO is needed (e.g., product pages).
   - Use Client Components (with `SWR` or `React Query`) for dynamic data (e.g., live stock alerts, user profile).

## Mock Data Structures
During development, the `/services` folder will act as our "memory":
- `catalog.json`: Mock list of products with SKUs, costs, and retail prices.
- `orders.json`: Mock order history to simulate the logistics pipeline.
