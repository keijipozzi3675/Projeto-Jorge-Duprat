"use client";

import Link from "next/link";
import { FormEvent, useCallback, useMemo, useState } from "react";
import type { ManagementSnapshot } from "../management-service";

type ModuleKey = "overview" | "posts" | "tasks" | "library" | "staff" | "roles" | "audit";
type ActionPayload = Record<string, unknown>;

const moduleLabels: Record<ModuleKey, { label: string; icon: string }> = {
  overview: { label: "Visão geral", icon: "⌂" },
  posts: { label: "Avisos e eventos", icon: "✦" },
  tasks: { label: "Tarefas", icon: "✓" },
  library: { label: "Biblioteca", icon: "▤" },
  staff: { label: "Equipe e acessos", icon: "◎" },
  roles: { label: "Cargos e permissões", icon: "◆" },
  audit: { label: "Auditoria", icon: "↺" },
};

const postTypeLabels = { notice: "Aviso", event: "Evento", news: "Notícia" } as const;
const postStatusLabels = { draft: "Rascunho", published: "Publicado", archived: "Arquivado" } as const;
const taskStatusLabels = { pending: "Pendente", in_progress: "Em andamento", completed: "Concluída" } as const;
const reservationStatusLabels: Record<string, string> = { ready: "Disponível para retirada", waiting: "Na fila", borrowed: "Emprestado", returned: "Devolvido", cancelled: "Cancelado" };

export default function ManagementDashboard({ initialSnapshot, signOutPath }: { initialSnapshot: ManagementSnapshot; signOutPath: string }) {
  const [active, setActive] = useState<ModuleKey>("overview");
  const [snapshot, setSnapshot] = useState<ManagementSnapshot>(initialSnapshot);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const loadSnapshot = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/management", { cache: "no-store" });
      const body = await response.json() as ManagementSnapshot | { error?: string };
      if (!response.ok) throw new Error("error" in body ? body.error : "Não foi possível carregar a gestão.");
      setSnapshot(body as ManagementSnapshot);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar a gestão.");
    } finally {
      setLoading(false);
    }
  }, []);

  const viewer = snapshot.viewer;
  const can = useCallback((permission: string) => viewer.permissions.includes("*") || viewer.permissions.includes(permission), [viewer.permissions]);
  const visibleModules = useMemo(() => {
    const modules: ModuleKey[] = ["overview"];
    if (can("posts.read") || can("notices.manage") || can("events.manage")) modules.push("posts");
    if (can("tasks.manage") || can("pedagogy.manage") || can("routine.manage")) modules.push("tasks");
    if (can("library.manage")) modules.push("library");
    if (can("staff.read") || can("staff.manage")) modules.push("staff");
    if (can("roles.manage")) modules.push("roles");
    if (can("audit.view")) modules.push("audit");
    return modules;
  }, [can]);

  const currentActive = visibleModules.includes(active) ? active : "overview";

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3600);
  }

  async function mutate(payload: ActionPayload) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/management", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(body.error ?? "Não foi possível concluir a operação.");
      showToast(body.message ?? "Alteração salva.");
      await loadSnapshot();
      return true;
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "Não foi possível concluir a operação.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  const assignableRoles = useMemo(() => {
    const roles = snapshot.roleOptions;
    if (roles.some((role) => role.key === viewer.roleKey)) return roles;
    return [{ key: viewer.roleKey, name: viewer.roleName }, ...roles];
  }, [snapshot.roleOptions, viewer.roleKey, viewer.roleName]);

  return (
    <main className="management-dashboard">
      <aside className="management-sidebar">
        <Link href="/" className="brand brand-compact"><span className="brand-mark"><span>JD</span></span><span className="brand-copy"><strong>Portal Duprat</strong><small>Gestão escolar</small></span></Link>
        <div className="management-role-card"><span className="dashboard-user-avatar">{initials(viewer.displayName)}</span><div><strong>{viewer.displayName}</strong><small>{viewer.roleName}</small></div></div>
        <nav className="dashboard-nav" aria-label="Menu da gestão">
          {visibleModules.map((module) => <button type="button" key={module} className={currentActive === module ? "active" : ""} onClick={() => setActive(module)}><span>{moduleLabels[module].icon}</span>{moduleLabels[module].label}</button>)}
        </nav>
        <div className="management-security-note"><span>✓</span><p><strong>Acesso individual</strong>As ações ficam vinculadas à sua conta.</p></div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div><small>E.E. JORGE DUPRAT FIGUEIREDO</small><strong>Central de gestão</strong></div>
          <div className="management-top-actions"><button type="button" onClick={() => void loadSnapshot()} disabled={loading}>Atualizar</button><Link href="/">Ver portal</Link><a href={signOutPath}>Sair</a></div>
        </header>

        <div className="management-content">
          {error && <div className="management-alert" role="alert"><strong>Atenção</strong><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Fechar aviso">×</button></div>}
          {currentActive === "overview" && <Overview snapshot={snapshot} />}
          {currentActive === "posts" && <PostsModule snapshot={snapshot} can={can} busy={busy} mutate={mutate} />}
          {currentActive === "tasks" && <TasksModule snapshot={snapshot} can={can} busy={busy} roles={assignableRoles} mutate={mutate} />}
          {currentActive === "library" && <LibraryModule snapshot={snapshot} busy={busy} mutate={mutate} />}
          {currentActive === "staff" && <StaffModule snapshot={snapshot} can={can} busy={busy} roles={assignableRoles} mutate={mutate} />}
          {currentActive === "roles" && <RolesModule snapshot={snapshot} busy={busy} mutate={mutate} />}
          {currentActive === "audit" && <AuditModule snapshot={snapshot} />}
        </div>
      </section>
      {toast && <div className="dashboard-toast" role="status">✓ {toast}</div>}
    </main>
  );
}

