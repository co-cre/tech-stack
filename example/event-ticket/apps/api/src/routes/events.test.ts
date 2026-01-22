import { describe, it, expect } from 'vitest'
import { mockDb } from '../test/setup'
import { testRequest, mockEvent, mockTicketType } from '../test/helpers'

describe('Events Routes', () => {
	describe('GET /events', () => {
		it('should return list of published events', async () => {
			const events = [
				mockEvent,
				{ ...mockEvent, id: 'event-2', title: 'Second Event' },
			]
			mockDb.query.events.findMany.mockResolvedValue(events)

			const res = await testRequest('GET', '/events')
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json).toHaveLength(2)
			expect(json[0].title).toBe('Test Event')
			expect(json[1].title).toBe('Second Event')
		})

		it('should return empty array when no events exist', async () => {
			mockDb.query.events.findMany.mockResolvedValue([])

			const res = await testRequest('GET', '/events')
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json).toEqual([])
		})
	})

	describe('GET /events/:id', () => {
		it('should return event with ticket types', async () => {
			mockDb.query.events.findFirst.mockResolvedValue(mockEvent)
			mockDb.query.ticketTypes.findMany.mockResolvedValue([
				mockTicketType,
				{ ...mockTicketType, id: 'ticket-type-2', name: 'VIP', price: 10000 },
			])

			const res = await testRequest('GET', '/events/event-1')
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json.id).toBe('event-1')
			expect(json.title).toBe('Test Event')
			expect(json.ticketTypes).toHaveLength(2)
			expect(json.ticketTypes[0].name).toBe('一般')
			expect(json.ticketTypes[1].name).toBe('VIP')
		})

		it('should return 404 when event not found', async () => {
			mockDb.query.events.findFirst.mockResolvedValue(null)

			const res = await testRequest('GET', '/events/non-existent')
			const json = await res.json()

			expect(res.status).toBe(404)
			expect(json.error).toBe('Event not found')
		})
	})
})
