/**
 * Database Abstraction Layer
 *
 * Currently uses Turso (libSQL) — works locally (file:) and on Vercel (turso URL).
 * To switch to Neon/Supabase (PostgreSQL):
 *   1. npm install drizzle-orm/neon-http @neondatabase/serverless
 *   2. Replace the drizzle import below with: drizzle from 'drizzle-orm/neon-http'
 *   3. Update schema.ts to use pgTable instead of sqliteTable
 */
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

console.log('[DB_INIT] DATABASE_URL during initialization:', process.env.DATABASE_URL);

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
  fetch: (url: any, options: any) => {
    return fetch(url, {
      ...options,
      cache: 'no-store',
    })
  },
})

export const db = drizzle(client, { schema })
export type DB = typeof db
