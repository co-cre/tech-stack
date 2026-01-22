import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { orders } from './orders'
import { ticketTypes } from './ticket-types'
import { users } from './users'

export const tickets = sqliteTable('tickets', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	ticketTypeId: text('ticket_type_id')
		.notNull()
		.references(() => ticketTypes.id),
	orderId: text('order_id')
		.notNull()
		.references(() => orders.id),
	qrToken: text('qr_token')
		.notNull()
		.unique()
		.$defaultFn(() => crypto.randomUUID()),
	status: text('status', { enum: ['valid', 'used', 'cancelled'] })
		.notNull()
		.default('valid'),
	usedAt: integer('used_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
})

export type Ticket = typeof tickets.$inferSelect
export type NewTicket = typeof tickets.$inferInsert
