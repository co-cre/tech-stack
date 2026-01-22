import { describe, expect, it } from 'bun:test'
import app from './index'

describe('API Root', () => {
	it('GET / should return welcome message', async () => {
		const res = await app.request('/', {}, { CORS_ORIGIN: 'http://localhost:3000' })

		expect(res.status).toBe(200)

		const json = await res.json()
		expect(json).toEqual({ message: 'Event Ticket API' })
	})
})
