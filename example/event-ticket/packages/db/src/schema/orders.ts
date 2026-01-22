import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { ticketTypes } from './ticket-types'
import { users } from './users'

export const orders = sqliteTable('orders', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	ticketTypeId: text('ticket_type_id')
		.notNull()
		.references(() => ticketTypes.id),
	quantity: integer('quantity').notNull(),
	totalAmount: integer('total_amount').notNull(), // 円単位
	status: text('status', { enum: ['pending', 'paid', 'cancelled', 'refunded'] })
		.notNull()
		.default('pending'),
	stripeSessionId: text('stripe_session_id'),
	stripePaymentIntentId: text('stripe_payment_intent_id'),
	idempotencyKey: text('idempotency_key').unique(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
})

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
