# Sparkr SMS Messaging System — Frontend

A standalone, frontend-only SMS messaging dashboard prototype for the Sparkr team to import
contacts and send promotional SMS campaigns. **No backend, database, or SMS provider is
connected** — everything runs on dummy data and simulated actions, by design.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 (CSS-variable design tokens, see `app/globals.css`)
- `lucide-react` icons, `class-variance-authority` + `clsx` + `tailwind-merge` for component variants

Styling conventions (design tokens, `cn()` helper, `Card`/`Button` composition, fluid `clamp()`
spacing scale, sidebar/topbar shell) mirror the existing SparkrMedia-TemplateWebsite admin app,
recolored to the black/white/grey palette specified for this project.

## Running it

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — it redirects to `/login`. Enter anything and submit to reach the
contacts page (see "Placeholder behavior" below).

## Pages

- `/login` — email/password UI (no real auth)
- `/contacts` — contacts table, search, CSV import with preview, delete
- `/send` — recipient picker, message composer, test send, confirm-and-send

## Placeholder behavior (clearly separated from real integration points)

Every "backend-shaped" action is simulated client-side and isolated so it's easy to swap later:

| Feature | File | What it does now | What it needs later |
|---|---|---|---|
| Login | `app/login/page.tsx` | Validates fields are non-empty, waits 500ms, navigates to `/contacts` | Real auth call + session/cookie handling |
| Contacts | `lib/dummy-data.ts` | Static in-memory array, mutated via `useState` in `app/(app)/contacts/page.tsx` | Fetch/create/delete via an API |
| CSV import | `lib/csv.ts`, `components/contacts/ImportCsvModal.tsx` | Parses the CSV file in the browser, flags duplicates/invalid rows against the current in-memory contact list | Upload the file to a backend endpoint that persists + validates server-side |
| Send SMS | `app/(app)/send/page.tsx` | "Send Test SMS" and "Send SMS" both just `setTimeout` and show a success banner | Real send request to an SMS provider (e.g. Twilio) via a backend endpoint |

No MySQL, Google Sheets, or Twilio integration exists anywhere in this codebase, per the project
requirements — those are intentionally left as the documented next steps above.