function Overview({ snapshot }: { snapshot: ManagementSnapshot }) {
  const { viewer, metrics } = snapshot;
  return (
    <>
      <div className="dashboard-heading"><div><span className="management-eyebrow">SEU AMBIENTE DE TRABALHO</span><h1>Olá, {firstName(viewer.displayName)}.</h1><p>{viewer.roleDescription}</p></div><span className="role-chip">{viewer.roleName}</span></div>
      <div className="metric-grid">
        <article className="metric-card"><span>Profissionais ativos</span><strong>{metrics.activeStaff}</strong><small>contas autorizadas</small></article>
        <article className="metric-card"><span>Tarefas abertas</span><strong>{metrics.openTasks}</strong><small>pendentes ou em andamento</small></article>
        <article className="metric-card"><span>Reservas ativas</span><strong>{metrics.activeReservations}</strong><small>biblioteca e fila</small></article>
        <article className="metric-card"><span>Publicações</span><strong>{metrics.publishedPosts}</strong><small>visíveis no portal</small></article>
      </div>
      <div className="management-overview-grid">
        <section className="dashboard-panel"><div className="panel-title"><strong>Responsabilidades do seu cargo</strong></div><ul className="responsibility-dashboard-list">{viewer.responsibilities.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul></section>
        <section className="dashboard-panel"><div className="panel-title"><strong>Próximas tarefas</strong></div><div className="management-compact-list">{snapshot.tasks.filter((task) => task.status !== "completed").slice(0, 5).map((task) => <article key={task.id}><span className={`management-status ${task.status}`}>{taskStatusLabels[task.status]}</span><strong>{task.title}</strong><small>{task.assignedRoleName}{task.dueDate ? ` • até ${formatDate(task.dueDate)}` : ""}</small></article>)}{!snapshot.tasks.some((task) => task.status !== "completed") && <p className="management-empty">Nenhuma tarefa aberta para o seu perfil.</p>}</div></section>
      </div>
      <div className="role-banner"><div><strong>Segurança por função</strong><span>Você vê apenas os módulos autorizados para {viewer.roleName}. Toda alteração importante é registrada na auditoria.</span></div><span className="security-badge">Proteção ativa</span></div>
    </>
  );
}

function PostsModule({ snapshot, can, busy, mutate }: { snapshot: ManagementSnapshot; can: (permission: string) => boolean; busy: boolean; mutate: (payload: ActionPayload) => Promise<boolean> }) {
  const canNotice = can("notices.manage");
  const canEvent = can("events.manage");
  const canCreate = canNotice || canEvent;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const saved = await mutate({ action: "post.create", type: data.get("type"), title: data.get("title"), category: data.get("category"), summary: data.get("summary"), content: data.get("content"), status: data.get("status"), eventDate: data.get("eventDate"), eventTime: data.get("eventTime"), location: data.get("location") });
    if (saved) form.reset();
  }

  return (
    <>
      <ModuleHeading eyebrow="COMUNICAÇÃO OFICIAL" title="Avisos, notícias e eventos" description="Crie rascunhos, publique no portal e arquive conteúdos antigos." />
      {canCreate && <form className="management-form" onSubmit={submit}><div className="form-title"><strong>Nova publicação</strong><small>Os conteúdos publicados aparecem automaticamente nas áreas públicas.</small></div><div className="management-form-grid">
        <label>Tipo<select name="type" defaultValue={canNotice ? "notice" : "event"}>{canNotice && <option value="notice">Aviso</option>}{canEvent && <option value="event">Evento</option>}{canNotice && <option value="news">Notícia</option>}</select></label>
        <label>Categoria<input name="category" placeholder="Ex.: Reunião, Esporte, ENEM" required /></label>
        <label className="wide">Título<input name="title" minLength={4} maxLength={140} required /></label>
        <label className="wide">Resumo<textarea name="summary" minLength={8} maxLength={300} rows={2} required /></label>
        <label className="wide">Conteúdo completo<textarea name="content" minLength={12} maxLength={4000} rows={5} required /></label>
        <label>Data do evento<input type="date" name="eventDate" /></label><label>Horário<input name="eventTime" placeholder="Ex.: 18h30" /></label><label>Local<input name="location" placeholder="Ex.: Quadra" /></label>
        <label>Situação<select name="status" defaultValue="draft"><option value="draft">Salvar rascunho</option><option value="published">Publicar agora</option></select></label>
      </div><button className="dashboard-action" disabled={busy}>Salvar publicação</button></form>}
      <div className="management-card-list">{snapshot.posts.map((post) => <article className="management-list-card" key={post.id}><div><span className={`management-status ${post.status}`}>{postTypeLabels[post.type]} • {postStatusLabels[post.status]}</span><h3>{post.title}</h3><p>{post.summary}</p><small>{post.category} • por {post.authorName} • {formatDate(post.createdAt)}</small></div><div className="list-card-actions">{post.status !== "published" && ((post.type === "event" && canEvent) || (post.type !== "event" && canNotice)) && <button disabled={busy} onClick={() => void mutate({ action: "post.status", id: post.id, status: "published" })}>Publicar</button>}{post.status !== "archived" && ((post.type === "event" && canEvent) || (post.type !== "event" && canNotice)) && <button className="quiet" disabled={busy} onClick={() => void mutate({ action: "post.status", id: post.id, status: "archived" })}>Arquivar</button>}</div></article>)}{snapshot.posts.length === 0 && <p className="management-empty">Ainda não há publicações cadastradas.</p>}</div>
    </>
  );
}

