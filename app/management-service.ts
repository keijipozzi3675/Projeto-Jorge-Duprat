import { env } from "cloudflare:workers";
import { contextHasPermission, type StaffContext } from "./management-auth";
import { permissionCatalog } from "./management-roles";

export type ManagementSnapshot = {
  viewer: StaffContext;
  permissionCatalog: Array<{ key: string; label: string }>;
  metrics: { activeStaff: number; openTasks: number; activeReservations: number; publishedPosts: number };
  roles: Array<{ key: string; name: string; description: string; permissions: string[]; responsibilities: string[]; isSystem: boolean; active: boolean }>;
  roleOptions: Array<{ key: string; name: string }>;
  staff: Array<{ id: number; email: string; displayName: string; roleKey: string; roleName: string; active: boolean; lastLoginAt: string | null; createdAt: string }>;
  posts: Array<{ id: number; type: "notice" | "event" | "news"; slug: string; category: string; title: string; summary: string; content: string; eventDate: string | null; eventTime: string | null; location: string | null; status: "draft" | "published" | "archived"; authorName: string; createdAt: string; updatedAt: string }>;
  tasks: Array<{ id: number; title: string; description: string; category: string; assignedRoleKey: string; assignedRoleName: string; status: "pending" | "in_progress" | "completed"; dueDate: string | null; authorName: string; createdAt: string; updatedAt: string }>;
  reservations: Array<{ id: number; studentName: string; className: string; phone: string; bookTitle: string; status: string; queuePosition: number | null; pickupDeadline: string | null; dueDate: string | null; createdAt: string; updatedAt: string }>;
  audit: Array<{ id: number; action: string; entityType: string; entityId: string | null; actorName: string; detailsJson: string; createdAt: string }>;
};

type CountRow = { count: number };

