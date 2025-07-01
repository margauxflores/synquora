# Synquora

A modern event management and scheduling dashboard built with Next.js 15, TypeScript, and tRPC.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/margauxflores/synquora&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,DATABASE_URL,DISCORD_GUILD_ID,DISCORD_BOT_TOKEN,DISCORD_ANNOUNCEMENT_CHANNEL_ID,NEXT_PUBLIC_APP_URL&envDescription=Add%20your%20Clerk,%20Supabase,%20and%20Discord%20keys%20to%20enable%20authentication%20and%20event%20syncing)

📘 [View Documentation](https://synquora.com)

![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/margauxflores/synquora?sort=semver)
![License](https://img.shields.io/github/license/margauxflores/synquora)
![Issues](https://img.shields.io/github/issues/margauxflores/synquora)
![Repo size](https://img.shields.io/github/repo-size/margauxflores/synquora)
![GitHub Repo stars](https://img.shields.io/github/stars/margauxflores/synquora?style=social)

---

## Features

- 🔐 Authentication with Clerk
- 📅 Event management and scheduling
- 💬 Discord channel integration
- 👥 User availability tracking
- 🎨 Modern UI with Tailwind CSS and Radix UI components
- 🔄 Real-time updates with React Query
- 🛠 Type-safe API with tRPC
- 🗃 PostgreSQL database with Drizzle ORM

---

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Clerk
- **API:** tRPC
- **Styling:** Tailwind CSS, Radix UI
- **State Management:** React Query
- **Date Handling:** date-fns
- **Development Tools:** ESLint, Prettier

---

## Prerequisites

Ensure you have the following installed:

- Node.js (LTS version)
- npm or pnpm
- PostgreSQL

---

## Environment Setup

```bash
# Clone the repository
git clone https://github.com/your-username/synquora.git
cd synquora

# Copy the sample env file
cp .env.sample .env

# Then fill in your environment variables:
# - Clerk credentials
# - Supabase project URL and keys
# - Discord bot credentials
# - App base URL
```

### 🌐 Setting `NEXT_PUBLIC_APP_URL`

This environment variable determines the base URL used for generating event links (e.g., in Discord).

| Environment        | Value                      |
|--------------------|----------------------------|
| Local Development  | `http://localhost:3000`    |
| Vercel Preview     | `https://$(VERCEL_URL)`    |
| Vercel Production  | `https://yourdomain.com`   |

In Vercel, set this in your Project → Settings → Environment Variables:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Installation

```bash
# Install dependencies
npm install

# Push the database schema
npm run db:push
```

---

## 🚀 Deploy Your Own Instance

Click below to deploy **Synquora** to Vercel instantly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/margauxflores/synquora&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,DATABASE_URL,DISCORD_GUILD_ID,DISCORD_BOT_TOKEN,DISCORD_ANNOUNCEMENT_CHANNEL_ID,NEXT_PUBLIC_APP_URL&envDescription=Add%20your%20Clerk,%20Supabase,%20and%20Discord%20keys%20to%20enable%20authentication%20and%20event%20syncing)

---

### 🧪 Database Scripts (Reset & Seed)

For development and testing, you can reset and repopulate the database using the provided scripts:

```bash
# Reset the database by clearing all records
npm run db:reset

# Seed the database with test users and availability
npm run db:seed
```

These scripts are located in the `scripts/` directory:

- `scripts/reset.ts`: Deletes all data (⚠️ irreversible!)
- `scripts/seed.ts`: Adds test users with staggered timezones and default availability

> 💡 These are safe to use in local and test environments, but should never be run in production.

---

## Development

```bash
# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── ui/           # Reusable UI components
├── lib/              # Utility functions and configurations
│   ├── drizzle/      # Database configuration
└── server/           # Server-side code
    └── api/          # API routes and tRPC configuration
```

---

## Scripts

- `dev` - Start development server
- `build` - Build for production
- `start` - Start production server
- `db:push` - Push database schema changes
- `db:seed` - Seed the database with test data
- `db:reset` - Clear all database records (dev only)
- `lint` - Run ESLint
- `format` - Format code with Prettier

---

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

---

## License

[MIT License](LICENSE)

---

## Support

For support, please [open an issue](https://github.com/margauxflores/synquora/issues) in the GitHub repository.
