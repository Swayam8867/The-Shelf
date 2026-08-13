-- Run this once in your Supabase project's SQL Editor.
-- It creates the products table and locks it down so that:
--   - anyone can VIEW products (needed for your public website)
--   - only a signed-in (logged-in) user can add, edit, or delete products

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  image text,
  description text,
  link text not null,
  created_at timestamptz default now()
);

-- Turn on Row Level Security (this is what makes it actually secure)
alter table products enable row level security;

-- Anyone can read the product list (this is what makes it a public website)
create policy "Public can view products"
  on products for select
  using (true);

-- Only a logged-in user can add products
create policy "Logged-in users can insert products"
  on products for insert
  to authenticated
  with check (true);

-- Only a logged-in user can edit products
create policy "Logged-in users can update products"
  on products for update
  to authenticated
  using (true);

-- Only a logged-in user can delete products
create policy "Logged-in users can delete products"
  on products for delete
  to authenticated
  using (true);
