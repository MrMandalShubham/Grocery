# Business Model — Grocery Platform

## Overview
A B2B2C quick-commerce platform serving two primary segments from a decoupled backend inventory system.

## Customer Segments
1. **B2C (Retail):** End customers ordering groceries for home delivery. 
   - Value Proposition: Quick delivery, clear stock indicators, intuitive "Flipkart-style" UI.
   - Revenue: Retail margin on products, delivery fees (if applicable).
   - Payments: Razorpay (UPI, Card), COD.

2. **B2B (Wholesale Shops):** Small registered Kirana stores/shops purchasing stock.
   - Value Proposition: Wholesale pricing (Cost + 15%), easy bulk ordering, credit-based purchasing.
   - Payments: Deducted directly from pre-approved "Shop Credit" (managed by Admin).

## Architecture Context
This project focuses **exclusively** on the "Front Gate" — the customer-facing UI. The inventory management, logistics routing, and admin controls operate as a separate backend system that this frontend will connect to via open APIs.
