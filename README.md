# The Shelf — your Digistore24 affiliate catalog

A public product catalog with a real, secure admin login.Only you can add,
edit, or delete products — enforced by the database itself, not just by
website code.

Follow every step below in order. None of it requires coding.
---

## Part 1 — Create your database (Supabase)

1. Go to https://supabase.com and click **Start your project**. Sign up
   (free — no credit card needed).
2. Click **New project**. Give it any name (e.g. "the-shelf"), set a
   database password (save it somewhere), pick the region closest to you,
   and click **Create new project**. Wait ~2 minutes while it sets up.
3. In the left sidebar, click the **SQL Editor** icon.
4. Click **New query**, then open the `supabase/schema.sql` file from this
   project, copy all of it, and paste it into the SQL editor.
5. Click **Run**. You should see "Success. No rows returned." This created
   your products table and locked it down so only you can edit it.

## Part 2 — Create your login (you, and only you)

1. In the left sidebar, click **Authentication**.
2. Click **Add user** → **Create new user**.
3. Enter the email and password you want to use to log into your own site.
   Check **Auto Confirm User** so you don't need to verify by email.
4. Click **Create user**. This is now your one and only admin login — there
   is no public sign-up page on the website, so nobody else can create an
   account.

## Part 3 — Get your connection keys

1. In the left sidebar, click the **Settings (gear icon)** → **API**.
2. You'll see a **Project URL** and an **anon public** key. You'll need
   both in the next part. (The anon key is safe to make public — it can
   only do what the security rules from Part 1 allow.)

## Part 4 — Run the site on your computer (to test it)

1. Install Node.js if you don't have it: https://nodejs.org (choose the
   "LTS" version, click through the installer with default options).
2. Open this project folder in a terminal / command prompt.
3. Copy `.env.example` to a new file named `.env`, and paste in your
   Project URL and anon key from Part 3.
4. Run:
   ```
   npm install
   npm run dev
   ```
5. Open the link it gives you (usually `http://localhost:5173`) in your
   browser. Click **Admin**, sign in with the email/password from Part 2,
   and try adding a product.

## Part 5 — Put it on the internet (deploy)

The easiest free option is **Netlify** or **Vercel**. Steps for Netlify:

1. Create a free account at https://netlify.com.
2. Put this project in a GitHub repository (if you're not sure how, ask —
   I can walk you through it, or Netlify also supports dragging a built
   folder in directly).
3. In Netlify, click **Add new site → Import an existing project**, and
   connect your GitHub repo.
4. Under **Site settings → Environment variables**, add the same two
   variables from your `.env` file: `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`.
5. Deploy. Netlify gives you a live URL — that's your real website.

---

## Adding products going forward

Visit your site, click **Admin** (top right), sign in with the email and
password from Part 2, then click **+ Add product**. Fill in the name,
category, image URL, description, and your Digistore24 affiliate link.
It saves to the database immediately and appears on the public page.

To create a new category, just type a new category name when adding a
product — no separate setup needed.

## If you ever forget your password

In Supabase, go to **Authentication → Users**, click your user, and you
can reset the password directly from there.