function TasksModule({ snapshot, can, busy, roles, mutate }: { snapshot: ManagementSnapshot; can: (permission: string) => boolean; busy: boolean; roles: ManagementSnapshot["roleOptions"]; mutate: (payload: ActionPayload) => Promise<boolean> }) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const saved = await mutate({ action: "task.create", title: data.get("title"), description: data.get("description"), category: data.get("category"), assignedRoleKey: data.get("assignedRoleKey"), dueDate: data.get("dueDate") });
    if (saved) form.reset();
  }
  return (
    <>
      <ModuleHeading eyebrow="ORGANIZAÇÃO DA ROTINA" title="Tarefas da equipe" description="Distribua responsabilidades por cargo e acompanhe o andamento." />
      <form className="management-form" onSubmit={submit}><div className="form-title"><strong>Nova tarefa</strong><small>Profissionais do cargo selecionado verão esta atividade.</small></div><div className="management-form-grid"><label className="wide">Título<input name="title" minLength={4} maxLength={140} required /></label><label>Categoria<input name="category" placeholder="Administrativa, pedagógica…" /></label>{can("tasks.manage") ? <label>Responsável<select name="assignedRoleKey" defaultValue={snapshot.viewer.roleKey}>{roles.map((role) => <option value={role.key} key={role.key}>{role.name}</option>)}</select></label> : <input type="hidden" name="assignedRoleKey" value={snapshot.viewer.roleKey} />}<label>Prazo<input type="date" name="dueDate" /></label><label className="wide">Orientações<textarea name="description" rows={3} maxLength={1000} /></label></div><button className="dashboard-action" disabled={busy}>Criar tarefa</button></form>
      <div className="management-card-list">{snapshot.tasks.map((task) => <article className="management-list-card" key={task.id}><div><span className={`management-status ${task.status}`}>{taskStatusLabels[task.status]}</span><h3>{task.title}</h3><p>{task.description || "Sem orientações adicionais."}</p><small>{task.assignedRoleName}{task.dueDate ? ` • prazo ${formatDate(task.dueDate)}` : ""} • criada por {task.authorName}</small></div><label className="inline-select">Andamento<select disabled={busy} value={task.status} onChange={(event) => void mutate({ action: "task.status", id: task.id, status: event.target.value })}><option value="pending">Pendente</option><option value="in_progress">Em andamento</option><option value="completed">Concluída</option></select></label></article>)}{snapshot.tasks.length === 0 && <p className="management-empty">Nenhuma tarefa cadastrada para o seu perfil.</p>}</div>
    </>
  );
}

