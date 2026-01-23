import { describe, test, expect, mock, beforeEach } from 'bun:test'

// モックデータ
const mockUser = {
	id: 'test-uid',
	email: 'test@example.com',
	displayName: 'Test User',
	createdAt: new Date(),
	updatedAt: new Date(),
}

const mockEvent = {
	id: 'event-1',
	title: 'Test Event',
	description: 'Test Description',
	venue: 'Test Venue',
	startsAt: new Date('2025-01-01T10:00:00Z'),
	endsAt: new Date('2025-01-01T18:00:00Z'),
	status: 'published' as const,
	createdAt: new Date(),
	updatedAt: new Date(),
}

const mockTicketType = {
	id: 'ticket-type-1',
	eventId: 'event-1',
	name: 'General',
	description: 'General admission',
	price: 5000,
	quantity: 100,
	soldCount: 10,
	createdAt: new Date(),
	updatedAt: new Date(),
}

const mockOrder = {
	id: 'order-1',
	userId: 'test-uid',
	ticketTypeId: 'ticket-type-1',
	quantity: 2,
	totalAmount: 10000,
	status: 'pending' as const,
	stripeSessionId: 'sess_123',
	stripePaymentIntentId: null,
	idempotencyKey: null,
	createdAt: new Date(),
	updatedAt: new Date(),
}

const mockTicket = {
	id: 'ticket-1',
	userId: 'test-uid',
	ticketTypeId: 'ticket-type-1',
	orderId: 'order-1',
	qrToken: 'qr-token-123',
	status: 'valid' as const,
	usedAt: null,
	createdAt: new Date(),
	updatedAt: new Date(),
}

// モック用のDB query実装
const createMockDb = () => ({
	query: {
		users: {
			findFirst: mock(() => Promise.resolve(mockUser)),
			findMany: mock(() => Promise.resolve([mockUser])),
		},
		events: {
			findFirst: mock(() => Promise.resolve(mockEvent)),
			findMany: mock(() => Promise.resolve([mockEvent])),
		},
		ticketTypes: {
			findFirst: mock(() => Promise.resolve(mockTicketType)),
			findMany: mock(() => Promise.resolve([mockTicketType])),
		},
		orders: {
			findFirst: mock(() => Promise.resolve(mockOrder)),
			findMany: mock(() => Promise.resolve([mockOrder])),
		},
		tickets: {
			findFirst: mock(() => Promise.resolve(mockTicket)),
			findMany: mock(() => Promise.resolve([mockTicket])),
		},
	},
	insert: mock(() => ({
		values: mock(() => Promise.resolve()),
	})),
	update: mock(() => ({
		set: mock(() => ({
			where: mock(() => Promise.resolve()),
		})),
	})),
	select: mock(() => ({
		from: mock(() => ({
			where: mock(() => Promise.resolve([])),
		})),
	})),
})

let mockDb = createMockDb()

// モジュールモック
mock.module('./lib/db', () => ({
	getDb: () => mockDb,
}))

mock.module('./middleware/auth', () => ({
	authMiddleware: mock(async (c: any, next: any) => {
		c.set('firebaseUser', { uid: 'test-uid', email: 'test@example.com', name: 'Test User' })
		await next()
	}),
	optionalAuthMiddleware: mock(async (c: any, next: any) => {
		c.set('firebaseUser', { uid: 'test-uid', email: 'test@example.com', name: 'Test User' })
		await next()
	}),
}))

mock.module('./lib/stripe', () => ({
	getStripe: () => ({
		checkout: {
			sessions: {
				create: mock(() =>
					Promise.resolve({
						id: 'sess_123',
						url: 'https://checkout.stripe.com/sess_123',
					}),
				),
				retrieve: mock(() =>
					Promise.resolve({
						id: 'sess_123',
						url: 'https://checkout.stripe.com/sess_123',
					}),
				),
			},
		},
		webhooks: {
			constructEventAsync: mock(() =>
				Promise.resolve({
					type: 'checkout.session.completed',
					data: {
						object: {
							metadata: { orderId: 'order-1' },
							payment_intent: 'pi_123',
						},
					},
				}),
			),
		},
	}),
}))

// モックの後にappをインポート
const { default: app } = await import('./index')

