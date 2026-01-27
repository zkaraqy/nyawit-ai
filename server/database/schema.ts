import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'

export const waitlists = pgTable('waitlists', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

export type Waitlist = typeof waitlists.$inferSelect
export type NewWaitlist = typeof waitlists.$inferInsert
