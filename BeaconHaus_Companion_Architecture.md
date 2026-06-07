# BeaconHaus Companion: Architecture and Integrations

A build plan for Claude Code to take the companion from a single-device prototype to a real app that Liz uses on her phone, tablet, and computer, with Google Drive, native email, calendar, and LinkedIn connected. Pair this with the data and rules spec, the sample workbook, and the ERB-generated `postgres/` output.

The guiding rule does not change. The backend gets richer, but Liz's experience stays calm. Every integration shows up only as a gentle button when she needs it, never as setup or settings she has to think about.

## 1. Recommended stack

- App: a responsive web app built as a PWA so it installs to the home screen on phone, tablet, and computer from one codebase. Next.js works well here because it also gives server routes for the OAuth token exchanges that must stay off the client.
- Data, auth, and sync: Neon Postgres with Auth.js Google sign-in and server-side data routes. This keeps cross-device sync automatic while staying on a free-friendly Postgres path.
- Hosting: Vercel, which pairs cleanly with Next.js and is already familiar.
- Sign in: Auth.js with Google sign-in. One tap for Liz, and it keeps Google Drive and Calendar permissions available later as separate, narrow consent steps.

Why a PWA rather than native apps: one codebase covers all three device types, it installs to the home screen and opens full screen, and it avoids app store overhead for a single-user tool. Native email and calendar still open her real device apps through standard links.

## 2. Cross-device access

- Build mobile-first and fully responsive so the same screens feel right on a phone, a tablet, and a laptop.
- Add a web app manifest and a service worker so she can install it to her home screen and open it offline for reading, with changes syncing when she is back online.
- All her data lives in Neon Postgres keyed to her Auth.js profile, so signing in on any device shows the same up-to-date circle, places, and notes.

## 3. Auth and data

- Liz signs in with Google through Auth.js.
- Every table carries a user_id and Row Level Security so only her account can read or write her rows. The schema file sets this up.
- The data model is the same one from the prototype and the workbook: people, facilities, captures, and a per-user profile for her settings. The schema also adds a small table to hold OAuth tokens server-side for Drive and LinkedIn.

## 4. The integrations

### Native email
Keep this native and login-free for v1. The app composes the outreach message, then opens the device's own mail app with the recipient, subject, and body prefilled through a standard mail compose link. This works the same on iPhone, iPad, and computer, and it respects whatever mail app she already uses.
Optional later: connect Gmail with the send-only scope so the app can send and log the message itself, and later read replies. Only worth it if she wants sending and reply tracking inside the app. It adds a Google permission and only covers Gmail.

### Calendar
Native first. When she sets a next step like sitting down with Mina, the app offers Add to calendar, which creates a standard calendar file or an add-to-calendar link that opens her device calendar with the event filled in. Works on every device.
Optional, and natural since she is already signed in with Google: the Google Calendar API with the events scope, so the app can place events directly on her calendar and, if useful, read free and busy times to suggest a slot. Use the events scope only, never full calendar access.

### Google Drive
Connect with OAuth using the drive.file scope, which lets the app see and manage only the files it creates, nothing else in her Drive. Use it to:
- Save automatic backups of her data as a file she owns.
- Save generated documents like the marketing one-pager and her case studies into a BeaconHaus folder.
Note on consent: Google shows a permission screen. The narrow drive.file scope keeps it modest and avoids the heavier verification that full Drive access would trigger. For a single user the app can run in testing mode with her added as a test user.

### LinkedIn
Set expectations clearly, because the official API is intentionally narrow and the unofficial workarounds are dangerous to her account.

What is not possible through the official API: reading her connections, searching for people, importing contacts, or sending connection requests or messages. Those are reserved for approved enterprise partners and are off limits to a small app.

What you must not build: any scraping or browser-automation approach that mimics those features. Those are the very behaviors that get real LinkedIn accounts restricted or banned, so they are not an option for Liz's account.

What does work, officially and safely:
- Posting to her own feed. With the member social scope she can publish her weekly thoughtful posts from the app. The simplest v1 is even lighter: the app drafts the post text, she taps Copy, and Open LinkedIn drops her into the composer to paste and post.
- Quick open. Store a LinkedIn profile link on each person and offer Open in LinkedIn, so she can view a profile or message someone by hand in one tap. The reaching out stays human, which is also what keeps her account healthy.

So in the app, LinkedIn is a posting helper and a quick-open shortcut, not an automated outreach engine.

## 5. Security

- All OAuth client secrets and token exchanges live server-side, in Next.js server routes, never in the browser bundle.
- Store refresh tokens encrypted, tied to her user_id, protected by Row Level Security.
- Request the narrowest scope that does the job: drive.file, calendar.events, the LinkedIn member social scope, and Gmail send only if added later.
- Ask for each permission only when she first taps the feature that needs it, not all at once at sign-in. Incremental consent feels calmer and is easier to approve.

## 6. What this means for Liz

- She signs in once with Google and the app works on every device, installed to her home screen like any other app.
- The connections show up as plain buttons in context: Email this opens her mail app, Add to calendar drops the event in, Save to Drive keeps a copy, Open in LinkedIn or Post to LinkedIn handles the professional side.
- Nothing about backends, tokens, or scopes is ever in front of her. The daily flow stays exactly as calm as the prototype.

## 7. Suggested sequence

Start with the foundation and the safe, native connections, then add the heavier Google API pieces only if she wants them.

- First: the PWA on Vercel, Neon with the ERB-generated Postgres schema and policy seams, Auth.js Google sign-in, native email compose, add-to-calendar files, Google Drive backup, and LinkedIn open and copy-to-post.
- Later if wanted: Gmail send and reply reading, Google Calendar direct create and availability, and the LinkedIn member social posting scope so posts publish without leaving the app.

The point of the sequence is that she gets a working, cross-device, connected app early, and the optional depth can come after, without reworking the foundation.
