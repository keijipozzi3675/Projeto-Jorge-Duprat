import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const books = sqliteTable("books", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(),
  totalCopies: integer("total_copies").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reservations = sqliteTable("reservations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookId: integer("book_id").notNull().references(() => books.id),
  studentName: text("student_name").notNull(),
  className: text("class_name").notNull(),
  phone: text("phone").notNull(),
  status: text("status", { enum: ["ready", "waiting", "borrowed", "returned", "cancelled"] }).notNull(),
  queuePosition: integer("queue_position"),
  pickupDeadline: text("pickup_deadline"),
  dueDate: text("due_date"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reservationId: integer("reservation_id").references(() => reservations.id),
  recipient: text("recipient").notNull(),
  channel: text("channel", { enum: ["whatsapp", "dashboard"] }).notNull(),
  template: text("template").notNull(),
  status: text("status", { enum: ["pending", "sent", "failed", "read"] }).notNull().default("pending"),
  scheduledFor: text("scheduled_for"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
