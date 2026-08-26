-- 1. Profiles Table
CREATE TABLE public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text not null check (role in ('B2C', 'B2B', 'ADMIN')) default 'B2C',
  full_name text,
  phone text,
  b2b_shop_name text,
  b2b_gstin text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'B2C'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Addresses Table
CREATE TABLE public.addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  label text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own addresses" 
  ON public.addresses FOR ALL 
  USING (auth.uid() = user_id);


-- 3. Orders Table
CREATE TABLE public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null check (status in ('PENDING', 'PAID', 'FAILED', 'SHIPPED', 'DELIVERED', 'CANCELLED')) default 'PENDING',
  total_amount numeric not null,
  discount_applied numeric default 0,
  final_amount numeric not null,
  payment_method text not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  logistics_tracking_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" 
  ON public.orders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);


-- 4. Order Items Table
CREATE TABLE public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  external_product_id text not null,
  sku text not null,
  name text not null,
  price_at_purchase numeric not null,
  quantity integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order items" 
  ON public.order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert order items" 
  ON public.order_items FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );


-- 5. Carts Table
CREATE TABLE public.carts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  external_product_id text not null,
  quantity integer not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cart" 
  ON public.carts FOR ALL 
  USING (auth.uid() = user_id);


-- 6. Promo Codes Table
CREATE TABLE public.promo_codes (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  discount_type text not null check (discount_type in ('FLAT', 'PERCENTAGE')),
  discount_value numeric not null,
  min_order_value numeric default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Everyone can read promo codes (so they can apply them at checkout)
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active promo codes" 
  ON public.promo_codes FOR SELECT 
  USING (is_active = true);
