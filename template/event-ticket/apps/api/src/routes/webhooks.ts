import { orders, ticketTypes, tickets } from 'db/schema'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import type Stripe from 'stripe'
import { getDb } from '../lib/db'
import { getStripe } from '../lib/stripe'

export const webhooksRoutes = new Hono<{ Bindings: Env }>()

// POST /webhooks/stripe - Stripe Webhook
webhooksRoutes.post('/stripe', async (c) => {
	const stripe = getStripe(c.env.STRIPE_SECRET_KEY)
	const db = getDb(c)

	const signature = c.req.header('stripe-signature')
	if (!signature) {
		return c.json({ error: 'Missing signature' }, 400)
	}

	const body = await c.req.text()

	let event: Stripe.Event
	try {
		event = await stripe.webhooks.constructEventAsync(body, signature, c.env.STRIPE_WEBHOOK_SECRET)
	} catch (err) {
		console.error('Webhook signature verification failed:', err)
		return c.json({ error: 'Invalid signature' }, 400)
	}

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object as Stripe.Checkout.Session

		const orderId = session.metadata?.orderId
		if (!orderId) {
			console.error('Missing orderId in session metadata')
			return c.json({ error: 'Missing orderId' }, 400)
		}

		// 注文取得
		const order = await db.query.orders.findFirst({
			where: eq(orders.id, orderId),
		})

		if (!order) {
			console.error('Order not found:', orderId)
			return c.json({ error: 'Order not found' }, 404)
		}

		// 既にpaidなら処理済み
		if (order.status === 'paid') {
			return c.json({ received: true })
		}

		// 注文をpaidに更新
		await db
			.update(orders)
			.set({
				status: 'paid',
				stripePaymentIntentId: session.payment_intent as string,
				updatedAt: new Date(),
			})
			.where(eq(orders.id, orderId))

		// チケット種別の販売数を更新
		await db
			.update(ticketTypes)
			.set({
				soldCount:
					order.quantity +
					(await db.query.ticketTypes
						.findFirst({
							where: eq(ticketTypes.id, order.ticketTypeId),
						})
						.then((t) => t?.soldCount || 0)),
				updatedAt: new Date(),
			})
			.where(eq(ticketTypes.id, order.ticketTypeId))

		// チケット発行
		const ticketInserts = []
		for (let i = 0; i < order.quantity; i++) {
			ticketInserts.push({
				userId: order.userId,
				ticketTypeId: order.ticketTypeId,
				orderId: order.id,
			})
		}

		await db.insert(tickets).values(ticketInserts)

		console.log(`Order ${orderId} completed, ${order.quantity} tickets issued`)
	}

	return c.json({ received: true })
})
