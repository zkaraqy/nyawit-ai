# Deployment Guide - Railway

## Prerequisites

1. Railway account - [https://railway.app](https://railway.app)
2. PostgreSQL database (bisa provision dari Railway)
3. GitHub repository

## Setup Railway

### 1. Create Railway Account

1. Kunjungi [https://railway.app](https://railway.app)
2. Sign in dengan GitHub
3. Authorize Railway untuk akses repository Anda

### 2. Create New Project

1. Klik **New Project**
2. Pilih **Deploy from GitHub repo**
3. Select repository: `nyawit-ai`
4. Railway akan otomatis detect Nuxt.js

### 3. Add PostgreSQL Database

1. Di project Railway, klik **New**
2. Pilih **Database** > **Add PostgreSQL**
3. Railway akan provision database dan generate credentials otomatis

### 4. Configure Environment Variables

Di Railway Dashboard, klik service Anda > **Variables** tab:

```env
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_NAME=${{Postgres.PGDATABASE}}
MODE=production
```

**Tips:** Railway menyediakan reference variables `${{Postgres.*}}` yang otomatis connect ke database Railway.

### 5. Configure Build & Start Commands

Railway otomatis detect dari `package.json`:

**Build Command:** (Railway auto-detect)
```bash
npm run build
```

**Start Command:** (Railway auto-detect)
```bash
npm run start
```

**PENTING:** Migration akan dijalankan otomatis saat Railway start aplikasi.
- Migration dijalankan di `start` command: `npm run db:migrate && node .output/server/index.mjs`
- Ini memastikan database schema up-to-date sebelum aplikasi start
- Migration hanya dijalankan saat deployment, bukan saat build

### 6. Deploy

Railway akan otomatis deploy setiap kali Anda push ke `main` branch.

## Local Development

1. Copy `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` dengan database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=nyawit_ai
   MODE=development
   ```

3. Generate dan run migrations:
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Database Management

### Generate new migration
```bash
npm run db:generate
```

### Push schema to database (Development)
```bash
npm run db:push
```

### Run migration (Production - otomatis di CI/CD)
```bash
npm run db:migrate
```

### Open Drizzle Studio (Database GUI)
```bash
npm run db:studio
```

## Deployment Process

### Automatic Deployment (Recommended)

Setiap push ke `main` branch akan trigger:

**GitHub Actions (Optional - untuk migration di CI/CD):**
1. ✅ Install dependencies
2. ✅ Build application  
3. ✅ Run database migrations
4. ✅ Verification

**Railway Deployment:**
1. ✅ Detect changes di repository
2. ✅ Build application (`npm run build`)
3. ✅ Run migration + Start server (`npm run start`)
4. ✅ Auto-deployment completed

**Note:** Migration dijalankan 2 kali:
- Di GitHub Actions: Untuk verification & testing
- Di Railway: Saat aplikasi start (idempotent, aman dijalankan multiple times)

### Manual Deployment via Railway CLI

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login:
   ```bash
   railway login
   ```

3. Link project:
   ```bash
   railway link
   ```

4. Deploy:
   ```bash
   railway up
   ```

## GitHub Actions Setup

Workflow sudah dikonfigurasi di [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

**Required GitHub Secrets:**

Go to: **Repository Settings** > **Secrets and variables** > **Actions**

Add the following secrets:
- `DB_HOST` - Railway database host
- `DB_PORT` - Railway database port (5432)
- `DB_USERNAME` - Railway database username
- `DB_PASSWORD` - Railway database password
- `DB_NAME` - Railway database name

**Note:** Ambil credentials dari Railway Dashboard > PostgreSQL > Variables tab

## Railway Configuration

Railway otomatis detect settings dari:
- `package.json` - untuk build & start commands
- `nuxt.config.ts` - untuk Nuxt configuration

## Custom Domain (Optional)

1. Di Railway Dashboard > **Settings** > **Domains**
2. Klik **Generate Domain** untuk subdomain Railway gratis
3. Atau klik **Custom Domain** untuk domain Anda sendiri

## Monitoring & Logs

### View Logs
Railway Dashboard > Service > **Deployments** > **View Logs**

### Metrics
Railway Dashboard > Service > **Metrics**

### Database Access
Railway Dashboard > PostgreSQL > **Data** atau gunakan `npm run db:studio`

## Troubleshooting

### Build Gagal
- Cek build logs di Railway Dashboard
- Pastikan semua dependencies ada di `package.json`
- Test build locally: `npm run build`

### Migration Gagal
- Cek database credentials di environment variables
- Test connection: `npm run db:studio`
- Pastikan database sudah dibuat

### Application Crash
- Cek application logs di Railway
- Pastikan PORT environment variable tidak diset manual
- Railway otomatis assign PORT

### Database Connection Error
- Pastikan reference variables benar: `${{Postgres.PGHOST}}`
- Cek database masih running di Railway
- Test dengan `npm run db:studio` menggunakan Railway credentials

## Scaling

Railway Free Tier:
- 500 execution hours/month
- $5 free credit
- Shared CPU & Memory

Untuk scaling:
1. Railway Dashboard > **Settings** > **Plan**
2. Upgrade ke Developer atau Team plan

## Database Backup

Railway otomatis backup PostgreSQL, tapi untuk manual backup:

```bash
# Dari Railway CLI
railway run pg_dump > backup.sql

# Restore
railway run psql < backup.sql
```

## Cost Optimization

1. **Use Railway Postgres** - Gratis di free tier
2. **Monitor Usage** - Railway Dashboard > Usage
3. **Optimize Build** - Minimize dependencies
4. **Use Sleep Mode** - Railway otomatis sleep inactive apps (Free tier)

## Resources

- [Railway Documentation](https://docs.railway.app)
- [Nuxt Deployment](https://nuxt.com/docs/getting-started/deployment)
- [DrizzleORM Docs](https://orm.drizzle.team/docs/overview)

## Prerequisites

1. Cloudflare account
2. PostgreSQL database (production)
3. GitHub repository

## Required GitHub Secrets

Tambahkan secrets berikut di GitHub repository Settings > Secrets and variables > Actions:

### Database Credentials
- `DB_HOST` - Database host (contoh: your-db.region.provider.com)
- `DB_PORT` - Database port (default: 5432)
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name

### Cloudflare Credentials
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token dengan permissions:
  - Account > Cloudflare Pages > Edit
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare Account ID

## Cara Mendapatkan Cloudflare Credentials

### API Token
1. Login ke Cloudflare Dashboard
2. Go to: Profile > API Tokens
3. Click "Create Token"
4. Use template "Edit Cloudflare Workers" atau custom token dengan permissions:
   - Account > Cloudflare Pages > Edit
5. Copy token dan simpan sebagai `CLOUDFLARE_API_TOKEN`

### Account ID
1. Login ke Cloudflare Dashboard
2. Select your domain
3. Account ID ada di sidebar kanan bawah
4. Copy dan simpan sebagai `CLOUDFLARE_ACCOUNT_ID`

## Local Development

1. Copy `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update nilai di `.env` dengan credentials database lokal Anda

3. Generate dan run migrations:
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Database Management

### Generate new migration
```bash
npm run db:generate
```

### Push schema to database
```bash
npm run db:push
```

### Open Drizzle Studio (Database GUI)
```bash
npm run db:studio
```

### Run migration
```bash
npm run db:migrate
```

## Deployment Process

Deployment akan berjalan otomatis ketika:
1. Push ke branch `main`
2. Create Pull Request ke branch `main`

### Workflow Steps:
1. ✅ Checkout code
2. ✅ Setup Node.js
3. ✅ Install dependencies
4. ✅ Run database migrations
5. ✅ Build Nuxt application
6. ✅ Deploy to Cloudflare Pages
7. ✅ Cleanup

## Manual Deployment

Jika ingin deploy manual via CLI:

1. Install Wrangler:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Build aplikasi:
   ```bash
   npm run build
   ```

4. Deploy:
   ```bash
   wrangler pages deploy .output/public --project-name=nyawitai
   ```

## Environment Variables di Cloudflare

Setelah deploy pertama kali, tambahkan environment variables di Cloudflare Dashboard:

1. Go to: Workers & Pages > nyawitai > Settings > Environment variables
2. Tambahkan semua variables:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `MODE` = `production`

## Troubleshooting

### Migration gagal
- Pastikan database credentials benar
- Cek koneksi ke database production
- Pastikan database sudah dibuat

### Build gagal
- Cek Node.js version (harus 20.x)
- Clear cache: `rm -rf node_modules .nuxt .output && npm install`
- Cek error di GitHub Actions logs

### Deploy gagal
- Pastikan Cloudflare API Token valid dan memiliki permissions yang benar
- Pastikan Account ID benar
- Pastikan project name sesuai dengan `wrangler.toml`

## Monitoring

- **Cloudflare Dashboard**: Monitor deployments dan errors
- **Drizzle Studio**: Monitor database (local & production)
- **GitHub Actions**: Monitor CI/CD pipeline

## Database Backup

Sangat disarankan untuk melakukan backup database secara berkala:

```bash
# PostgreSQL backup
pg_dump -h $DB_HOST -U $DB_USERNAME -d $DB_NAME > backup.sql

# Restore
psql -h $DB_HOST -U $DB_USERNAME -d $DB_NAME < backup.sql
```
