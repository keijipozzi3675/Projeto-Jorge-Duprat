import { env } from "cloudflare:workers";
import { getChatGPTUser } from "./chatgpt-auth";
import { builtInRoles, hasPermission } from "./management-roles";

export type StaffContext = {
  id: number;
  email: string;
  displayName: string;
  roleKey: string;
  roleName: string;
  roleDescription: string;
  responsibilities: string[];
  permissions: string[];
  bootstrapped: boolean;
};

type StaffRow = {
  id: number;
  email: string;
  displayName: string;
  roleKey: string;
  roleName: string;
  roleDescription: string;
  permissionsJson: string;
  responsibilitiesJson: string;
  active: number;
};

export async function ensureBuiltInRoles() {
  const statements = builtInRoles.map((role) => env.DB.prepare(`
    INSERT INTO staff_roles (key, name, description, permissions_json, responsibilities_json, is_system, active)
    VALUES (?, ?, ?, ?, ?, 1, 1)
    ON CONFLICT(key) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      permissions_json = excluded.permissions_json,
      responsibilities_json = excluded.responsibilities_json,
      is_system = 1,
      active = 1,
      updated_at = CURRENT_TIMESTAMP
  `).bind(role.key, role.name, role.description, JSON.stringify(role.permissions), JSON.stringify(role.responsibilities)));
  await env.DB.batch(statements);
}
export async function resolveStaffContext({ allowBootstrap = true }: { allowBootstrap?: boolean } = {}): Promise<StaffContext | null> {
  const identity = await getChatGPTUser();
  if (!identity) return null;

  await ensureBuiltInRoles();
  const email = identity.email.trim().toLocaleLowerCase("pt-BR");
  let bootstrapped = false;

  if (allowBootstrap) {
    const insertion = await env.DB.prepare(`
      INSERT INTO staff_users (email, display_name, role_key, active, created_by_email)
      SELECT ?, ?, 'direction', 1, ?
      WHERE NOT EXISTS (SELECT 1 FROM staff_users)
    `).bind(email, identity.displayName, email).run();
    bootstrapped = Number(insertion.meta.changes ?? 0) > 0;
    if (bootstrapped) {
      const created = await env.DB.prepare("SELECT id FROM staff_users WHERE email = ?").bind(email).first<{ id: number }>();
      if (created) await env.DB.prepare(`INSERT INTO audit_events (actor_staff_id, action, entity_type, entity_id, details_json) VALUES (?, 'system.bootstrap', 'staff_user', ?, ?)`)
        .bind(created.id, String(created.id), JSON.stringify({ email })).run();
    }
  }

  const row = await env.DB.prepare(`
    SELECT
      u.id,
      u.email,
      u.display_name AS displayName,
      u.role_key AS roleKey,
      u.active,
      r.name AS roleName,
      r.description AS roleDescription,
      r.permissions_json AS permissionsJson,
      r.responsibilities_json AS responsibilitiesJson
    FROM staff_users u
    JOIN staff_roles r ON r.key = u.role_key
    WHERE lower(u.email) = ? AND r.active = 1
    LIMIT 1
  `).bind(email).first<StaffRow>();

  if (!row || !row.active) return null;
  await env.DB.prepare("UPDATE staff_users SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(row.id).run();

  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    roleKey: row.roleKey,
    roleName: row.roleName,
    roleDescription: row.roleDescription,
    permissions: safeStringArray(row.permissionsJson),
    responsibilities: safeStringArray(row.responsibilitiesJson),
    bootstrapped,
  };
}

export function contextHasPermission(context: StaffContext, permission: string) {
  return hasPermission(context.permissions, permission);
}

export async function recordAudit(context: StaffContext, action: string, entityType: string, entityId: string | number | null, details: Record<string, unknown> = {}) {
  await env.DB.prepare(`INSERT INTO audit_events (actor_staff_id, action, entity_type, entity_id, details_json) VALUES (?, ?, ?, ?, ?)`)
    .bind(context.id, action, entityType, entityId === null ? null : String(entityId), JSON.stringify(details)).run();
}

function safeStringArray(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
