import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

type TicketDetail = {
	id: string
	qrToken: string
	status: 'valid' | 'used' | 'cancelled'
	eventTitle: string
	eventVenue: string
	eventStartsAt: string
	ticketTypeName: string
	usedAt: string | null
}

export function TicketDetailPage() {
	const { id } = useParams<{ id: string }>()
	const [ticket, setTicket] = useState<TicketDetail | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!id) return
		apiFetch<TicketDetail>(`/tickets/${id}`)
			.then(setTicket)
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [id])

	if (loading) {
		return <div className="text-muted-foreground">読み込み中...</div>
	}

	if (!ticket) {
		return <div className="text-muted-foreground">チケットが見つかりません</div>
	}

	const statusLabels = {
		valid: '有効',
		used: '使用済み',
		cancelled: 'キャンセル',
	}

	const statusColors = {
		valid: 'bg-green-100 text-green-800',
		used: 'bg-gray-100 text-gray-800',
		cancelled: 'bg-red-100 text-red-800',
	}

	return (
		<div className="mx-auto max-w-md">
			<Card>
				<CardHeader className="text-center">
					<CardTitle>{ticket.eventTitle}</CardTitle>
					<CardDescription>{ticket.ticketTypeName}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex justify-center">
						{ticket.status === 'valid' ? (
							<QRCodeSVG value={ticket.qrToken} size={200} level="H" />
						) : (
							<div className="flex h-[200px] w-[200px] items-center justify-center bg-muted">
								<span className="text-muted-foreground">QRコード無効</span>
							</div>
						)}
					</div>

					<div className="flex justify-center">
						<span
							className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[ticket.status]}`}
						>
							{statusLabels[ticket.status]}
						</span>
					</div>

					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">会場</span>
							<span>{ticket.eventVenue}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">開催日時</span>
							<span>{new Date(ticket.eventStartsAt).toLocaleString('ja-JP')}</span>
						</div>
						{ticket.usedAt && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">使用日時</span>
								<span>{new Date(ticket.usedAt).toLocaleString('ja-JP')}</span>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