export async function loadManagementSnapshot(context: StaffContext): Promise<ManagementSnapshot> {
  const [staffCount, taskCount, reservationCount, postCount] = await Promise.all([
    count("SELECT COUNT(*) AS count FROM staff_users WHERE active = 1"),
    count("SELECT COUNT(*) AS count FROM management_tasks WHERE status != 'completed'"),
    count("SELECT COUNT(*) AS count FROM reservations WHERE status IN ('ready', 'waiting', 'borrowed')"),
    count("SELECT COUNT(*) AS count FROM school_posts WHERE status = 'published'"),
  ]);

  const canViewStaff = contextHasPermission(context, "staff.read") || contextHasPermission(context, "staff.manage");
  const canManageRoles = contextHasPermission(context, "roles.manage") || contextHasPermission(context, "staff.manage");
  const canViewLibrary = contextHasPermission(context, "library.manage");
  const canViewAudit = contextHasPermission(context, "audit.view");
  const seesAllTasks = contextHasPermission(context, "tasks.manage") || contextHasPermission(context, "reports.view") || context.permissions.includes("*");

  const roles = canManageRoles ? await queryRows<{
    key: string; name: string; description: string; permissionsJson: string; responsibilitiesJson: string; isSystem: number; active: number;
  }>("SELECT key, name, description, permissions_json AS permissionsJson, responsibilities_json AS responsibilitiesJson, is_system AS isSystem, active FROM staff_roles ORDER BY is_system DESC, name") : [];

  const roleOptions = contextHasPermission(context, "tasks.manage") || canManageRoles
    ? await queryRows<{ key: string; name: string }>("SELECT key, name FROM staff_roles WHERE active = 1 ORDER BY name")
    : [];

  const staff = canViewStaff ? await queryRows<ManagementSnapshot["staff"][number]>(`
    SELECT u.id, u.email, u.display_name AS displayName, u.role_key AS roleKey, r.name AS roleName,
      u.active, u.last_login_at AS lastLoginAt, u.created_at AS createdAt
    FROM staff_users u JOIN staff_roles r ON r.key = u.role_key
    ORDER BY u.active DESC, u.display_name COLLATE NOCASE
  `) : [];

  const posts = contextHasPermission(context, "posts.read") || contextHasPermission(context, "notices.manage") || contextHasPermission(context, "events.manage") || context.permissions.includes("*")
    ? await queryRows<ManagementSnapshot["posts"][number]>(`
      SELECT p.id, p.type, p.slug, p.category, p.title, p.summary, p.content,
        p.event_date AS eventDate, p.event_time AS eventTime, p.location, p.status,
        u.display_name AS authorName, p.created_at AS createdAt, p.updated_at AS updatedAt
      FROM school_posts p JOIN staff_users u ON u.id = p.created_by_staff_id
      ORDER BY CASE p.status WHEN 'draft' THEN 0 WHEN 'published' THEN 1 ELSE 2 END, COALESCE(p.event_date, p.created_at) DESC
      LIMIT 100
    `) : [];

  const tasks = seesAllTasks
    ? await queryRows<ManagementSnapshot["tasks"][number]>(`${taskQuery()} ${taskOrder()}`)
    : await queryRows<ManagementSnapshot["tasks"][number]>(`${taskQuery()} WHERE t.assigned_role_key = ? OR t.created_by_staff_id = ? ${taskOrder()}`, context.roleKey, context.id);

  const reservations = canViewLibrary ? await queryRows<ManagementSnapshot["reservations"][number]>(`
    SELECT r.id, r.student_name AS studentName, r.class_name AS className, r.phone,
      b.title AS bookTitle, r.status, r.queue_position AS queuePosition,
      r.pickup_deadline AS pickupDeadline, r.due_date AS dueDate,
      r.created_at AS createdAt, r.updated_at AS updatedAt
    FROM reservations r JOIN books b ON b.id = r.book_id
    ORDER BY CASE r.status WHEN 'waiting' THEN 0 WHEN 'ready' THEN 1 WHEN 'borrowed' THEN 2 ELSE 3 END, r.created_at DESC
    LIMIT 100
  `) : [];

  const audit = canViewAudit ? await queryRows<ManagementSnapshot["audit"][number]>(`
    SELECT a.id, a.action, a.entity_type AS entityType, a.entity_id AS entityId,
      u.display_name AS actorName, a.details_json AS detailsJson, a.created_at AS createdAt
    FROM audit_events a JOIN staff_users u ON u.id = a.actor_staff_id
    ORDER BY a.created_at DESC LIMIT 100
  `) : [];

  return {
    viewer: context,
    permissionCatalog: permissionCatalog.map((item) => ({ ...item })),
    metrics: { activeStaff: staffCount, openTasks: taskCount, activeReservations: reservationCount, publishedPosts: postCount },
    roles: roles.map((role) => ({ ...role, permissions: parseArray(role.permissionsJson), responsibilities: parseArray(role.responsibilitiesJson), isSystem: Boolean(role.isSystem), active: Boolean(role.active) })),
    roleOptions,
    staff: staff.map((member) => ({ ...member, active: Boolean(member.active) })),
    posts,
    tasks,
    reservations,
    audit,
  };
}

function taskQuery() {
  return `
    SELECT t.id, t.title, t.description, t.category, t.assigned_role_key AS assignedRoleKey,
      r.name AS assignedRoleName, t.status, t.due_date AS dueDate,
      u.display_name AS authorName, t.created_at AS createdAt, t.updated_at AS updatedAt
    FROM management_tasks t
    JOIN staff_roles r ON r.key = t.assigned_role_key
    JOIN staff_users u ON u.id = t.created_by_staff_id
  `;
}

function taskOrder() {
  return "ORDER BY CASE t.status WHEN 'pending' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END, COALESCE(t.due_date, '9999-12-31'), t.created_at DESC LIMIT 100";
}

async function count(sql: string) {
  const row = await env.DB.prepare(sql).first<CountRow>();
  return Number(row?.count ?? 0);
}

async function queryRows<T>(sql: string, ...bindings: Array<string | number | null>) {
  const query = bindings.length ? env.DB.prepare(sql).bind(...bindings) : env.DB.prepare(sql);
  const result = await query.all<T>();
  return result.results ?? [];
}

function parseArray(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
