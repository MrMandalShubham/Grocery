# Database Schema (Supabase)

This document outlines the schema for the Customer Frontend Portal database. As per the Microservices architecture, Product Inventory and Live Logistics Tracking are stored in external systems and accessed via API. This database focuses strictly on the Customer Journey, Authentication, and Sales processing.

## 1. `profiles`
Extends the default Supabase `auth.users` table to store our custom B2B and B2C user data.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, references `auth.users.id` |
| `role` | `text` | 'B2C' or 'B2B' |
| `full_name` | `text` | Customer's full name |
| `phone` | `text` | Mobile number |
| `b2b_shop_name` | `text` | (Nullable) Name of the retail shop |
| `b2b_gstin` | `text` | (Nullable) Business GSTIN / License number |
| `created_at` | `timestamp` | Registration date |

## 2. `addresses`
Allows users (both B2C and B2B) to save multiple delivery addresses.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `user_id` | `uuid` | Foreign Key to `profiles.id` |
| `label` | `text` | 'Home', 'Work', 'Shop' |
| `address_line1` | `text` | House/Flat No., Building |
| `address_line2` | `text` | Street, Area, Landmark |
| `city` | `text` | City |
| `state` | `text` | State |
| `pincode` | `text` | Postal Code |
| `is_default` | `boolean` | True if this is the default address |

## 3. `orders`
Stores the top-level details of a transaction and holds the external tracking ID for the upcoming Logistics API.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key (Order ID) |
| `user_id` | `uuid` | Foreign Key to `profiles.id` |
| `status` | `text` | 'PENDING', 'PAID', 'FAILED', 'SHIPPED', 'DELIVERED', 'CANCELLED' |
| `total_amount` | `numeric` | Sum of items before discount |
| `discount_applied` | `numeric` | Amount discounted |
| `final_amount` | `numeric` | Final amount paid |
| `payment_method` | `text` | 'RAZORPAY', 'COD' |
| `razorpay_order_id`| `text` | (Nullable) Reference for Razorpay |
| `razorpay_payment_id`| `text`| (Nullable) Proof of payment |
| `logistics_tracking_id`| `text` | (Nullable) Foreign ID to query the Logistics API |
| `created_at` | `timestamp` | Order date |

## 4. `order_items`
Saves a static snapshot of what the user bought. Prices must be locked here in case the Inventory API changes prices later.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `order_id` | `uuid` | Foreign Key to `orders.id` |
| `external_product_id`| `text` | ID mapping to the external Inventory API |
| `sku` | `text` | Snapshot of Product SKU |
| `name` | `text` | Snapshot of Product Name |
| `price_at_purchase`| `numeric` | Exact price the user paid per unit |
| `quantity` | `integer` | Number of units bought |

## 5. `carts`
Stores persistent cart sessions so users don't lose their selected items if they close the app.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `user_id` | `uuid` | Foreign Key to `profiles.id` |
| `external_product_id`| `text` | ID mapping to the external Inventory API |
| `quantity` | `integer` | Number of units in cart |
| `updated_at` | `timestamp` | Last time cart was modified |

## 6. `promo_codes`
Manages discount codes (like 'GREEN75') applied at checkout.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `code` | `text` | E.g., 'GREEN75' |
| `discount_type` | `text` | 'FLAT' or 'PERCENTAGE' |
| `discount_value` | `numeric` | Amount or % to deduct |
| `min_order_value` | `numeric` | Minimum cart total required |
| `is_active` | `boolean` | True if currently usable |
