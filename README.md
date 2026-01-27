# Nyawit AI - Nuxt 4 + DrizzleORM + Cloudflare Pages

Aplikasi web modern dengan Nuxt 4, DrizzleORM untuk database management, dan deployed di Cloudflare Pages.

## Tech Stack

- **Framework**: Nuxt 4
- **Database**: PostgreSQL + DrizzleORM
- **Styling**: Tailwind CSS v4
- **3D**: Three.js + TresJS
- **Deployment**: Cloudflare Pages
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

## Deployment to Cloudflare Pages

### Automatic Deployment (Recommended)

Push ke branch `main` akan otomatis trigger deployment via GitHub Actions.

**Required GitHub Secrets:**
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Manual Deployment

#### Windows (PowerShell):
```powershell
.\deploy.ps1
```

#### Linux/Mac (Bash):
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Via NPM:
```bash
# Build and deploy
npm run deploy:build

# Deploy only (setelah build)
npm run deploy
```

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
└── wrangler.toml
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:generate` - Generate migrations
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio
- `npm run deploy` - Deploy to Cloudflare
- `npm run deploy:build` - Build and deploy

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT
