import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const inventory = sqliteTable('inventory', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sku: text('sku').notNull().unique(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  brand: text('brand').notNull().default(''),
  size: text('size').notNull().default(''),
  quantity: integer('quantity').notNull().default(1),
  cost: real('cost').notNull().default(0),
  listPrice: real('list_price').notNull().default(0),
  status: text('status').notNull().default('Draft'),
  createdAt: text('created_at').notNull()
});
