import { users } from 'db/schema'
import { eq } from 'drizzle-orm'
import type { Context } from 'hono'
import { getDb } from '../lib/db'

type AuthEnv = {
	Bindings: Env
	Variables: { firebaseUser: { uid: string; email: string; name?: string } }
}

export const syncUser = async (c: Context<AuthEnv>) => {
	const firebaseUser = c.get('firebaseUser')
	const db = getDb(c)

	const existing = await db.query.users.findFirst({
		where: eq(users.id, firebaseUser.uid),
	})

	if (existing) {
		await db
			.update(users)
			.set({
				email: firebaseUser.email,
				displayName: firebaseUser.name ?? existing.displayName,
				updatedAt: new Date(),
			})
			.where(eq(users.id, firebaseUser.uid))
	} else {
		await db.insert(users).values({
			id: firebaseUser.uid,
			email: firebaseUser.email,
			displayName: firebaseUser.name,
		})
	}

	const user = await db.query.users.findFirst({
		where: eq(users.id, firebaseUser.uid),
	})

	return c.json({ user })
}

export const getMe = async (c: Context<AuthEnv>) => {
	const firebaseUser = c.get('firebaseUser')
	const db = getDb(c)

	const user = await db.query.users.findFirst({
		where: eq(users.id, firebaseUser.uid),
	})

	if (!user) {
		return c.json({ error: 'User not found' }, 404)
	}

	return c.json({ user })
}
