import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

type TicketType = {
	id: string
	name: string
	description: string | null
	price: number
	quantity: number
	soldCount: number
}

type EventDetail = {
	id: string
	title: string
	description: string | null
	venue: string
	startsAt: string
	endsAt: string
	imageUrl: string | null
	ticketTypes: TicketType[]
}

export function EventDetailPage() {
	const { id } = useParams<{ id: string }>()
	const [event, setEvent] = useState<EventDetail | null>(null)
	const [selectedType, setSelectedType] = useState<string | null>(null)
	const [quantity, setQuantity] = useState(1)
	const [loading, setLoading] = useState(true)
	const [purchasing, setPurchasing] = useState(false)

	useEffect(() => {
		if (!id) return
		apiFetch<EventDetail>(`/events/${id}`)
			.then(setEvent)
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [id])

	const handlePurchase = async () => {
		if (!selectedType) return
		setPurchasing(true)
		try {
			const { checkoutUrl } = await apiFetch<{ checkoutUrl: string }>('/orders', {
				method: 'POST',
				body: JSON.stringify({
					ticketTypeId: selectedType,
					quantity,
				}),
			})
			window.location.href = checkoutUrl
		} catch (err) {
			console.error(err)
			alert('購入に失敗しました')
		} finally {
			setPurchasing(false)
		}
	}

	if (loading) {
		return <div className="text-muted-foreground">読み込み中...</div>
	}

	if (!event) {
		return <div className="text-muted-foreground">イベントが見つかりません</div>
	}

	return (
		<div className="mx-auto max-w-3xl">
			{event.imageUrl && (
				<img
					src={event.imageUrl}
					alt={event.title}
					className="mb-6 h-64 w-full rounded-lg object-cover"
				/>
			)}
			<h1 className="mb-2 text-3xl font-bold">{event.title}</h1>
			<p className="mb-4 text-muted-foreground">{event.venue}</p>
			<p className="mb-2 text-sm">開始: {new Date(event.startsAt).toLocaleString('ja-JP')}</p>
			<p className="mb-6 text-sm">終了: {new Date(event.endsAt).toLocaleString('ja-JP')}</p>
			{event.description && <p className="mb-8">{event.description}</p>}

			<h2 className="mb-4 text-xl font-semibold">チケット選択</h2>
			<div className="space-y-4">
				{event.ticketTypes.map((type) => {
					const remaining = type.quantity - type.soldCount
					const isSoldOut = remaining <= 0
					return (
						<Card
							key={type.id}
							className={`cursor-pointer transition-shadow ${selectedType === type.id ? 'ring-2 ring-primary' : ''} ${isSoldOut ? 'opacity-50' : ''}`}
							onClick={() => !isSoldOut && setSelectedType(type.id)}
						>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>{type.name}</span>
									<span>¥{type.price.toLocaleString()}</span>
								</CardTitle>
								{type.description && <CardDescription>{type.description}</CardDescription>}
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									{isSoldOut ? '売り切れ' : `残り ${remaining} 枚`}
								</p>
							</CardContent>
						</Card>
					)
				})}
			</div>

			{selectedType && (
				<div className="mt-6 flex items-center gap-4">
					<label htmlFor="quantity" className="text-sm font-medium">
						枚数:
					</label>
					<select
						id="quantity"
						value={quantity}
						onChange={(e) => setQuantity(Number(e.target.value))}
						className="rounded-md border px-3 py-2"
					>
						{[1, 2, 3, 4, 5].map((n) => (
							<option key={n} value={n}>
								{n}
							</option>
						))}
					</select>
					<Button onClick={handlePurchase} disabled={purchasing}>
						{purchasing ? '処理中...' : '購入する'}
					</Button>
				</div>
			)}
		</div>
	)
}
