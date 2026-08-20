import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

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

export const staffRoles = sqliteTable("staff_roles", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  permissionsJson: text("permissions_json").notNull(),
  responsibilitiesJson: text("responsibilities_json").notNull().default("[]"),
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const staffUsers = sqliteTable("staff_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  roleKey: text("role_key").notNull().references(() => staffRoles.key),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdByEmail: text("created_by_email"),
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("staff_users_email_unique").on(table.email),
  index("staff_users_role_active_idx").on(table.roleKey, table.active),
]);

export const schoolPosts = sqliteTable("school_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["notice", "event", "news"] }).notNull(),
  slug: text("slug").notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  eventDate: text("event_date"),
  eventTime: text("event_time"),
  location: text("location"),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  createdByStaffId: integer("created_by_staff_id").notNull().references(() => staffUsers.id),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("school_posts_slug_unique").on(table.slug),
  index("school_posts_type_status_date_idx").on(table.type, table.status, table.eventDate),
]);

export const managementTasks = sqliteTable("management_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull().default("administrative"),
  assignedRoleKey: text("assigned_role_key").notNull().references(() => staffRoles.key),
  status: text("status", { enum: ["pending", "in_progress", "completed"] }).notNull().default("pending"),
  dueDate: text("due_date"),
  createdByStaffId: integer("created_by_staff_id").notNull().references(() => staffUsers.id),
  updatedByStaffId: integer("updated_by_staff_id").notNull().references(() => staffUsers.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("management_tasks_role_status_idx").on(table.assignedRoleKey, table.status)]);

export const auditEvents = sqliteTable("audit_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorStaffId: integer("actor_staff_id").notNull().references(() => staffUsers.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  detailsJson: text("details_json").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("audit_events_actor_created_idx").on(table.actorStaffId, table.createdAt)]);
