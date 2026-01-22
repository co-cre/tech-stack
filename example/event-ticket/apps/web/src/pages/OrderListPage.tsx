import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { useEffect, useState } from 'react'

type Order = {
	id: string
	status: 'pending' | 'paid' | 'cancelled' | 'refunded'
	totalAmount: number
	quantity: number
	eventTitle: string
	ticketTypeName: string
	createdAt: string
}

export function OrderListPage() {
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		apiFetch<Order[]>('/orders')
			.then(setOrders)
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [])

	if (loading) {
		return <div className="text-muted-foreground">読み込み中...</div>
	}

	if (orders.length === 0) {
		return (
			<div>
				<h1 className="mb-6 text-3xl font-bold">購入履歴</h1>
				<p className="text-muted-foreground">購入履歴がありません</p>
			</div>
		)
	}

	const statusLabels = {
		pending: '処理中',
		paid: '支払済',
		cancelled: 'キャンセル',
		refunded: '返金済',
	}

	const statusColors = {
		pending: 'text-yellow-600',
		paid: 'text-green-600',
		cancelled: 'text-muted-foreground',
		refunded: 'text-blue-600',
	}

	return (
		<div>
			<h1 className="mb-6 text-3xl font-bold">購入履歴</h1>
			<div className="space-y-4">
				{orders.map((order) => (
					<Card key={order.id}>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>{order.eventTitle}</span>
								<span className={statusColors[order.status]}>{statusLabels[order.status]}</span>
							</CardTitle>
							<CardDescription>{order.ticketTypeName}</CardDescription>
						</CardHeader>
						<CardContent className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								{new Date(order.createdAt).toLocaleString('ja-JP')}
							</span>
							<span className="font-medium">
								¥{order.totalAmount.toLocaleString()} × {order.quantity}枚
							</span>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
