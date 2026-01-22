import { describe, expect, test } from 'bun:test'
import app from './index'

describe('Event Ticket API', () => {
	test('GET / returns API message', async () => {
		const res = await app.request('/', {}, { CORS_ORIGIN: '*' })

		expect(res.status).toBe(200)

		const json = await res.json()
		expect(json).toEqual({ message: 'Event Ticket API' })
	})
})
