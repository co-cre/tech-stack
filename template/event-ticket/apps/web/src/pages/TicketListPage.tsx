import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type Ticket = {
	id: string
	status: 'valid' | 'used' | 'cancelled'
	eventTitle: string
	ticketTypeName: string
	eventStartsAt: string
}

export function TicketListPage() {
	const [tickets, setTickets] = useState<Ticket[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		apiFetch<Ticket[]>('/tickets')
			.then(setTickets)
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [])

	if (loading) {
		return <div className="text-muted-foreground">読み込み中...</div>
	}

	if (tickets.length === 0) {
		return (
			<div>
				<h1 className="mb-6 text-3xl font-bold">マイチケット</h1>
				<p className="text-muted-foreground">チケットがありません</p>
			</div>
		)
	}

	const statusLabels = {
		valid: '有効',
		used: '使用済み',
		cancelled: 'キャンセル',
	}

	const statusColors = {
		valid: 'text-green-600',
		used: 'text-muted-foreground',
		cancelled: 'text-destructive',
	}

	return (
		<div>
			<h1 className="mb-6 text-3xl font-bold">マイチケット</h1>
			<div className="grid gap-4 md:grid-cols-2">
				{tickets.map((ticket) => (
					<Link key={ticket.id} to={`/tickets/${ticket.id}`}>
						<Card className="transition-shadow hover:shadow-lg">
							<CardHeader>
								<CardTitle>{ticket.eventTitle}</CardTitle>
								<CardDescription>{ticket.ticketTypeName}</CardDescription>
							</CardHeader>
							<CardContent className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									{new Date(ticket.eventStartsAt).toLocaleDateString('ja-JP')}
								</span>
								<span className={`text-sm font-medium ${statusColors[ticket.status]}`}>
									{statusLabels[ticket.status]}
								</span>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	)
}