function LibraryModule({ snapshot, busy, mutate }: { snapshot: ManagementSnapshot; busy: boolean; mutate: (payload: ActionPayload) => Promise<boolean> }) {
  return (
    <>
      <ModuleHeading eyebrow="SALA DE LEITURA" title="Reservas e empréstimos" description="Acompanhe solicitações, fila, retirada, empréstimo e devolução." />
      <section className="dashboard-panel table-panel"><table className="management-table"><thead><tr><th>ESTUDANTE</th><th>LIVRO</th><th>DATA</th><th>SITUAÇÃO</th></tr></thead><tbody>{snapshot.reservations.map((reservation) => <tr key={reservation.id}><td><strong>{reservation.studentName}</strong><span>{reservation.className} • {reservation.phone}</span></td><td>{reservation.bookTitle}{reservation.queuePosition ? <span>Fila: {reservation.queuePosition}º</span> : null}</td><td>{formatDate(reservation.createdAt)}</td><td><select className="table-select" disabled={busy} value={reservation.status} onChange={(event) => void mutate({ action: "reservation.status", id: reservation.id, status: event.target.value })}>{Object.entries(reservationStatusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></td></tr>)}</tbody></table>{snapshot.reservations.length === 0 && <p className="management-empty">Nenhuma reserva registrada.</p>}</section>
    </>
  );
}

function StaffModule({ snapshot, can, busy, roles, mutate }: { snapshot: ManagementSnapshot; can: (permission: string) => boolean; busy: boolean; roles: ManagementSnapshot["roleOptions"]; mutate: (payload: ActionPayload) => Promise<boolean> }) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const saved = await mutate({ action: "staff.create", displayName: data.get("displayName"), email: data.get("email"), roleKey: data.get("roleKey") });
    if (saved) form.reset();
  }
  return (
    <>
      <ModuleHeading eyebrow="PESSOAS E SEGURANÇA" title="Equipe e acessos" description="Cada profissional usa sua própria conta e recebe somente as ferramentas do cargo." />
      {can("staff.manage") && <form className="management-form compact-form" onSubmit={submit}><div className="form-title"><strong>Autorizar profissional</strong><small>O e-mail precisa ser o mesmo usado no login.</small></div><div className="management-form-grid"><label>Nome completo<input name="displayName" minLength={2} maxLength={100} required /></label><label>E-mail institucional ou autorizado<input type="email" name="email" maxLength={160} required /></label><label>Cargo<select name="roleKey" required defaultValue=""> <option value="" disabled>Selecione</option>{roles.map((role) => <option value={role.key} key={role.key}>{role.name}</option>)}</select></label></div><button className="dashboard-action" disabled={busy}>Autorizar conta</button></form>}
      <div className="staff-management-grid">{snapshot.staff.map((member) => <article className="staff-management-card" key={member.id}><span className="dashboard-user-avatar">{initials(member.displayName)}</span><div><strong>{member.displayName}</strong><small>{member.email}</small><span>{member.roleName}</span><em>{member.active ? "Acesso ativo" : "Acesso desativado"}{member.lastLoginAt ? ` • último login ${formatDate(member.lastLoginAt)}` : ""}</em></div>{can("staff.manage") && member.id !== snapshot.viewer.id && <button className={member.active ? "danger-quiet" : "quiet"} disabled={busy} onClick={() => void mutate({ action: "staff.toggle", id: member.id, active: !member.active })}>{member.active ? "Desativar" : "Reativar"}</button>}</article>)}{snapshot.staff.length === 0 && <p className="management-empty">Nenhum profissional visível para este perfil.</p>}</div>
    </>
  );
}