describe('Event Ticket API', () => {
	beforeEach(() => {
		mockDb = createMockDb()
	})

	describe('GET /', () => {
		test('returns API message', async () => {
			const res = await app.request('/', undefined, {
				DB: {},
				CORS_ORIGIN: 'http://localhost:5173',
				FIREBASE_PROJECT_ID: 'test-project',
				STRIPE_SECRET_KEY: 'sk_test_xxx',
				STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
			})

			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body).toEqual({ message: 'Event Ticket API' })
		})
	})

	describe('Auth Routes', () => {
		const env = {
			DB: {},
			CORS_ORIGIN: 'http://localhost:5173',
			FIREBASE_PROJECT_ID: 'test-project',
			STRIPE_SECRET_KEY: 'sk_test_xxx',
			STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
		}

		test('POST /auth/sync - creates/updates user', async () => {
			const res = await app.request(
				'/auth/sync',
				{
					method: 'POST',
					headers: {
						Authorization: 'Bearer test-token',
					},
				},
				env,
			)

			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.user).toBeDefined()
		})

		test('GET /auth/me - returns current user', async () => {
			const res = await app.request(
				'/auth/me',
				{
					method: 'GET',
					headers: {
						Authorization: 'Bearer test-token',
					},
				},
				env,
			)

			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.user).toBeDefined()
			expect(body.user.email).toBe('test@example.com')
		})
	})

	describe('Events Routes (public)', () => {
		const env = {
			DB: {},
			CORS_ORIGIN: 'http://localhost:5173',
			FIREBASE_PROJECT_ID: 'test-project',
			STRIPE_SECRET_KEY: 'sk_test_xxx',
			STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
		}

		test('GET /events - returns event list', async () => {
			const res = await app.request('/events', undefined, env)

			expect(res.status).toBe(200)
			const body = await res.json()
			expect(Array.isArray(body)).toBe(true)
			expect(body.length).toBeGreaterThan(0)
		})

		test('GET /events/:id - returns event detail with ticket types', async () => {
			const res = await app.request('/events/event-1', undefined, env)

			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.id).toBe('event-1')
			expect(body.title).toBe('Test Event')
			expect(body.ticketTypes).toBeDefined()
		})
	})

	describe('Orders Routes', () => {
		const env = {
			DB: {},
			CORS_ORIGIN: 'http://localhost:5173',
			FIREBASE_PROJECT_ID: 'test-project',
			STRIPE_SECRET_KEY: 'sk_test_xxx',
			STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
		}

		test('POST /orders - creates order and returns checkout URL', async () => {
			const res = await app.request(
				'/orders',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer test-token',
					},
					body: JSON.stringify({
						ticketTypeId: 'ticket-type-1',
						quantity: 2,
					}),
				},
				env,
			)

			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.checkoutUrl).toBeDefined()
		})

		test('GET /orders - returns order history', async () => {
			const res = await app.request(
				'/orders',
				{
					method: 'GET',
					headers: {
						Authorization: 'Bearer test-token',
					},
				},
				env,
			)

			expect(res.status).toBe(200)
			const body = await res.json()
			expect(Array.isArray(body)).toBe(true)
		})
	})

	describe('Tickets Routes', () => {
		const env = {
			DB: {},
			CORS_ORIGIN: 'http://localhost:5173',
			FIREBASE_PROJECT_ID: 'test-project',
			STRIPE_SECRET_KEY: 'sk_test_xxx',
			STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
		}

		test('GET /tickets - returns ticket list', async () => {
			const res = await app.request(
				'/tickets',
				{
					method: 'GET',
					headers: {
						Authorization: 'Bearer test-token',
					},
				},
				env,
			)

			expect(res.status).toBe(200)
			const body = await res.json()
			expect(Array.isArray(body)).toBe(true)
		})

		test('GET /tickets/:id - returns ticket detail', async () => {
			const res = await app.request(
				'/tickets/ticket-1',
				{
					method: 'GET',
					headers: {
						Authorization: 'Bearer test-token',
					},
				},
				env,
			)

			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.id).toBe('ticket-1')
			expect(body.qrToken).toBeDefined()
		})

		test('POST /tickets/verify - verifies ticket', async () => {
			const res = await app.request(
				'/tickets/verify',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer test-token',
					},
					body: JSON.stringify({
						qrToken: 'qr-token-123',
					}),
				},
				env,
			)

			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.success).toBe(true)
			expect(body.message).toBe('入場を確認しました')
		})
	})

	describe('Webhooks Routes', () => {
		const env = {
			DB: {},
			CORS_ORIGIN: 'http://localhost:5173',
			FIREBASE_PROJECT_ID: 'test-project',
			STRIPE_SECRET_KEY: 'sk_test_xxx',
			STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
		}

		test('POST /webhooks/stripe - processes checkout.session.completed', async () => {
			const res = await app.request(
				'/webhooks/stripe',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'stripe-signature': 'test-signature',
					},
					body: JSON.stringify({}),
				},
				env,
			)

			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.received).toBe(true)
		})
	})
})
