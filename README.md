# Nate's Krafts Emergency NFC

A mobile-first NFC emergency identification web app. Each physical NFC tag stores one permanent short URL such as `/e/4A72C9D91F0B`. The database decides whether the tag is unactivated, active or disabled.

## Stack

- Next.js 16 App Router
- Supabase Postgres + Auth + private Storage
- Vercel hosting
- Passwordless email magic-link owner authentication

## Privacy model

The public NFC lookup returns only: name, medical conditions, allergies, medication information, important medical notes, and emergency contact names/relationships/phone numbers. Date of birth, account email, home location, blood type, profile photo, internal UUIDs and private notes are not returned publicly.

The public page has no edit control. Owners authenticate by email magic link at `/login` and edit at `/account`. Seller administration is role-gated at `/admin` and deliberately does not expose customer medical content.

## Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Never add Supabase secret/service-role keys to a `NEXT_PUBLIC_` variable.

## Deployment checklist

1. Apply the database schema and storage policies to Supabase.
2. Configure Supabase Auth Site URL and redirect URLs for the production domain.
3. Deploy to Vercel and set the three environment variables above.
4. Sign in once with the seller email, then promote that account to `admin` in `public.app_users`.
5. Create a test tag in `/admin`, write the generated `/e/CODE` URL to an NFC tag and test the complete activation journey on iPhone and Android.

## Disclaimer

This application is not a medical device and is not medically certified. Emergency information is user-supplied and is not independently verified.
