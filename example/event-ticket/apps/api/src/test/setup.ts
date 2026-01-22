import { vi, beforeEach } from 'vitest'
import { mockFirebaseUser, createMockDb } from './helpers'

// Create shared mock database instance
export const mockDb = createMockDb()

// Mock the db module
vi.mock('../lib/db', () => ({
	getDb: vi.fn(() => mockDb),
}))

// Mock the auth middleware to bypass Firebase verification
vi.mock('../middleware/auth', () => ({
	authMiddleware: vi.fn((c, next) => {
		c.set('firebaseUser', mockFirebaseUser)
		return next()
	}),
	optionalAuthMiddleware: vi.fn((c, next) => {
		const authHeader = c.req.header('Authorization')
		if (authHeader?.startsWith('Bearer ')) {
			c.set('firebaseUser', mockFirebaseUser)
		}
		return next()
	}),
}))

// Mock Stripe
vi.mock('../lib/stripe', () => ({
	getStripe: vi.fn(() => ({
		checkout: {
			sessions: {
				create: vi.fn().mockResolvedValue({
					id: 'cs_test_session',
					url: 'https://checkout.stripe.com/pay/cs_test_session',
				}),
				retrieve: vi.fn().mockResolvedValue({
					id: 'cs_test_session',
					url: 'https://checkout.stripe.com/pay/cs_test_session',
				}),
			},
		},
		webhooks: {
			constructEventAsync: vi.fn(),
		},
	})),
}))

// Reset all mocks before each test
beforeEach(() => {
	vi.clearAllMocks()

	// Reset mock implementations to default
	mockDb.query.users.findFirst.mockReset()
	mockDb.query.users.findMany.mockReset()
	mockDb.query.events.findFirst.mockReset()
	mockDb.query.events.findMany.mockReset()
	mockDb.query.ticketTypes.findFirst.mockReset()
	mockDb.query.ticketTypes.findMany.mockReset()
	mockDb.query.orders.findFirst.mockReset()
	mockDb.query.orders.findMany.mockReset()
	mockDb.query.tickets.findFirst.mockReset()
	mockDb.query.tickets.findMany.mockReset()
})
