# Sparkr SMS Messaging System

An SMS messaging admin app for the Sparkr team to import contacts and send promotional SMS
campaigns, backed by MySQL (via Prisma) and Twilio.

## Stack

- Next.js 16 (App Router) + TypeScript
- MySQL via Prisma (`prisma/schema.prisma`)
- Twilio (`lib/twilio.ts`) for sending SMS
- Cookie-based session auth with bcrypt-hashed passwords (`lib/session.ts`), mirroring
  SparkrMedia-TemplateWebsite's auth pattern — no NextAuth or third-party auth provider
- Tailwind CSS v4 (CSS-variable design tokens, see `app/globals.css`)
- `lucide-react` icons, `class-variance-authority` + `clsx` + `tailwind-merge` for component variants

Styling conventions (design tokens, `cn()` helper, `Card`/`Button` composition, fluid `clamp()`
spacing scale, topbar shell) mirror the existing SparkrMedia-TemplateWebsite admin app, recolored
to the black/white/grey palette specified for this project.

## Setup

1. Fill in `.env` (already created from `.env.example`):
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — your MySQL server's details.
     `DATABASE_URL` is assembled from these automatically (Prisma expands `${VAR}` in `.env`).
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` — from the Twilio console
     (SMS sending returns a clear error if these are left unset; everything else works without them)
2. Install dependencies and push the schema to your database:
   ```bash
   npm install
   npm run db:push
   ```
3. Seed an admin login:
   ```bash
   SEED_ADMIN_EMAIL=you@sparkr.com SEED_ADMIN_PASSWORD=yourpassword npm run db:seed
   ```
4. Run it:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` — it redirects to `/login`. Sign in with the admin credentials from
step 3.

## Pages

- `/login` — email/password sign-in (`app/api/auth/login`)
- `/contacts` — contacts table, search, CSV import with preview, delete
- `/send` — recipient picker (searchable, filterable by consent status), message composer, send

## Backend

| Route | What it does |
|---|---|
| `POST /api/auth/login` | Verifies credentials (bcrypt), creates a session, sets an httpOnly cookie. Rate-limited by IP + email. |
| `POST /api/auth/logout` | Destroys the current session. |
| `GET /api/contacts` | Lists all contacts. |
| `POST /api/contacts` | Creates a single contact. |
| `DELETE /api/contacts/[id]` | Deletes a contact. |
| `POST /api/contacts/import` | Re-parses and re-validates the uploaded CSV text server-side (never trusts the browser's preview) and persists the valid rows, skipping duplicates. |
| `POST /api/sms/send` | Sends the message to each selected contact via Twilio and logs every attempt (`SmsMessage` table) regardless of success/failure. |

The `(app)` route group (`/contacts`, `/send`) is gated server-side in `app/(app)/layout.tsx` —
no session cookie redirects to `/login`.

## Database

Schema lives in `prisma/schema.prisma`:
- `AdminUser` / `Session` — login + session auth
- `Contact` — name, phone (unique), email, birthday, coin balance, consent status
- `SmsMessage` — an audit log of every send attempt (recipient, body, status, Twilio SID or error),
  kept even if the contact is later deleted

Useful scripts: `npm run db:push` (sync schema to DB without migration files — fine for this
project's scale), `npm run db:seed` (create/update an admin login), `npm run db:studio` (Prisma's
GUI for browsing data).
