# The Shelf

A small, curated product catalog site. Built with React and Supabase — includes
a secure, hidden admin panel to add, edit, and remove products without touching code.

## Features

- Public storefront with category filtering
- Each product shows a name, image, description, and an affiliate link
- Hidden admin panel (only accessible via a secret URL) to manage products
- Real authentication and database-level security — only the site owner can
  add, edit, or delete products
- No coding required after initial setup

## Tech stack

- **Frontend:** React + Vite
- **Database & Auth:** [Supabase](https://supabase.com)
- **Hosting:** Netlify

## Setup

1. Create a free [Supabase](https://supabase.com) project.
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor to create
   the `products` table and its security rules.
3. Under **Authentication → Users**, manually create your one admin login
   (there is no public sign-up).
4. Copy `.env.example` to `.env` and fill in your Supabase Project URL and
   publishable (anon) key from **Settings → API**.
5. Install dependencies and run locally:
   npm install
   npm run dev
6. Visit `http://localhost:5173/?owner=YOUR_SECRET_WORD` (set in `src/App.jsx`)
   to access the admin panel and add products.

## Deploying

Connect this repository to [Netlify](https://netlify.com), add the same two
environment variables from your `.env` file in Netlify's site settings, and
deploy.

## Security notes

- The admin panel is hidden behind a secret URL parameter, but the real
  protection is Supabase authentication and Row Level Security — only a
  logged-in admin can write to the database, enforced server-side.
- Never commit your `.env` file or your Supabase **secret** key. Only the
  **anon/publishable** key belongs in this project.

## Disclosure

Product links on this site are affiliate links.
