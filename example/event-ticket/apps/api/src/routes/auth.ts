import { users } from 'db/schema'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { getDb } from '../lib/db'
import { authMiddleware } from '../middleware/auth'

type AuthVariables = {
	firebaseUser: { uid: string; email: string; name?: string }
}

export const authRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>()

// POST /auth/sync - ユーザー同期
authRoutes.post('/sync', authMiddleware, async (c) => {
	const firebaseUser = c.get('firebaseUser')
	const db = getDb(c)

	const existing = await db.query.users.findFirst({
		where: eq(users.id, firebaseUser.uid),
	})

	if (existing) {
		// 既存ユーザーの更新
		await db
			.update(users)
			.set({
				email: firebaseUser.email,
				displayName: firebaseUser.name ?? existing.displayName,
				updatedAt: new Date(),
			})
			.where(eq(users.id, firebaseUser.uid))
	} else {
		// 新規ユーザーの作成
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
})

// GET /auth/me - 現在ユーザー
authRoutes.get('/me', authMiddleware, async (c) => {
	const firebaseUser = c.get('firebaseUser')
	const db = getDb(c)

	const user = await db.query.users.findFirst({
		where: eq(users.id, firebaseUser.uid),
	})

	if (!user) {
		return c.json({ error: 'User not found' }, 404)
	}

	return c.json({ user })
})
