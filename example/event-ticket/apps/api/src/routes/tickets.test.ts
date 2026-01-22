import { describe, it, expect } from 'vitest'
import { mockDb } from '../test/setup'
import {
	testRequest,
	createAuthHeader,
	mockEvent,
	mockTicketType,
	mockTicket,
} from '../test/helpers'

describe('Tickets Routes', () => {
	describe('GET /tickets', () => {
		it('should return user tickets with event details', async () => {
			mockDb.query.tickets.findMany.mockResolvedValue([mockTicket])
			mockDb.query.ticketTypes.findFirst.mockResolvedValue(mockTicketType)
			mockDb.query.events.findFirst.mockResolvedValue(mockEvent)

			const res = await testRequest('GET', '/tickets', {
				headers: createAuthHeader(),
			})
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json).toHaveLength(1)
			expect(json[0].id).toBe('ticket-1')
			expect(json[0].status).toBe('valid')
			expect(json[0].eventTitle).toBe('Test Event')
			expect(json[0].ticketTypeName).toBe('一般')
		})

		it('should return empty array when no tickets exist', async () => {
			mockDb.query.tickets.findMany.mockResolvedValue([])

			const res = await testRequest('GET', '/tickets', {
				headers: createAuthHeader(),
			})
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json).toEqual([])
		})

		it('should filter out tickets with missing ticket types', async () => {
			mockDb.query.tickets.findMany.mockResolvedValue([mockTicket])
			mockDb.query.ticketTypes.findFirst.mockResolvedValue(null)

			const res = await testRequest('GET', '/tickets', {
				headers: createAuthHeader(),
			})
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json).toEqual([])
		})
	})

	describe('GET /tickets/:id', () => {
		it('should return ticket details with QR token', async () => {
			mockDb.query.tickets.findFirst.mockResolvedValue(mockTicket)
			mockDb.query.ticketTypes.findFirst.mockResolvedValue(mockTicketType)
			mockDb.query.events.findFirst.mockResolvedValue(mockEvent)

			const res = await testRequest('GET', '/tickets/ticket-1', {
				headers: createAuthHeader(),
			})
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json.id).toBe('ticket-1')
			expect(json.qrToken).toBe('qr-token-123')
			expect(json.status).toBe('valid')
			expect(json.eventTitle).toBe('Test Event')
			expect(json.eventVenue).toBe('Test Venue')
			expect(json.ticketTypeName).toBe('一般')
		})

		it('should return 404 when ticket not found', async () => {
			mockDb.query.tickets.findFirst.mockResolvedValue(null)

			const res = await testRequest('GET', '/tickets/non-existent', {
				headers: createAuthHeader(),
			})
			const json = await res.json()

			expect(res.status).toBe(404)
			expect(json.error).toBe('Ticket not found')
		})

		it('should return 404 when ticket type not found', async () => {
			mockDb.query.tickets.findFirst.mockResolvedValue(mockTicket)
			mockDb.query.ticketTypes.findFirst.mockResolvedValue(null)

			const res = await testRequest('GET', '/tickets/ticket-1', {
				headers: createAuthHeader(),
			})
			const json = await res.json()

			expect(res.status).toBe(404)
			expect(json.error).toBe('Ticket type not found')
		})
	})

	describe('POST /tickets/verify', () => {
		it('should verify valid ticket and mark as used', async () => {
			mockDb.query.tickets.findFirst.mockResolvedValue(mockTicket)
			mockDb.query.ticketTypes.findFirst.mockResolvedValue(mockTicketType)
			mockDb.query.events.findFirst.mockResolvedValue(mockEvent)

			const res = await testRequest('POST', '/tickets/verify', {
				headers: createAuthHeader(),
				body: { qrToken: 'qr-token-123' },
			})
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json.success).toBe(true)
			expect(json.message).toBe('入場を確認しました')
			expect(json.ticket.eventTitle).toBe('Test Event')
			expect(json.ticket.ticketTypeName).toBe('一般')
			expect(mockDb.update).toHaveBeenCalled()
		})

		it('should return 400 for invalid request body', async () => {
			const res = await testRequest('POST', '/tickets/verify', {
				headers: createAuthHeader(),
				body: {}, // Missing qrToken
			})
			const json = await res.json()

			expect(res.status).toBe(400)
			expect(json.error).toBe('Invalid request')
		})

		it('should return failure when ticket not found', async () => {
			mockDb.query.tickets.findFirst.mockResolvedValue(null)

			const res = await testRequest('POST', '/tickets/verify', {
				headers: createAuthHeader(),
				body: { qrToken: 'invalid-token' },
			})
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json.success).toBe(false)
			expect(json.message).toBe('チケットが見つかりません')
		})

		it('should return failure when ticket already used', async () => {
			mockDb.query.tickets.findFirst.mockResolvedValue({
				...mockTicket,
				status: 'used',
			})

			const res = await testRequest('POST', '/tickets/verify', {
				headers: createAuthHeader(),
				body: { qrToken: 'qr-token-123' },
			})
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json.success).toBe(false)
			expect(json.message).toBe('既に使用済みのチケットです')
		})

		it('should return failure when ticket is cancelled', async () => {
			mockDb.query.tickets.findFirst.mockResolvedValue({
				...mockTicket,
				status: 'cancelled',
			})

			const res = await testRequest('POST', '/tickets/verify', {
				headers: createAuthHeader(),
				body: { qrToken: 'qr-token-123' },
			})
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json.success).toBe(false)
			expect(json.message).toBe('キャンセルされたチケットです')
		})
	})
})
