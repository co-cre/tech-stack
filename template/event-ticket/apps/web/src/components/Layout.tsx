import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { Link, Outlet, useNavigate } from 'react-router-dom'

export function Layout() {
	const { user } = useAuth()
	const navigate = useNavigate()

	const handleLogout = async () => {
		await signOut(auth)
		navigate('/login')
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container flex h-16 items-center justify-between">
					<Link to="/" className="text-xl font-bold">
						Event Ticket
					</Link>
					<nav className="flex items-center gap-4">
						<Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
							イベント
						</Link>
						<Link to="/tickets" className="text-sm text-muted-foreground hover:text-foreground">
							マイチケット
						</Link>
						<Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground">
							購入履歴
						</Link>
						<Link to="/verify" className="text-sm text-muted-foreground hover:text-foreground">
							入場確認
						</Link>
						<span className="text-sm text-muted-foreground">{user?.email}</span>
						<Button variant="outline" size="sm" onClick={handleLogout}>
							ログアウト
						</Button>
					</nav>
				</div>
			</header>
			<main className="container py-8">
				<Outlet />
			</main>
		</div>
	)
}
