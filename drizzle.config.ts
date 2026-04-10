import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env' })

export default defineConfig({
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    //if dev use 
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: process.env.MODE === 'production' ? 'require' : false,

    //if prod use 
    // url: process.env.DATABASE_URL!
  }
})
