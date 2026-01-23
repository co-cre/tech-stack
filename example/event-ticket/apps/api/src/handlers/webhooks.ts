import { orders, ticketTypes, tickets } from 'db/schema'
import { eq } from 'drizzle-orm'
import type { Context } from 'hono'
import type Stripe from 'stripe'
import { getDb } from '../lib/db'
import { getStripe } from '../lib/stripe'

export const stripeWebhook = async (c: Context<{ Bindings: Env }>) => {
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

		const order = await db.query.orders.findFirst({
			where: eq(orders.id, orderId),
		})

		if (!order) {
			console.error('Order not found:', orderId)
			return c.json({ error: 'Order not found' }, 404)
		}

		if (order.status === 'paid') {
			return c.json({ received: true })
		}

		await db
			.update(orders)
			.set({
				status: 'paid',
				stripePaymentIntentId: session.payment_intent as string,
				updatedAt: new Date(),
			})
			.where(eq(orders.id, orderId))

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
}
