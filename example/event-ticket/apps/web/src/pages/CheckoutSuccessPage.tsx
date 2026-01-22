import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'

export function CheckoutSuccessPage() {
	return (
		<div className="flex min-h-[50vh] items-center justify-center">
			<Card className="w-full max-w-md text-center">
				<CardHeader>
					<CardTitle className="text-green-600">購入完了</CardTitle>
					<CardDescription>チケットの購入が完了しました</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-muted-foreground">チケットはマイチケットページで確認できます。</p>
					<div className="flex justify-center gap-4">
						<Link to="/tickets">
							<Button>マイチケットを見る</Button>
						</Link>
						<Link to="/">
							<Button variant="outline">イベント一覧へ</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
