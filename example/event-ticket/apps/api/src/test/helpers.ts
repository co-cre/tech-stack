import { vi } from 'vitest'
import app from '../index'

// Mock environment variables
export const mockEnv: Env = {
	DB: {} as D1Database,
	CORS_ORIGIN: 'http://localhost:5173',
	FIREBASE_PROJECT_ID: 'test-project',
	FIREBASE_CLIENT_EMAIL: 'test@test.iam.gserviceaccount.com',
	FIREBASE_PRIVATE_KEY: 'test-private-key',
	STRIPE_SECRET_KEY: 'sk_test_xxx',
	STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
}

// Mock Firebase user
export const mockFirebaseUser = {
	uid: 'test-user-id',
	email: 'test@example.com',
	name: 'Test User',
}

// Mock user data
export const mockUser = {
	id: 'test-user-id',
	email: 'test@example.com',
	displayName: 'Test User',
	createdAt: new Date('2024-01-01'),
	updatedAt: new Date('2024-01-01'),
}

// Mock event data
export const mockEvent = {
	id: 'event-1',
	title: 'Test Event',
	description: 'A test event description',
	venue: 'Test Venue',
	startsAt: new Date('2024-06-01T10:00:00Z'),
	endsAt: new Date('2024-06-01T18:00:00Z'),
	imageUrl: 'https://example.com/image.jpg',
	status: 'published' as const,
	createdAt: new Date('2024-01-01'),
	updatedAt: new Date('2024-01-01'),
}

// Mock ticket type data
export const mockTicketType = {
	id: 'ticket-type-1',
	eventId: 'event-1',
	name: '一般',
	description: 'General admission',
	price: 5000,
	quantity: 100,
	soldCount: 10,
	salesStartsAt: new Date('2024-01-01'),
	salesEndsAt: new Date('2024-05-31'),
	createdAt: new Date('2024-01-01'),
	updatedAt: new Date('2024-01-01'),
}

// Mock order data
export const mockOrder = {
	id: 'order-1',
	userId: 'test-user-id',
	ticketTypeId: 'ticket-type-1',
	quantity: 2,
	totalAmount: 10000,
	status: 'paid' as const,
	stripeSessionId: 'cs_test_xxx',
	stripePaymentIntentId: 'pi_test_xxx',
	idempotencyKey: null,
	createdAt: new Date('2024-02-01'),
	updatedAt: new Date('2024-02-01'),
}

// Mock ticket data
export const mockTicket = {
	id: 'ticket-1',
	userId: 'test-user-id',
	ticketTypeId: 'ticket-type-1',
	orderId: 'order-1',
	qrToken: 'qr-token-123',
	status: 'valid' as const,
	usedAt: null,
	createdAt: new Date('2024-02-01'),
	updatedAt: new Date('2024-02-01'),
}

// Create a mock database with query methods
export function createMockDb() {
	const mockDb = {
		query: {
			users: {
				findFirst: vi.fn(),
				findMany: vi.fn(),
			},
			events: {
				findFirst: vi.fn(),
				findMany: vi.fn(),
			},
			ticketTypes: {
				findFirst: vi.fn(),
				findMany: vi.fn(),
			},
			orders: {
				findFirst: vi.fn(),
				findMany: vi.fn(),
			},
			tickets: {
				findFirst: vi.fn(),
				findMany: vi.fn(),
			},
		},
		insert: vi.fn().mockReturnValue({
			values: vi.fn().mockResolvedValue(undefined),
		}),
		update: vi.fn().mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue(undefined),
			}),
		}),
		delete: vi.fn().mockReturnValue({
			where: vi.fn().mockResolvedValue(undefined),
		}),
	}
	return mockDb
}

// Helper to make authenticated requests
export function createAuthHeader(token = 'valid-token') {
	return { Authorization: `Bearer ${token}` }
}

// Test request helper
export async function testRequest(
	method: string,
	path: string,
	options: {
		body?: unknown
		headers?: Record<string, string>
	} = {},
) {
	const requestInit: RequestInit = {
		method,
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
	}

	if (options.body) {
		requestInit.body = JSON.stringify(options.body)
	}

	return app.request(path, requestInit, mockEnv)
}
