# BeaconHaus Pilot Deployment Checklist

Use this for the Neon + Vercel free pilot.

## Neon

1. Create a Neon Free project.
2. Open the Neon SQL editor.
3. Run `postgres/neon-pilot.sql`.
4. Claim Liz's profile with her real Google email:

```sql
INSERT INTO beaconhaus_profile_claims (email, account_key)
VALUES ('liz@example.com', 'liz')
ON CONFLICT (email) DO UPDATE SET account_key = EXCLUDED.account_key;
```

5. Copy the pooled connection string for Vercel as `DATABASE_URL`.

## Google OAuth

Create a Google OAuth Web client.

Authorized JavaScript origins:

```text
http://localhost:3939
https://YOUR-VERCEL-DOMAIN.vercel.app
```

Authorized redirect URIs:

```text
http://localhost:3939/api/auth/callback/google
https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/callback/google
```

## Vercel

Import the repo and use:

```text
Framework Preset: Next.js
Root Directory: web
Install Command: npm ci
Build Command: npm run build
Output Directory: default
```

Environment variables:

```text
DATABASE_URL=Neon pooled connection string
NEXT_PUBLIC_BEACONHAUS_BACKEND=neon
AUTH_SECRET=long random value
AUTH_GOOGLE_ID=Google OAuth client ID
AUTH_GOOGLE_SECRET=Google OAuth client secret
AUTH_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
GEMINI_API_KEY=optional
```

## Verification

1. Open the Vercel URL.
2. Sign in with Liz's Google account.
3. Confirm seeded People, Places, Captures, and Settings appear.
4. Add a test person and refresh.
5. Sign out.
6. Sign in with a second Google account.
7. Confirm the second user cannot see Liz's data.
8. Use Settings -> Start fresh for the second user if you want seed data there.
