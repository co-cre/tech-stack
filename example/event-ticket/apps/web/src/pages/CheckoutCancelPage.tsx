import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'

export function CheckoutCancelPage() {
	return (
		<div className="flex min-h-[50vh] items-center justify-center">
			<Card className="w-full max-w-md text-center">
				<CardHeader>
					<CardTitle className="text-destructive">購入キャンセル</CardTitle>
					<CardDescription>チケットの購入がキャンセルされました</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-muted-foreground">
						購入を再開する場合は、イベントページからお手続きください。
					</p>
					<Link to="/">
						<Button>イベント一覧へ</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	)
}
