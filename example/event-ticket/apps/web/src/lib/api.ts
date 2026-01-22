import { auth } from './firebase'

async function getAuthHeaders(): Promise<HeadersInit> {
	const user = auth.currentUser
	if (!user) return {}
	const token = await user.getIdToken()
	return { Authorization: `Bearer ${token}` }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
	const authHeaders = await getAuthHeaders()
	const res = await fetch(`/api${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...authHeaders,
			...options.headers,
		},
	})
	if (!res.ok) {
		const error = await res.json().catch(() => ({ error: 'Unknown error' }))
		throw new Error(error.error || 'API Error')
	}
	return res.json()
}
