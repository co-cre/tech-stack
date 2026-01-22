import { events, orders, ticketTypes, users } from 'db/schema'
import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { getDb } from '../lib/db'
import { getStripe } from '../lib/stripe'
import { authMiddleware } from '../middleware/auth'

type AuthVariables = {
	firebaseUser: { uid: string; email: string; name?: string }
}

export const ordersRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>()

const createOrderSchema = z.object({
	ticketTypeId: z.string(),
	quantity: z.number().int().min(1).max(10),
	idempotencyKey: z.string().optional(),
})

// POST /orders - 注文作成
ordersRoutes.post('/', authMiddleware, async (c) => {
	const db = getDb(c)
	const stripe = getStripe(c.env.STRIPE_SECRET_KEY)
	const firebaseUser = c.get('firebaseUser')

	const body = await c.req.json()
	const parsed = createOrderSchema.safeParse(body)
	if (!parsed.success) {
		return c.json({ error: 'Invalid request', details: parsed.error.issues }, 400)
	}

	const { ticketTypeId, quantity, idempotencyKey } = parsed.data

	// 冪等性チェック
	if (idempotencyKey) {
		const existingOrder = await db.query.orders.findFirst({
			where: eq(orders.idempotencyKey, idempotencyKey),
		})
		if (existingOrder) {
			// 既存の注文がある場合、その情報を返す
			if (existingOrder.stripeSessionId) {
				const session = await stripe.checkout.sessions.retrieve(existingOrder.stripeSessionId)
				return c.json({ checkoutUrl: session.url })
			}
			return c.json({ error: 'Order already exists' }, 409)
		}
	}

	// チケット種別と在庫チェック
	const ticketType = await db.query.ticketTypes.findFirst({
		where: eq(ticketTypes.id, ticketTypeId),
	})

	if (!ticketType) {
		return c.json({ error: 'Ticket type not found' }, 404)
	}

	const remaining = ticketType.quantity - ticketType.soldCount
	if (remaining < quantity) {
		return c.json({ error: 'Not enough tickets available', remaining }, 400)
	}

	// イベント取得
	const event = await db.query.events.findFirst({
		where: eq(events.id, ticketType.eventId),
	})

	if (!event) {
		return c.json({ error: 'Event not found' }, 404)
	}

	// ユーザー取得
	const user = await db.query.users.findFirst({
		where: eq(users.id, firebaseUser.uid),
	})

	if (!user) {
		return c.json({ error: 'User not found' }, 404)
	}

	const totalAmount = ticketType.price * quantity

	// 注文作成
	const orderId = crypto.randomUUID()
	await db.insert(orders).values({
		id: orderId,
		userId: firebaseUser.uid,
		ticketTypeId,
		quantity,
		totalAmount,
		status: 'pending',
		idempotencyKey,
	})

	// Stripe Checkout Session作成
	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		line_items: [
			{
				price_data: {
					currency: 'jpy',
					product_data: {
						name: `${event.title} - ${ticketType.name}`,
						description: ticketType.description || undefined,
					},
					unit_amount: ticketType.price,
				},
				quantity,
			},
		],
		mode: 'payment',
		success_url: `${c.env.CORS_ORIGIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${c.env.CORS_ORIGIN}/checkout/cancel`,
		customer_email: user.email,
		metadata: {
			orderId,
		},
	})

	// Session IDを保存
	await db
		.update(orders)
		.set({ stripeSessionId: session.id, updatedAt: new Date() })
		.where(eq(orders.id, orderId))

	return c.json({ checkoutUrl: session.url })
})

// GET /orders - 購入履歴
ordersRoutes.get('/', authMiddleware, async (c) => {
	const db = getDb(c)
	const firebaseUser = c.get('firebaseUser')

	const orderList = await db.query.orders.findMany({
		where: eq(orders.userId, firebaseUser.uid),
		orderBy: (orders, { desc }) => [desc(orders.createdAt)],
	})

	// 各注文に紐づくイベント情報を取得
	const ordersWithDetails = await Promise.all(
		orderList.map(async (order) => {
			const ticketType = await db.query.ticketTypes.findFirst({
				where: eq(ticketTypes.id, order.ticketTypeId),
			})
			if (!ticketType) return { ...order, eventTitle: '', ticketTypeName: '' }

			const event = await db.query.events.findFirst({
				where: eq(events.id, ticketType.eventId),
			})

			return {
				...order,
				eventTitle: event?.title || '',
				ticketTypeName: ticketType.name,
			}
		}),
	)

	return c.json(ordersWithDetails)
})
