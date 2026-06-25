# Owner's Locker

Track what's in the locker between Disney World visits. Owner's Locker is a mobile-first inventory app for vacation-home owners who share a stocked locker—know what's running low, what's expiring, and what to buy before the next trip.

## Features

- **Inventory** — Browse items by category, search by name or notes, and see at-a-glance stock and expiration status
- **Flexible tracking** — Track items by exact count (with a low-stock threshold) or by level (Full / Medium / Low)
- **Expiration alerts** — Flag items expiring within 90 days, with urgent warnings inside 14 days
- **Restock list** — Auto-generated checklist of low, empty, and expiring items; copy to clipboard for shopping
- **Activity log** — Audit trail of who created, updated, or deleted items
- **Category management** — Create color-coded categories to organize locker contents
- **Google sign-in** — Restricted to an allowlist of email addresses

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [NextAuth.js v5](https://authjs.dev/) with Google OAuth
- [Prisma](https://www.prisma.io/) + PostgreSQL
- [Tailwind CSS 4](https://tailwindcss.com/)
- TypeScript

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (local or hosted, e.g. [Neon](https://neon.tech))
- A [Google OAuth client](https://console.cloud.google.com/apis/credentials) configured for your app URL

### Environment variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/locker"

# NextAuth (generate with: openssl rand -base64 32)
AUTH_SECRET="your-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Comma-separated list of allowed Google account emails
ALLOWED_EMAILS="you@example.com,partner@example.com"
```

For Google OAuth, add your redirect URI:

- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://your-domain.com/api/auth/callback/google`

### Install and run

```bash
npm install

# Apply database schema
npm run db:migrate

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to sign in with Google.

### Database commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:migrate` | Run pending migrations (development) |
| `npm run db:push` | Push schema changes without a migration |

## Project structure

```
app/
  (app)/          # Authenticated pages: inventory, restock, activity, manage
  (auth)/         # Login and not-authorized pages
  api/            # REST routes for items, categories, and auth
components/       # UI components (ItemCard, ItemSheet, BottomNav, etc.)
lib/              # Business logic (items, restock, expiration, activity)
prisma/           # Schema and migrations
auth.ts           # NextAuth configuration
middleware.ts     # Route protection
```

## Deployment

The app is designed to deploy on [Vercel](https://vercel.com) or any Node.js host that supports Next.js.

1. Set all environment variables in your hosting provider
2. Run `npm run build` to verify the production build
3. Ensure migrations are applied to your production database before first deploy

## License

Private project.
