# Nyawit AI - Nuxt 4 + DrizzleORM + Railway

Aplikasi web modern dengan Nuxt 4, DrizzleORM untuk database management, dan deployed di Railway.

## Tech Stack

- **Framework**: Nuxt 4
- **Database**: PostgreSQL + DrizzleORM
- **Styling**: Tailwind CSS v4
- **3D**: Three.js + TresJS
- **Deployment**: Railway
- **CI/CD**: GitHub Actions

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Update file `.env` dengan database credentials Anda:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=nyawit_ai
MODE=development
```

### 3. Database Setup

Generate dan push database schema:

```bash
# Generate migrations
npm run db:generate

# Push schema ke database
npm run db:push
```

Open Drizzle Studio (Database GUI):

```bash
npm run db:studio
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Database Management

```bash
# Generate new migration
npm run db:generate

# Push schema to database (recommended for development)
npm run db:push

# Run migrations (recommended for production)
npm run db:migrate

# Open Drizzle Studio
npm run db:studio

# Drop migration
npm run db:drop
```

## Production Build

Build the application for production:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## Deployment to Railway

### Automatic Deployment (Recommended)

1. **Connect Repository to Railway**
   - Login to [Railway](https://railway.app)
   - Create New Project > Deploy from GitHub
   - Select `nyawit-ai` repository

2. **Add PostgreSQL Database**
   - New > Database > Add PostgreSQL
   - Railway auto-generates credentials

3. **Configure Environment Variables**
   ```env
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}
   DB_USERNAME=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   DB_NAME=${{Postgres.PGDATABASE}}
   MODE=production
   ```

4. **Push to Main Branch**
   - Push akan otomatis trigger deployment
   - Migration dijalankan otomatis via GitHub Actions

### Manual Deployment via CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

**Required GitHub Secrets:**
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`

Ambil dari Railway Dashboard > PostgreSQL > Variables

## Documentation

Untuk panduan deployment lengkap, lihat [DEPLOYMENT.md](DEPLOYMENT.md)

## Project Structure

```
nyawit-ai/
├── app/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   └── types/
├── server/
│   ├── api/
│   │   └── waitlist/
│   ├── database/
│   │   ├── migrations/
│   │   ├── schema.ts
│   │   ├── db.ts
│   │   └── index.ts
│   ├── plugins/
│   │   └── drizzle.server.ts
│   └── types/
├── public/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── drizzle.config.ts
├── nuxt.config.ts
└── package.json
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run preview` - Preview production build
- `npm run db:generate` - Generate migrations
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio
- `npm run deploy` - Build and run migrations

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT
