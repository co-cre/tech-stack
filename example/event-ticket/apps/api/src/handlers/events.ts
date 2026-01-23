import { events, ticketTypes } from 'db/schema'
import { eq } from 'drizzle-orm'
import type { Context } from 'hono'
import { getDb } from '../lib/db'

export const listEvents = async (c: Context<{ Bindings: Env }>) => {
	const db = getDb(c)

	const eventList = await db.query.events.findMany({
		where: eq(events.status, 'published'),
		orderBy: (events, { desc }) => [desc(events.startsAt)],
	})

	return c.json(eventList)
}

export const getEvent = async (c: Context<{ Bindings: Env }>) => {
	const db = getDb(c)
	const id = c.req.param('id')

	const event = await db.query.events.findFirst({
		where: eq(events.id, id),
	})

	if (!event) {
		return c.json({ error: 'Event not found' }, 404)
	}

	const types = await db.query.ticketTypes.findMany({
		where: eq(ticketTypes.eventId, id),
	})

	return c.json({
		...event,
		ticketTypes: types,
	})
}
