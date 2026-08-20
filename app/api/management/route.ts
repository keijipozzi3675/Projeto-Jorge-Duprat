import { env } from "cloudflare:workers";
import { contextHasPermission, recordAudit, resolveStaffContext, type StaffContext } from "../../management-auth";
import { loadManagementSnapshot } from "../../management-service";
import { permissionCatalog } from "../../management-roles";

export const dynamic = "force-dynamic";

type JsonObject = Record<string, unknown>;

export async function GET() {
  const context = await resolveStaffContext();
  if (!context) return Response.json({ error: "Conta não autorizada pela escola." }, { status: 403 });
  return Response.json(await loadManagementSnapshot(context));
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Origem da solicitação não permitida." }, { status: 403 });
  const context = await resolveStaffContext();
  if (!context) return Response.json({ error: "Conta não autorizada pela escola." }, { status: 403 });

  let body: JsonObject;
  try {
    body = await request.json() as JsonObject;
  } catch {
    return Response.json({ error: "Solicitação inválida." }, { status: 400 });
  }

  try {
    const message = await runAction(context, body);
    return Response.json({ ok: true, message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível concluir a operação.";
    return Response.json({ error: message }, { status: message === "Sem permissão para esta operação." ? 403 : 400 });
  }
}

async function runAction(context: StaffContext, body: JsonObject) {
  const action = text(body.action, 60);
  switch (action) {
    case "staff.create": return createStaff(context, body);
    case "staff.toggle": return toggleStaff(context, body);
    case "role.create": return createRole(context, body);
    case "post.create": return createPost(context, body);
    case "post.status": return updatePostStatus(context, body);
    case "task.create": return createTask(context, body);
    case "task.status": return updateTaskStatus(context, body);
    case "reservation.status": return updateReservationStatus(context, body);
    default: throw new Error("Ação não reconhecida.");
  }
}

async function createStaff(context: StaffContext, body: JsonObject) {
  requirePermission(context, "staff.manage");
  const displayName = text(body.displayName, 100);
  const email = emailAddress(body.email);
  const roleKey = key(body.roleKey, 60);
  if (displayName.length < 2) throw new Error("Informe o nome do profissional.");
  const role = await env.DB.prepare("SELECT key, name, permissions_json AS permissionsJson FROM staff_roles WHERE key = ? AND active = 1").bind(roleKey).first<{ key: string; name: string; permissionsJson: string }>();
  if (!role) throw new Error("Cargo não encontrado.");
  assertCanGrant(context, parseArray(role.permissionsJson));

  await env.DB.prepare(`
    INSERT INTO staff_users (email, display_name, role_key, active, created_by_email)
    VALUES (?, ?, ?, 1, ?)
    ON CONFLICT(email) DO UPDATE SET display_name = excluded.display_name, role_key = excluded.role_key, active = 1, updated_at = CURRENT_TIMESTAMP
  `).bind(email, displayName, roleKey, context.email).run();
  const member = await env.DB.prepare("SELECT id FROM staff_users WHERE email = ?").bind(email).first<{ id: number }>();
  await recordAudit(context, "staff.upsert", "staff_user", member?.id ?? null, { email, roleKey });
  return `Conta de ${displayName} autorizada como ${role.name}.`;
}

async function toggleStaff(context: StaffContext, body: JsonObject) {
  requirePermission(context, "staff.manage");
  const id = positiveInteger(body.id);
  const active = Boolean(body.active);
  if (id === context.id && !active) throw new Error("Você não pode desativar a própria conta.");
  const target = await env.DB.prepare(`SELECT u.id, u.email, r.permissions_json AS permissionsJson FROM staff_users u JOIN staff_roles r ON r.key = u.role_key WHERE u.id = ?`)
    .bind(id).first<{ id: number; email: string; permissionsJson: string }>();
  if (!target) throw new Error("Conta não encontrada.");
  assertCanGrant(context, parseArray(target.permissionsJson));
  await env.DB.prepare("UPDATE staff_users SET active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(active ? 1 : 0, id).run();
  await recordAudit(context, active ? "staff.activate" : "staff.deactivate", "staff_user", id, { email: target.email });
  return active ? "Conta reativada." : "Conta desativada.";
}

async function createRole(context: StaffContext, body: JsonObject) {
  requirePermission(context, "roles.manage");
  const name = text(body.name, 80);
  const roleKey = slug(text(body.key || name, 80));
  const description = text(body.description, 240);
  const permissions = stringArray(body.permissions).filter((permission) => permissionCatalog.some((item) => item.key === permission));
  const responsibilities = stringArray(body.responsibilities).map((item) => item.slice(0, 120)).slice(0, 8);
  if (name.length < 2 || roleKey.length < 2 || description.length < 8) throw new Error("Preencha nome e descrição do cargo.");
  if (!permissions.length) throw new Error("Selecione pelo menos uma permissão.");
  const existingSystemRole = await env.DB.prepare("SELECT is_system AS isSystem FROM staff_roles WHERE key = ?").bind(roleKey).first<{ isSystem: number }>();
  if (existingSystemRole?.isSystem) throw new Error("Os cargos padrão não podem ser substituídos.");
  assertCanGrant(context, permissions);
  await env.DB.prepare(`
    INSERT INTO staff_roles (key, name, description, permissions_json, responsibilities_json, is_system, active)
    VALUES (?, ?, ?, ?, ?, 0, 1)
    ON CONFLICT(key) DO UPDATE SET name = excluded.name, description = excluded.description,
      permissions_json = excluded.permissions_json, responsibilities_json = excluded.responsibilities_json,
      active = 1, updated_at = CURRENT_TIMESTAMP
  `).bind(roleKey, name, description, JSON.stringify(permissions), JSON.stringify(responsibilities)).run();
  await recordAudit(context, "role.upsert", "staff_role", roleKey, { name, permissions });
  return `Cargo ${name} salvo com ${permissions.length} permissões.`;
}

async function createPost(context: StaffContext, body: JsonObject) {
  const type = enumValue(body.type, ["notice", "event", "news"] as const);
  requirePermission(context, type === "event" ? "events.manage" : "notices.manage");
  const title = text(body.title, 140);
  const summary = text(body.summary, 300);
  const content = text(body.content, 4000);
  const category = text(body.category, 60) || (type === "event" ? "Evento" : "Comunicado");
  const status = enumValue(body.status || "draft", ["draft", "published"] as const);
  const eventDate = optionalDate(body.eventDate);
  const eventTime = optionalText(body.eventTime, 80);
  const location = optionalText(body.location, 120);
  if (title.length < 4 || summary.length < 8 || content.length < 12) throw new Error("Preencha título, resumo e conteúdo.");
  const baseSlug = slug(title);
  const uniqueSlug = await availableSlug(baseSlug);
  const result = await env.DB.prepare(`
    INSERT INTO school_posts (type, slug, category, title, summary, content, event_date, event_time, location, status, created_by_staff_id, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'published' THEN CURRENT_TIMESTAMP ELSE NULL END)
  `).bind(type, uniqueSlug, category, title, summary, content, eventDate, eventTime, location, status, context.id, status).run();
  const id = Number(result.meta.last_row_id);
  await recordAudit(context, "post.create", "school_post", id, { type, status, title });
  return status === "published" ? "Publicação criada e exibida no portal." : "Rascunho salvo.";
}

async function updatePostStatus(context: StaffContext, body: JsonObject) {
  const id = positiveInteger(body.id);
  const status = enumValue(body.status, ["draft", "published", "archived"] as const);
  const post = await env.DB.prepare("SELECT type, title FROM school_posts WHERE id = ?").bind(id).first<{ type: "notice" | "event" | "news"; title: string }>();
  if (!post) throw new Error("Publicação não encontrada.");
  requirePermission(context, post.type === "event" ? "events.manage" : "notices.manage");
  await env.DB.prepare(`UPDATE school_posts SET status = ?, published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, CURRENT_TIMESTAMP) ELSE published_at END, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(status, status, id).run();
  await recordAudit(context, "post.status", "school_post", id, { status, title: post.title });
  return "Situação da publicação atualizada.";
}

async function createTask(context: StaffContext, body: JsonObject) {
  const canManageAll = contextHasPermission(context, "tasks.manage");
  if (!canManageAll && !contextHasPermission(context, "pedagogy.manage") && !contextHasPermission(context, "routine.manage")) throw new Error("Sem permissão para esta operação.");
  const title = text(body.title, 140);
  const description = text(body.description, 1000);
  const category = text(body.category, 60) || "administrative";
  const assignedRoleKey = canManageAll ? key(body.assignedRoleKey || context.roleKey, 60) : context.roleKey;
  const dueDate = optionalDate(body.dueDate);
  if (title.length < 4) throw new Error("Informe o título da tarefa.");
  const role = await env.DB.prepare("SELECT key FROM staff_roles WHERE key = ? AND active = 1").bind(assignedRoleKey).first();
  if (!role) throw new Error("Cargo responsável não encontrado.");
  const result = await env.DB.prepare(`INSERT INTO management_tasks (title, description, category, assigned_role_key, status, due_date, created_by_staff_id, updated_by_staff_id) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)`)
    .bind(title, description, category, assignedRoleKey, dueDate, context.id, context.id).run();
  const id = Number(result.meta.last_row_id);
  await recordAudit(context, "task.create", "management_task", id, { title, assignedRoleKey });
  return "Tarefa criada.";
}

async function updateTaskStatus(context: StaffContext, body: JsonObject) {
  const id = positiveInteger(body.id);
  const status = enumValue(body.status, ["pending", "in_progress", "completed"] as const);
  const task = await env.DB.prepare("SELECT assigned_role_key AS assignedRoleKey, title FROM management_tasks WHERE id = ?").bind(id).first<{ assignedRoleKey: string; title: string }>();
  if (!task) throw new Error("Tarefa não encontrada.");
  const allowed = contextHasPermission(context, "tasks.manage") || task.assignedRoleKey === context.roleKey;
  if (!allowed) throw new Error("Sem permissão para esta operação.");
  await env.DB.prepare("UPDATE management_tasks SET status = ?, updated_by_staff_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(status, context.id, id).run();
  await recordAudit(context, "task.status", "management_task", id, { status, title: task.title });
  return "Tarefa atualizada.";
}

async function updateReservationStatus(context: StaffContext, body: JsonObject) {
  requirePermission(context, "library.manage");
  const id = positiveInteger(body.id);
  const status = enumValue(body.status, ["ready", "waiting", "borrowed", "returned", "cancelled"] as const);
  const reservation = await env.DB.prepare("SELECT id FROM reservations WHERE id = ?").bind(id).first();
  if (!reservation) throw new Error("Reserva não encontrada.");
  const dueDate = status === "borrowed" ? optionalDate(body.dueDate) : null;
  await env.DB.prepare(`UPDATE reservations SET status = ?, due_date = CASE WHEN ? = 'borrowed' THEN ? ELSE due_date END, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(status, status, dueDate, id).run();
  await recordAudit(context, "reservation.status", "reservation", id, { status });
  return "Reserva atualizada.";
}

function requirePermission(context: StaffContext, permission: string) {
  if (!contextHasPermission(context, permission)) throw new Error("Sem permissão para esta operação.");
}

function assertCanGrant(context: StaffContext, permissions: string[]) {
  if (context.permissions.includes("*")) return;
  if (permissions.includes("*") || permissions.some((permission) => !context.permissions.includes(permission))) throw new Error("Você não pode conceder permissões superiores às suas.");
}

async function availableSlug(base: string) {
  const fallback = base || `publicacao-${Date.now()}`;
  for (let index = 0; index < 30; index += 1) {
    const candidate = index === 0 ? fallback : `${fallback}-${index + 1}`;
    const exists = await env.DB.prepare("SELECT 1 FROM school_posts WHERE slug = ?").bind(candidate).first();
    if (!exists) return candidate;
  }
  return `${fallback}-${Date.now()}`;
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function optionalText(value: unknown, max: number) {
  const result = text(value, max);
  return result || null;
}

function positiveInteger(value: unknown) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) throw new Error("Identificador inválido.");
  return number;
}

function emailAddress(value: unknown) {
  const email = text(value, 160).toLocaleLowerCase("pt-BR");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Informe um e-mail válido.");
  return email;
}

function key(value: unknown, max: number) {
  const result = text(value, max);
  if (!/^[a-z0-9_\-]+$/.test(result)) throw new Error("Identificador inválido.");
  return result;
}

function slug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
}

function optionalDate(value: unknown) {
  const result = text(value, 10);
  if (!result) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result)) throw new Error("Data inválida.");
  return result;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean) : [];
}

function parseArray(value: string) {
  try { return stringArray(JSON.parse(value)); } catch { return []; }
}

function enumValue<const T extends readonly string[]>(value: unknown, allowed: T): T[number] {
  const result = text(value, 40);
  if (!(allowed as readonly string[]).includes(result)) throw new Error("Opção inválida.");
  return result as T[number];
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}
