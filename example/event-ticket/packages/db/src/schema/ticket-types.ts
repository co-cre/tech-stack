import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { events } from './events'

export const ticketTypes = sqliteTable('ticket_types', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	eventId: text('event_id')
		.notNull()
		.references(() => events.id),
	name: text('name').notNull(), // e.g., "一般", "VIP", "学生"
	description: text('description'),
	price: integer('price').notNull(), // 円単位
	quantity: integer('quantity').notNull(), // 販売枚数上限
	soldCount: integer('sold_count').notNull().default(0),
	salesStartsAt: integer('sales_starts_at', { mode: 'timestamp' }),
	salesEndsAt: integer('sales_ends_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
})

export type TicketType = typeof ticketTypes.$inferSelect
export type NewTicketType = typeof ticketTypes.$inferInsert
