import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { auth } from '@/lib/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isSignUp, setIsSignUp] = useState(false)
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			if (isSignUp) {
				await createUserWithEmailAndPassword(auth, email, password)
			} else {
				await signInWithEmailAndPassword(auth, email, password)
			}
			navigate('/')
		} catch (err) {
			setError(err instanceof Error ? err.message : '認証に失敗しました')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>{isSignUp ? '新規登録' : 'ログイン'}</CardTitle>
					<CardDescription>Event Ticketへようこそ</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Input
								type="email"
								placeholder="メールアドレス"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Input
								type="password"
								placeholder="パスワード"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						{error && <p className="text-sm text-destructive">{error}</p>}
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? '処理中...' : isSignUp ? '登録' : 'ログイン'}
						</Button>
						<Button
							type="button"
							variant="link"
							className="w-full"
							onClick={() => setIsSignUp(!isSignUp)}
						>
							{isSignUp ? 'アカウントをお持ちの方' : '新規登録はこちら'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
