import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import * as handlers from './handlers'
import { authMiddleware } from './middleware/auth'

const app = new Hono<{ Bindings: Env }>()

app.use('*', logger())
app.use(
	'*',
	cors({
		origin: (origin, c) => c.env.CORS_ORIGIN,
		credentials: true,
	}),
)

// Public
app.get('/', (c) => c.json({ message: 'Event Ticket API' }))
app.get('/events', handlers.listEvents)
app.get('/events/:id', handlers.getEvent)

// Auth required
app.post('/auth/sync', authMiddleware, handlers.syncUser)
app.get('/auth/me', authMiddleware, handlers.getMe)
app.post('/orders', authMiddleware, handlers.createOrder)
app.get('/orders', authMiddleware, handlers.listOrders)
app.get('/tickets', authMiddleware, handlers.listTickets)
app.get('/tickets/:id', authMiddleware, handlers.getTicket)
app.post('/tickets/verify', authMiddleware, handlers.verifyTicket)

// Webhook
app.post('/webhooks/stripe', handlers.stripeWebhook)

app.onError((err, c) => {
	console.error(err)
	return c.json({ error: 'Internal Server Error' }, 500)
})

export default app
