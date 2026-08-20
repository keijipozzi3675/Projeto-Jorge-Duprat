# Arquitetura e perfis

## Superfícies do portal

### Pública

Não exige login. Inclui apresentação da escola, avisos, equipe, contatos, catálogo e solicitação de reserva. O usuário fornece apenas nome, turma e WhatsApp ao reservar.

### Gestão

Exige autenticação. A autorização final deve relacionar o e-mail institucional a um perfil cadastrado.

## Perfis disponíveis

| Perfil | Responsabilidades |
| --- | --- |
| Direção | Usuários e perfis, publicações, relatórios e configurações gerais. |
| Vice-direção | Rotina escolar, convivência, eventos, comunicados e apoio à direção. |
| Secretaria | Matrículas, contatos, documentos, avisos e atendimento. |
| Coordenação pedagógica | Planejamento, projetos, calendário e acompanhamento das ações de ensino. |
| Sala de leitura | Acervo, exemplares, empréstimos, devoluções, reservas e fila. |
| Professor | Consulta de turmas, projetos e comunicados pedagógicos permitidos. |
| Administrador técnico | Configuração do sistema, integrações, auditoria e recuperação. |

O princípio é negar por padrão: cada perfil acessa apenas o necessário. As permissões são verificadas novamente no servidor em toda alteração protegida. A Direção também pode criar cargos personalizados para outras funções da escola.

## Fluxo da biblioteca

1. O estudante escolhe um livro e informa os dados mínimos.
2. A API verifica duplicidade pelo livro e telefone.
3. Se houver exemplar livre, a reserva fica pronta para retirada por dois dias úteis.
4. Se não houver, a solicitação recebe posição na fila.
5. A secretaria vê a atividade no painel e uma notificação é preparada.
6. Na devolução, a primeira pessoa da fila recebe prioridade e prazo de retirada.

## Dados

As tabelas da gestão são `staff_roles`, `staff_users`, `school_posts`, `management_tasks` e `audit_events`. Biblioteca e fila usam `books`, `reservations` e `notifications`.
