import { describe, it, expect } from 'vitest'
import { mockDb } from '../test/setup'
import {
	testRequest,
	createAuthHeader,
	mockUser,
	mockEvent,
	mockTicketType,
	mockOrder,
} from '../test/helpers'

describe('Orders Routes', () => {
	describe('POST /orders', () => {
		it('should create order and return checkout URL', async () => {
			mockDb.query.ticketTypes.findFirst.mockResolvedValue(mockTicketType)
			mockDb.query.events.findFirst.mockResolvedValue(mockEvent)
			mockDb.query.users.findFirst.mockResolvedValue(mockUser)

			const res = await testRequest('POST', '/orders', {
				headers: createAuthHeader(),
				body: {
					ticketTypeId: 'ticket-type-1',
					quantity: 2,
				},
			})
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json.checkoutUrl).toBeDefined()
			expect(json.checkoutUrl).toContain('checkout.stripe.com')
			expect(mockDb.insert).toHaveBeenCalled()
		})

		it('should return 400 for invalid request body', async () => {
			const res = await testRequest('POST', '/orders', {
				headers: createAuthHeader(),
				body: {
					ticketTypeId: 'ticket-type-1',
					quantity: 0, // Invalid: must be at least 1
				},
			})
			const json = await res.json()

			expect(res.status).toBe(400)
			expect(json.error).toBe('Invalid request')
		})

		it('should return 400 for quantity exceeding limit', async () => {
			const res = await testRequest('POST', '/orders', {
				headers: createAuthHeader(),
				body: {
					ticketTypeId: 'ticket-type-1',
					quantity: 11, // Invalid: max is 10
				},
			})
			const json = await res.json()

			expect(res.status).toBe(400)
			expect(json.error).toBe('Invalid request')
		})

		it('should return 404 when ticket type not found', async () => {
			mockDb.query.ticketTypes.findFirst.mockResolvedValue(null)

			const res = await testRequest('POST', '/orders', {
				headers: createAuthHeader(),
				body: {
					ticketTypeId: 'non-existent',
					quantity: 1,
				},
			})
			const json = await res.json()

			expect(res.status).toBe(404)
			expect(json.error).toBe('Ticket type not found')
		})

		it('should return 400 when not enough tickets available', async () => {
			mockDb.query.ticketTypes.findFirst.mockResolvedValue({
				...mockTicketType,
				quantity: 10,
				soldCount: 9, // Only 1 remaining
			})

			const res = await testRequest('POST', '/orders', {
				headers: createAuthHeader(),
				body: {
					ticketTypeId: 'ticket-type-1',
					quantity: 2, // Requesting 2 but only 1 available
				},
			})
			const json = await res.json()

			expect(res.status).toBe(400)
			expect(json.error).toBe('Not enough tickets available')
			expect(json.remaining).toBe(1)
		})

		it('should return existing order for duplicate idempotency key', async () => {
			mockDb.query.orders.findFirst.mockResolvedValue({
				...mockOrder,
				stripeSessionId: 'cs_test_existing',
			})

			const res = await testRequest('POST', '/orders', {
				headers: createAuthHeader(),
				body: {
					ticketTypeId: 'ticket-type-1',
					quantity: 2,
					idempotencyKey: 'duplicate-key',
				},
			})
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json.checkoutUrl).toBeDefined()
		})

		it('should return 404 when event not found', async () => {
			mockDb.query.ticketTypes.findFirst.mockResolvedValue(mockTicketType)
			mockDb.query.events.findFirst.mockResolvedValue(null)

			const res = await testRequest('POST', '/orders', {
				headers: createAuthHeader(),
				body: {
					ticketTypeId: 'ticket-type-1',
					quantity: 1,
				},
			})
			const json = await res.json()

			expect(res.status).toBe(404)
			expect(json.error).toBe('Event not found')
		})

		it('should return 404 when user not found', async () => {
			mockDb.query.ticketTypes.findFirst.mockResolvedValue(mockTicketType)
			mockDb.query.events.findFirst.mockResolvedValue(mockEvent)
			mockDb.query.users.findFirst.mockResolvedValue(null)

			const res = await testRequest('POST', '/orders', {
				headers: createAuthHeader(),
				body: {
					ticketTypeId: 'ticket-type-1',
					quantity: 1,
				},
			})
			const json = await res.json()

			expect(res.status).toBe(404)
			expect(json.error).toBe('User not found')
		})
	})

	describe('GET /orders', () => {
		it('should return user order history with event details', async () => {
			mockDb.query.orders.findMany.mockResolvedValue([mockOrder])
			mockDb.query.ticketTypes.findFirst.mockResolvedValue(mockTicketType)
			mockDb.query.events.findFirst.mockResolvedValue(mockEvent)

			const res = await testRequest('GET', '/orders', {
				headers: createAuthHeader(),
			})
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json).toHaveLength(1)
			expect(json[0].id).toBe('order-1')
			expect(json[0].eventTitle).toBe('Test Event')
			expect(json[0].ticketTypeName).toBe('一般')
		})

		it('should return empty array when no orders exist', async () => {
			mockDb.query.orders.findMany.mockResolvedValue([])

			const res = await testRequest('GET', '/orders', {
				headers: createAuthHeader(),
			})
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json).toEqual([])
		})
	})
})
