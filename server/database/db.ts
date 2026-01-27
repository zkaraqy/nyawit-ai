import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { config } from 'dotenv'

config({ path: '.env' })

const connectionString = `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`

// Create postgres client
export const client = postgres(connectionString, {
  ssl: process.env.MODE === 'production' ? 'require' : false,
  max: 10,
})

// Create drizzle instance
export const db = drizzle(client, { schema })

// Test connection
client`SELECT 1`
  .then(() => {
    console.log('✅ Database connection established successfully')
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message)
  })
