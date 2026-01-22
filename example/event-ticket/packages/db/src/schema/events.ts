import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const events = sqliteTable('events', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	description: text('description'),
	venue: text('venue').notNull(),
	startsAt: integer('starts_at', { mode: 'timestamp' }).notNull(),
	endsAt: integer('ends_at', { mode: 'timestamp' }).notNull(),
	imageUrl: text('image_url'),
	status: text('status', { enum: ['draft', 'published', 'cancelled'] })
		.notNull()
		.default('draft'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
})

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
