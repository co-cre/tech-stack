import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type Event = {
	id: string
	title: string
	description: string | null
	venue: string
	startsAt: string
	imageUrl: string | null
}

export function EventListPage() {
	const [events, setEvents] = useState<Event[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		apiFetch<Event[]>('/events')
			.then(setEvents)
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [])

	if (loading) {
		return <div className="text-muted-foreground">読み込み中...</div>
	}

	if (events.length === 0) {
		return <div className="text-muted-foreground">イベントがありません</div>
	}

	return (
		<div>
			<h1 className="mb-6 text-3xl font-bold">イベント一覧</h1>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{events.map((event) => (
					<Link key={event.id} to={`/events/${event.id}`}>
						<Card className="transition-shadow hover:shadow-lg">
							{event.imageUrl && (
								<img
									src={event.imageUrl}
									alt={event.title}
									className="h-48 w-full rounded-t-lg object-cover"
								/>
							)}
							<CardHeader>
								<CardTitle>{event.title}</CardTitle>
								<CardDescription>{event.venue}</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									{new Date(event.startsAt).toLocaleDateString('ja-JP', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit',
									})}
								</p>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	)
}
