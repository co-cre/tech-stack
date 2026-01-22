import { type Database, createDb } from 'db'
import type { Context } from 'hono'

export function getDb(c: Context<{ Bindings: Env }>): Database {
	return createDb(c.env.DB)
}
