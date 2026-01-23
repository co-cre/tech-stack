import { events, ticketTypes, tickets } from 'db/schema'
import { and, eq } from 'drizzle-orm'
import type { Context } from 'hono'
import { z } from 'zod'
import { getDb } from '../lib/db'

type AuthEnv = {
	Bindings: Env
	Variables: { firebaseUser: { uid: string; email: string; name?: string } }
}

export const listTickets = async (c: Context<AuthEnv>) => {
	const db = getDb(c)
	const firebaseUser = c.get('firebaseUser')

	const ticketList = await db.query.tickets.findMany({
		where: eq(tickets.userId, firebaseUser.uid),
		orderBy: (tickets, { desc }) => [desc(tickets.createdAt)],
	})

	const ticketsWithDetails = await Promise.all(
		ticketList.map(async (ticket) => {
			const ticketType = await db.query.ticketTypes.findFirst({
				where: eq(ticketTypes.id, ticket.ticketTypeId),
			})
			if (!ticketType) return null

			const event = await db.query.events.findFirst({
				where: eq(events.id, ticketType.eventId),
			})

			return {
				id: ticket.id,
				status: ticket.status,
				eventTitle: event?.title || '',
				ticketTypeName: ticketType.name,
				eventStartsAt: event?.startsAt,
			}
		}),
	)

	return c.json(ticketsWithDetails.filter(Boolean))
}

export const getTicket = async (c: Context<AuthEnv>) => {
	const db = getDb(c)
	const firebaseUser = c.get('firebaseUser')
	const id = c.req.param('id')

	const ticket = await db.query.tickets.findFirst({
		where: and(eq(tickets.id, id), eq(tickets.userId, firebaseUser.uid)),
	})

	if (!ticket) {
		return c.json({ error: 'Ticket not found' }, 404)
	}

	const ticketType = await db.query.ticketTypes.findFirst({
		where: eq(ticketTypes.id, ticket.ticketTypeId),
	})

	if (!ticketType) {
		return c.json({ error: 'Ticket type not found' }, 404)
	}

	const event = await db.query.events.findFirst({
		where: eq(events.id, ticketType.eventId),
	})

	return c.json({
		id: ticket.id,
		qrToken: ticket.qrToken,
		status: ticket.status,
		usedAt: ticket.usedAt,
		eventTitle: event?.title || '',
		eventVenue: event?.venue || '',
		eventStartsAt: event?.startsAt,
		ticketTypeName: ticketType.name,
	})
}

const verifySchema = z.object({
	qrToken: z.string(),
})

export const verifyTicket = async (c: Context<AuthEnv>) => {
	const db = getDb(c)

	const body = await c.req.json()
	const parsed = verifySchema.safeParse(body)
	if (!parsed.success) {
		return c.json({ error: 'Invalid request' }, 400)
	}

	const { qrToken } = parsed.data

	const ticket = await db.query.tickets.findFirst({
		where: eq(tickets.qrToken, qrToken),
	})

	if (!ticket) {
		return c.json({
			success: false,
			message: 'チケットが見つかりません',
		})
	}

	if (ticket.status === 'used') {
		return c.json({
			success: false,
			message: '既に使用済みのチケットです',
		})
	}

	if (ticket.status === 'cancelled') {
		return c.json({
			success: false,
			message: 'キャンセルされたチケットです',
		})
	}

	await db
		.update(tickets)
		.set({
			status: 'used',
			usedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(tickets.id, ticket.id))

	const ticketType = await db.query.ticketTypes.findFirst({
		where: eq(ticketTypes.id, ticket.ticketTypeId),
	})

	const event = ticketType
		? await db.query.events.findFirst({
				where: eq(events.id, ticketType.eventId),
			})
		: null

	return c.json({
		success: true,
		message: '入場を確認しました',
		ticket: {
			eventTitle: event?.title || '',
			ticketTypeName: ticketType?.name || '',
		},
	})
}
