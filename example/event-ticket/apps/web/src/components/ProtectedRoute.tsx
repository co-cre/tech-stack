import { useAuth } from '@/lib/auth'
import { Navigate, Outlet } from 'react-router-dom'

export function ProtectedRoute() {
	const { user, loading } = useAuth()

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-muted-foreground">読み込み中...</div>
			</div>
		)
	}

	if (!user) {
		return <Navigate to="/login" replace />
	}

	return <Outlet />
}
