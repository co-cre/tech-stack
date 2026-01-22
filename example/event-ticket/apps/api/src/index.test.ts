import { describe, it, expect } from 'vitest'
import { testRequest } from './test/helpers'

describe('API Root', () => {
	describe('GET /', () => {
		it('should return API welcome message', async () => {
			const res = await testRequest('GET', '/')
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json.message).toBe('Event Ticket API')
		})
	})
})
