export const permissionCatalog = [
  { key: "dashboard.view", label: "Visualizar painel" },
  { key: "posts.read", label: "Consultar avisos e eventos" },
  { key: "notices.manage", label: "Criar e publicar avisos" },
  { key: "events.manage", label: "Criar e publicar eventos" },
  { key: "library.manage", label: "Gerenciar reservas e empréstimos" },
  { key: "tasks.manage", label: "Gerenciar tarefas da equipe" },
  { key: "pedagogy.manage", label: "Gerenciar ações pedagógicas" },
  { key: "routine.manage", label: "Acompanhar a rotina escolar" },
  { key: "staff.read", label: "Consultar equipe e cargos" },
  { key: "staff.manage", label: "Criar e desativar contas" },
  { key: "roles.manage", label: "Criar cargos e permissões" },
  { key: "reports.view", label: "Consultar relatórios" },
  { key: "audit.view", label: "Consultar auditoria" },
] as const;

export type PermissionKey = (typeof permissionCatalog)[number]["key"] | "*";

export type BuiltInRole = {
  key: string;
  name: string;
  description: string;
  responsibilities: string[];
  permissions: PermissionKey[];
};

export const builtInRoles: BuiltInRole[] = [
  {
    key: "direction",
    name: "Direção",
    description: "Administração geral, equipe, publicações, relatórios e configurações da unidade.",
    responsibilities: ["Organização da unidade", "Gestão de usuários e cargos", "Publicações e relatórios"],
    permissions: ["*"],
  },
  {
    key: "vice_direction",
    name: "Vice-direção",
    description: "Acompanhamento da rotina, convivência, eventos e apoio à direção.",
    responsibilities: ["Rotina escolar", "Acolhimento e convivência", "Eventos e comunicados"],
    permissions: ["dashboard.view", "posts.read", "notices.manage", "events.manage", "tasks.manage", "routine.manage", "staff.read", "reports.view"],
  },
  {
    key: "secretary",
    name: "Secretaria",
    description: "Atendimento, organização de comunicados, documentos e apoio aos serviços escolares.",
    responsibilities: ["Atendimento à comunidade", "Avisos e prazos", "Reservas e rotinas administrativas"],
    permissions: ["dashboard.view", "posts.read", "notices.manage", "events.manage", "library.manage", "tasks.manage", "staff.read", "reports.view"],
  },
  {
    key: "coordination",
    name: "Coordenação pedagógica",
    description: "Planejamento pedagógico, acompanhamento de projetos e apoio ao trabalho docente.",
    responsibilities: ["Planejamento pedagógico", "Projetos e calendário", "Acompanhamento das ações de ensino"],
    permissions: ["dashboard.view", "posts.read", "notices.manage", "events.manage", "tasks.manage", "pedagogy.manage", "staff.read", "reports.view"],
  },
  {
    key: "teacher",
    name: "Professor(a)",
    description: "Consulta de comunicados e organização de atividades e projetos pedagógicos permitidos.",
    responsibilities: ["Atividades pedagógicas", "Projetos das turmas", "Consulta de avisos e eventos"],
    permissions: ["dashboard.view", "posts.read", "pedagogy.manage"],
  },
  {
    key: "library",
    name: "Sala de leitura",
    description: "Acervo, reservas, fila, empréstimos, devoluções e avisos da biblioteca.",
    responsibilities: ["Reservas e fila", "Empréstimos e devoluções", "Organização do acervo"],
    permissions: ["dashboard.view", "posts.read", "library.manage", "tasks.manage", "reports.view"],
  },
  {
    key: "technical_admin",
    name: "Administrador técnico",
    description: "Configuração técnica, permissões, auditoria e suporte ao funcionamento do portal.",
    responsibilities: ["Configuração do sistema", "Cargos e permissões", "Auditoria e suporte"],
    permissions: ["dashboard.view", "staff.read", "staff.manage", "roles.manage", "audit.view", "reports.view"],
  },
];

export function hasPermission(permissions: string[], permission: string) {
  return permissions.includes("*") || permissions.includes(permission);
}