function RolesModule({ snapshot, busy, mutate }: { snapshot: ManagementSnapshot; busy: boolean; mutate: (payload: ActionPayload) => Promise<boolean> }) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const saved = await mutate({ action: "role.create", name: data.get("name"), key: data.get("key"), description: data.get("description"), permissions: data.getAll("permissions"), responsibilities: String(data.get("responsibilities") ?? "").split("\n").map((item) => item.trim()).filter(Boolean) });
    if (saved) form.reset();
  }
  return (
    <>
      <ModuleHeading eyebrow="CONTROLE DE ACESSO" title="Cargos e permissões" description="Use os perfis prontos ou crie um cargo específico para qualquer função da escola." />
      <form className="management-form" onSubmit={submit}><div className="form-title"><strong>Novo cargo personalizado</strong><small>Comece com o menor acesso necessário e amplie apenas quando preciso.</small></div><div className="management-form-grid"><label>Nome do cargo<input name="name" minLength={2} maxLength={80} required /></label><label>Identificador<input name="key" pattern="[a-z0-9_-]+" placeholder="ex.: inspetor_escolar" /></label><label className="wide">Descrição<input name="description" minLength={8} maxLength={240} required /></label><label className="wide">Responsabilidades (uma por linha)<textarea name="responsibilities" rows={3} maxLength={900} /></label><fieldset className="wide permission-grid"><legend>Permissões deste cargo</legend>{snapshot.permissionCatalog.map((permission) => <label key={permission.key}><input type="checkbox" name="permissions" value={permission.key} />{permission.label}</label>)}</fieldset></div><button className="dashboard-action" disabled={busy}>Salvar cargo</button></form>
      <div className="role-management-grid">{snapshot.roles.map((role) => <article className="role-management-card" key={role.key}><div><span>{role.isSystem ? "Perfil padrão" : "Personalizado"}</span><h3>{role.name}</h3><p>{role.description}</p></div><ul>{role.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul><small>{role.permissions.includes("*") ? "Acesso administrativo completo" : `${role.permissions.length} permissões definidas`}</small></article>)}</div>
    </>
  );
}

function AuditModule({ snapshot }: { snapshot: ManagementSnapshot }) {
  return (
    <>
      <ModuleHeading eyebrow="RASTREABILIDADE" title="Auditoria do sistema" description="Registro das alterações importantes realizadas pelas contas autorizadas." />
      <section className="dashboard-panel table-panel"><table className="management-table audit-table"><thead><tr><th>DATA</th><th>RESPONSÁVEL</th><th>AÇÃO</th><th>ITEM</th></tr></thead><tbody>{snapshot.audit.map((event) => <tr key={event.id}><td>{formatDateTime(event.createdAt)}</td><td>{event.actorName}</td><td><code>{event.action}</code></td><td>{event.entityType}{event.entityId ? ` #${event.entityId}` : ""}</td></tr>)}</tbody></table>{snapshot.audit.length === 0 && <p className="management-empty">Nenhuma ação registrada.</p>}</section>
    </>
  );
}

function ModuleHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="dashboard-heading module-heading"><div><span className="management-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></div>;
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("pt-BR")).join("") || "JD";
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "equipe";
}

function formatDate(value: string) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value.replace(" ", "T") + (value.includes("Z") ? "" : "Z"));
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value.replace(" ", "T") + (value.includes("Z") ? "" : "Z"));
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(date);
}
