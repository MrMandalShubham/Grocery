# Reasoning and Planning

## Technical Decisions
1. **Next.js over Vanilla JS:** 
   - **Reasoning:** Scalability, component reusability, and native Vercel optimization. A Vanilla JS SPA becomes difficult to maintain as the UI grows complex (like Flipkart). Next.js provides App Router, server-side rendering for SEO (important for B2C), and clean project structure.
2. **Decoupled Architecture (Frontend only):**
   - **Reasoning:** Allows the backend (Inventory/Logistics) to evolve into a multi-location hub-and-spoke model without breaking the customer UI. The frontend will rely on strict API contracts.
3. **Mocking APIs first (Phases 1-4):**
   - **Reasoning:** Unblocks UI development. By creating a Service layer (e.g., `getProducts()`), we can return hardcoded JSON now, and later swap it for `fetch('https://api.backend.com')` without touching the UI components.
4. **Retaining "Creamy Green":**
   - **Reasoning:** Maintains brand identity while upgrading the underlying tech.
