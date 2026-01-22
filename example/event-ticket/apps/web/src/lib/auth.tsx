import { type User, onAuthStateChanged } from 'firebase/auth'
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { auth } from './firebase'

type AuthContextType = {
	user: User | null
	loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setUser(user)
			setLoading(false)
			if (user) {
				// ユーザー同期
				const token = await user.getIdToken()
				await fetch('/api/auth/sync', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				})
			}
		})
		return unsubscribe
	}, [])

	return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
	return useContext(AuthContext)
}
