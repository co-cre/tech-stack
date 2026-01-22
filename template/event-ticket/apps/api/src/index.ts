import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRoutes } from './routes/auth'
import { eventsRoutes } from './routes/events'
import { ordersRoutes } from './routes/orders'
import { ticketsRoutes } from './routes/tickets'
import { webhooksRoutes } from './routes/webhooks'

const app = new Hono<{ Bindings: Env }>()

app.use('*', logger())
app.use(
	'*',
	cors({
		origin: (origin, c) => c.env.CORS_ORIGIN,
		credentials: true,
	}),
)

app.get('/', (c) => c.json({ message: 'Event Ticket API' }))

app.route('/auth', authRoutes)
app.route('/events', eventsRoutes)
app.route('/orders', ordersRoutes)
app.route('/tickets', ticketsRoutes)
app.route('/webhooks', webhooksRoutes)

app.onError((err, c) => {
	console.error(err)
	return c.json({ error: 'Internal Server Error' }, 500)
})

export default app
