import { describe, it, expect } from 'vitest'
import { mockDb } from '../test/setup'
import { testRequest, createAuthHeader, mockUser } from '../test/helpers'

describe('Auth Routes', () => {
	describe('POST /auth/sync', () => {
		it('should create new user when not exists', async () => {
			mockDb.query.users.findFirst
				.mockResolvedValueOnce(null) // First call: check if user exists
				.mockResolvedValueOnce(mockUser) // Second call: return created user

			const res = await testRequest('POST', '/auth/sync', {
				headers: createAuthHeader(),
			})
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json.user).toBeDefined()
			expect(json.user.id).toBe('test-user-id')
			expect(json.user.email).toBe('test@example.com')
			expect(mockDb.insert).toHaveBeenCalled()
		})

		it('should update existing user', async () => {
			mockDb.query.users.findFirst
				.mockResolvedValueOnce(mockUser) // User exists
				.mockResolvedValueOnce({ ...mockUser, displayName: 'Updated Name' }) // After update

			const res = await testRequest('POST', '/auth/sync', {
				headers: createAuthHeader(),
			})
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json.user).toBeDefined()
			expect(mockDb.update).toHaveBeenCalled()
		})
	})

	describe('GET /auth/me', () => {
		it('should return current user', async () => {
			mockDb.query.users.findFirst.mockResolvedValue(mockUser)

			const res = await testRequest('GET', '/auth/me', {
				headers: createAuthHeader(),
			})
			const json = await res.json()

			expect(res.status).toBe(200)
			expect(json.user).toBeDefined()
			expect(json.user.id).toBe('test-user-id')
			expect(json.user.email).toBe('test@example.com')
			expect(json.user.displayName).toBe('Test User')
		})

		it('should return 404 when user not found in database', async () => {
			mockDb.query.users.findFirst.mockResolvedValue(null)

			const res = await testRequest('GET', '/auth/me', {
				headers: createAuthHeader(),
			})
			const json = await res.json()

			expect(res.status).toBe(404)
			expect(json.error).toBe('User not found')
		})
	})
})
